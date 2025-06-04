import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const { nom, prenom, email, telephone, message } = body;

    const data = await resend.emails.send({
      from: 'info@chicken-nation.com', // ⚠️ Doit être vérifié sur resend.com
      to: 'ababtest222@gmail.com',
      subject: `Nouveau message de ${prenom} ${nom}`,
      html: `
        <p><strong>Nom :</strong> ${nom}</p>
        <p><strong>Prénom :</strong> ${prenom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Téléphone :</strong> ${telephone}</p>
        <p><strong>Message :</strong></p>
        <p>${message}</p>
      `,
    });
    console.log("Réponse Resend :", data);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erreur Resend :', error);
    return Response.json({ success: false, error });
  }
}
