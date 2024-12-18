import resend from "@/lib/resend";
import type { User } from "@/db/schema";
export async function sendAdminNotification(user: User) {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_SEND || "Acme <no_reply@updates.askair.ai>",
      to: ["connect@askair.ai", "mathis.obadia@gmail.com"],
      subject: "AskAir - New User Registration",
      text: `A new user has registered: ${user.email}`,
    });
  } catch (error) {
    console.error("Error sending new user notification:", error);
  }
}
