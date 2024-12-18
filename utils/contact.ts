"use server";

import { z } from "zod";
import { Resend } from "resend";
import { ContactFormEmail } from "@/emails/contactFormEmail";
const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function sendContactForm(data: z.infer<typeof formSchema>) {
  console.log(data);
  const result = formSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid form data");
  }

  try {
    const { name, email, message } = result.data;

    await resend.emails.send({
      from: "Contact Form <no-reply@updates.askair.ai>",
      to: ["connect@askair.ai"],
      cc: [email],
      bcc: ["mathis.obadia@gmail.com"],
      subject: "ASKAIR - New Contact Form Submission",
      react: ContactFormEmail({ name, email, message }),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send contact form");
  }
}
