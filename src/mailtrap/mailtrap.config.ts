import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN;

if (!TOKEN) {
  throw new Error("MAILTRAP_TOKEN is not defined in environment variables.");
}

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender: { email: string; name: string } = {
  email: "noreply@miteshagrawal.tech",
  name: "Mitesh Agrawal",
};
