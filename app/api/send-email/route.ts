import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { nom, prenom, email, telephone, message } = body;

    await resend.emails.send({
      from: `Chicken Nation <${process.env.EMAIL_FROM}>`,
      to: [process.env.EMAIL_ADMIN!],
      subject: `Nouveau message de ${prenom} ${nom}`,
      replyTo: email, // 👈 ici on redirige la réponse vers l’expéditeur du formulaire
      html: `
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Prénom :</strong> ${prenom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });

    await resend.emails.send({
      from: `Chicken Nation <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: `Merci pour votre message, ${prenom} !`,
      replyTo: process.env.EMAIL_ADMIN, // 👈 ici on redirige la réponse vers l’expéditeur du formulaire
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>Bonjour ${prenom},</h2>
          <p>Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
          <p>Notre équipe reviendra vers vous dans les plus brefs délais.</p>
    
          <hr />
    
          <p><strong>Récapitulatif de votre message :</strong></p>
          <p><strong>Nom :</strong> ${nom}</p>
          <p><strong>Prénom :</strong> ${prenom}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${telephone}</p>
          <p><strong>Message :</strong></p>
          <p>${message}</p>
    
          <hr />
    
          <p>En attendant, vous pouvez visiter notre site ou nous suivre sur nos réseaux sociaux.</p>
          <p>Bien à vous,</p>
          <p><strong>L’équipe Chicken Nation</strong></p>
        </div>
      `,
    });
    

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erreur Resend :', error);
    return Response.json({ success: false, error });
  }
}
