import nodemailer from 'nodemailer';

async function createTransporter() {
    while (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Waiting for SMTP_USER and SMTP_PASS to load...");
      await new Promise((res) => setTimeout(res, 100)); 
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    try {
      await transporter.verify();
      console.log("Email transporter verified and ready to send emails");
    } catch (err) {
      console.error("Email transporter verification failed:", err.message);
    }
    return transporter;
}

export default async function sendMail({ to, subject, html, text }) {
  const t = await createTransporter();
  if (!t) {
    return { logged: true };
  }
  const info = await t.sendMail({
    from: `"App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    text
  });
  return info;
}
