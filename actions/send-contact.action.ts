"use server";

import { Resend } from "resend";
import { EmailTemplate } from "@/emails/email-contact-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(formData: FormData) {
    
  
  const nom = String(formData.get("nom"));
  const prenom = String(formData.get("prenom"));
  const email = String(formData.get("email"));
  const tel = Number(formData.get("telephone"));
  const message = String(formData.get("message"));

  console.log(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Chicken Nation <onboarding@resend.dev>",
      to: [email],
      subject: "Bienvenue chez Chicken Nation !",
      react: await EmailTemplate({ nom, prenom, email, tel, message }),
    });

    if (error) {
      throw new Error("Email non envoyé");
    }

    return data;
  } catch (error) {
    return { status: 500, message: error };
  }
}
