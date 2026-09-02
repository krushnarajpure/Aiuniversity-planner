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

export async function sendPasswordResetEmail({ email, name, token }: { email: string; name: string; token: string }) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!baseUrl || !from) throw new Error("NEXTAUTH_URL or SMTP_FROM is not configured");
  const resetUrl = `${baseUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  await getTransporter().sendMail({
    from: `AI University <${from}>`,
    to: email,
    subject: "Reset your AI University password",
    text: `Hello ${name},\n\nReset your AI University password here:\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6"><h2>Password reset</h2><p>Hello ${name},</p><p>Use the button below to choose a new password.</p><p><a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 18px;text-decoration:none;border-radius:6px">Reset Password</a></p><p>This link expires in 1 hour. If you did not request this, ignore this email.</p></div>`,
  });
}

export async function sendOrganizationVerificationEmail({ email, companyName, recruiterName, token }: { email: string; companyName: string; recruiterName: string; token: string }) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!baseUrl || !from) throw new Error("NEXTAUTH_URL or SMTP_FROM is not configured");
  const verifyUrl = `${baseUrl.replace(/\/$/, "")}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
  await getTransporter().sendMail({
    from: `AI University Recruitment <${from}>`,
    to: email,
    subject: `Verify ${companyName} Organization Account - AI University`,
    text: `Hello ${recruiterName},\n\nThank you for registering ${companyName} with AI University Placement Portal.\n\nPlease verify your email address to complete the registration:\n${verifyUrl}\n\nAfter verification, your organization profile will be reviewed by our administrators.\n\nThis link expires in 24 hours.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
      <h2 style="color:#2563eb">Welcome to AI University Recruitment Portal!</h2>
      <p>Hello ${recruiterName},</p>
      <p>Thank you for registering <strong>${companyName}</strong> with AI University Placement Portal.</p>
      <p>Please verify your email address to complete the registration process:</p>
      <p style="margin:24px 0"><a href="${verifyUrl}" style="background:#2563eb;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Verify Organization Email</a></p>
      <p style="color:#666;font-size:14px">After verification, your organization profile will be reviewed by our administrators. You'll receive an email notification once the review is complete.</p>
      <p style="color:#666;font-size:12px">This link expires in 24 hours.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#666;font-size:12px">If you did not register for this account, please contact our support team.</p>
    </div>`,
  });
}

export async function sendOrganizationApprovedEmail({ email, companyName, recruiterName }: { email: string; companyName: string; recruiterName: string }) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!baseUrl || !from) throw new Error("NEXTAUTH_URL or SMTP_FROM is not configured");
  const loginUrl = `${baseUrl.replace(/\/$/, "")}/login`;
  await getTransporter().sendMail({
    from: `AI University Recruitment <${from}>`,
    to: email,
    subject: `${companyName} Registration Approved - AI University`,
    text: `Hello ${recruiterName},\n\nGreat news! Your organization ${companyName} has been approved by our administrators.\n\nYou can now login to access the AI University Placement Portal and post job openings.\n\nLogin here: ${loginUrl}\n\nYour organization email: ${email}\n\nWelcome to the AI University Recruitment community!`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
      <h2 style="color:#059669">Registration Approved! 🎉</h2>
      <p>Hello ${recruiterName},</p>
      <p>Great news! Your organization <strong>${companyName}</strong> has been approved by our administrators.</p>
      <p>You can now login to access the AI University Placement Portal and start posting job openings.</p>
      <p style="margin:24px 0"><a href="${loginUrl}" style="background:#059669;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">Login Now</a></p>
      <p style="color:#666;font-size:14px"><strong>Organization Email:</strong> ${email}</p>
      <p style="color:#666;font-size:14px">Welcome to the AI University Recruitment community!</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#666;font-size:12px">If you have any questions, please contact our support team.</p>
    </div>`,
  });
}

export async function sendOrganizationRejectedEmail({ email, companyName, recruiterName, reason }: { email: string; companyName: string; recruiterName: string; reason?: string }) {
  const baseUrl = process.env.NEXTAUTH_URL;
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!baseUrl || !from) throw new Error("NEXTAUTH_URL or SMTP_FROM is not configured");
  await getTransporter().sendMail({
    from: `AI University Recruitment <${from}>`,
    to: email,
    subject: `Registration Status - ${companyName} - AI University`,
    text: `Hello ${recruiterName},\n\nThank you for your interest in joining AI University Placement Portal.\n\nUnfortunately, your organization registration was not approved at this time.${reason ? `\n\nReason: ${reason}` : ""}\n\nPlease contact our support team if you have any questions about this decision.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;max-width:600px">
      <h2 style="color:#dc2626">Registration Status Update</h2>
      <p>Hello ${recruiterName},</p>
      <p>Thank you for your interest in joining AI University Placement Portal.</p>
      <p>Unfortunately, your organization registration was not approved at this time.</p>
      ${reason ? `<div style="background:#fee2e2;border-left:4px solid #dc2626;padding:12px;margin:20px 0;border-radius:4px">
        <p style="color:#7f1d1d;margin:0"><strong>Reason for rejection:</strong></p>
        <p style="color:#7f1d1d;margin:8px 0 0 0">${reason}</p>
      </div>` : ""}
      <p style="color:#666;font-size:14px">Please contact our support team if you have any questions about this decision or would like to reapply.</p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
      <p style="color:#666;font-size:12px">Thank you for your understanding.</p>
    </div>`,
  });
}