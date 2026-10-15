import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 1025),
});

// Local dev: open Mailpit at http://localhost:8025 to read sent mail.
export function sendMail(to: string, subject: string, html: string) {
  return transport.sendMail({ from: process.env.MAIL_FROM, to, subject, html });
}
