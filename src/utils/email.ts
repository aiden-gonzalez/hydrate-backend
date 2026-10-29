import nodemailer from "nodemailer";

// Email is sent over SMTP so any provider works (e.g. Brevo / Resend free tiers, or a Gmail app password).
// Configure with SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and EMAIL_FROM.
let transporter: nodemailer.Transporter;

export function isEmailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.EMAIL_FROM);
}

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const port = parseInt(process.env.SMTP_PORT ?? "587");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: port,
      secure: port === 465, // implicit TLS on 465, STARTTLS otherwise
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(email: string, code: string): Promise<void> {
  if (!isEmailConfigured()) {
    // Never log the code itself outside of tests: anyone with log access could take over the account
    console.warn("Email is not configured (SMTP_* / EMAIL_FROM), password reset email was not sent");
    return;
  }

  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Your hydRate password reset code",
    text: `Your hydRate password reset code is: ${code}\n\n`
      + "Enter it in the app within 15 minutes to choose a new password.\n\n"
      + "If you didn't ask to reset your password, you can ignore this email.",
  });
}
