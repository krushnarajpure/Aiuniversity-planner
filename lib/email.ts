import "server-only";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  if (!host || !user || !password) throw new Error("SMTP is not configured");
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass: password } });
}

export async function sendVerificationEmail({ email, name, token }: { email: string; name: string; token: string }) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!baseUrl || !from) throw new Error("NEXTAUTH_URL or SMTP_FROM is not configured");
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await getTransporter().sendMail({
    from: `AI University <${from}>`,
    to: email,
    subject: "Verify your AI University email",
    text: `Welcome to AI University, ${name}!\n\nPlease verify your email address to activate your account:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Welcome to AI University!</h2><p>Please verify your email address to activate your account.</p><p><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px">Verify Email</a></p><p>This link expires in 24 hours.</p></div>`,
  });
}