import nodemailer from "nodemailer";

const topics = {
  motor: "Ubezpieczenia komunikacyjne",
  property: "Ubezpieczenia majątkowe",
  life: "Ubezpieczenia życiowe",
  health: "Ubezpieczenia zdrowotne",
  business: "Ubezpieczenia firmowe",
  other: "Inny temat"
};

const attempts = new Map();
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT = 5;

function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (attempts.get(ip) || []).filter((time) => now - time < RATE_WINDOW);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export async function POST(request) {
  const allowedOrigins = new Set([
    process.env.SITE_ORIGIN,
    "https://www.asperion.pl",
    "https://asperion.pl"
  ].filter(Boolean));
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) return json({ ok: false }, 403);

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) return json({ ok: false, code: "rate_limit" }, 429);

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return json({ ok: false }, 415);

  let data;
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return json({ ok: false }, 413);
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false }, 400);
  }

  if (clean(data.website)) return json({ ok: true });

  const name = clean(data.name);
  const email = clean(data.email).toLowerCase();
  const topic = clean(data.topic);
  const message = clean(data.message);
  const lang = data.lang === "en" ? "EN" : "PL";
  const emailPattern = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;

  if (
    name.length < 2 || name.length > 100 ||
    !emailPattern.test(email) || email.length > 254 ||
    !Object.hasOwn(topics, topic) ||
    message.length < 10 || message.length > 3000 ||
    data.consent !== true
  ) {
    return json({ ok: false, code: "validation" }, 400);
  }

  const requiredEnvironment = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS"];
  if (requiredEnvironment.some((key) => !process.env[key])) {
    console.error("Contact form: missing SMTP environment configuration");
    return json({ ok: false, code: "configuration" }, 503);
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000
  });

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br>");
  const topicLabel = topics[topic];
  const recipient = process.env.SMTP_TO || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `ASPERION <${process.env.SMTP_USER}>`,
      to: recipient,
      replyTo: { name, address: email },
      subject: `[asperion.pl] ${topicLabel} — ${name}`,
      text: `Nowe zapytanie z asperion.pl\n\nImię i nazwisko: ${name}\nE-mail: ${email}\nTemat: ${topicLabel}\nJęzyk strony: ${lang}\n\nWiadomość:\n${message}`,
      html: `<div style="font-family:Arial,sans-serif;color:#24150f;line-height:1.55"><h2 style="margin:0 0 20px">Nowe zapytanie z asperion.pl</h2><p><strong>Imię i nazwisko:</strong> ${safeName}<br><strong>E-mail:</strong> ${safeEmail}<br><strong>Temat:</strong> ${escapeHtml(topicLabel)}<br><strong>Język strony:</strong> ${lang}</p><p><strong>Wiadomość:</strong><br>${safeMessage}</p></div>`
    });
    return json({ ok: true });
  } catch (error) {
    console.error("Contact form SMTP error:", error?.code || error?.message || "unknown");
    return json({ ok: false, code: "send_failed" }, 502);
  }
}

export function GET() {
  return json({ ok: false }, 405);
}
