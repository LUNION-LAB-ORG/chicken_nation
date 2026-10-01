import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

const contactSchema = z.object({
  nom: z.string().trim().min(1).max(80),
  prenom: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  telephone: z.string().trim().min(6).max(30).regex(/^[0-9+().\s-]+$/),
  message: z.string().trim().min(2).max(3000),
  // Champ piège : invisible pour un humain, rempli par les robots.
  site_web: z.string().optional(),
});

// Limite d'envoi en mémoire (un seul conteneur en prod) : par adresse IP
// et au total, pour qu'un robot ne puisse pas vider le quota Resend.
const FENETRE_MS = 15 * 60 * 1000;
const MAX_PAR_IP = 5;
const MAX_TOTAL = 60;
const envois = new Map<string, number[]>();

function depasseLaLimite(cle: string, max: number) {
  const maintenant = Date.now();
  const recents = (envois.get(cle) ?? []).filter((t) => maintenant - t < FENETRE_MS);
  if (recents.length >= max) {
    envois.set(cle, recents);
    return true;
  }
  recents.push(maintenant);
  envois.set(cle, recents);
  return false;
}

function adresseIp(req: Request) {
  const transmise = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return transmise || req.headers.get('x-real-ip') || null;
}

function echapper(texte: string) {
  return texte
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ success: false }, { status: 400 });
  }

  const { nom, prenom, email, telephone, message, site_web } = parsed.data;

  // Robot détecté : on répond comme si tout allait bien, sans rien envoyer.
  if (site_web) {
    return Response.json({ success: true });
  }

  // Sans adresse IP (nginx ne la transmet pas), seule la limite globale
  // s'applique : une clé commune bloquerait tous les visiteurs ensemble.
  const ip = adresseIp(req);
  if ((ip && depasseLaLimite(`ip:${ip}`, MAX_PAR_IP)) || depasseLaLimite('total', MAX_TOTAL)) {
    return Response.json({ success: false, reason: 'rate_limited' }, { status: 429 });
  }

  const e = {
    nom: echapper(nom),
    prenom: echapper(prenom),
    email: echapper(email),
    telephone: echapper(telephone),
    message: echapper(message).replace(/\n/g, '<br />'),
  };

  try {
    // Resend ne lève pas d'exception en cas d'échec : il renvoie `error`.
    const versAdmin = await resend.emails.send({
      from: `Chicken Nation <${process.env.EMAIL_FROM}>`,
      to: [process.env.EMAIL_ADMIN!],
      subject: `Nouveau message de ${prenom} ${nom}`.replace(/[\r\n]+/g, ' '),
      replyTo: email,
      html: `
        <p><strong>Nom :</strong> ${e.nom}</p>
        <p><strong>Prénom :</strong> ${e.prenom}</p>
        <p><strong>Email :</strong> ${e.email}</p>
        <p><strong>Téléphone :</strong> ${e.telephone}</p>
        <p><strong>Message :</strong></p>
        <p>${e.message}</p>
      `,
    });
    if (versAdmin.error) throw versAdmin.error;

    // Accusé de réception volontairement sans aucun texte saisi dans le
    // formulaire : sinon n'importe qui pourrait faire envoyer, au nom de
    // Chicken Nation, le contenu de son choix à l'adresse de son choix.
    await resend.emails.send({
      from: `Chicken Nation <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: 'Nous avons bien reçu votre message',
      replyTo: process.env.EMAIL_ADMIN,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2>Bonjour,</h2>
          <p>Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
          <p>Notre équipe reviendra vers vous dans les plus brefs délais.</p>
          <p>Bien à vous,</p>
          <p><strong>L’équipe Chicken Nation</strong></p>
        </div>
      `,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Erreur Resend :', error);
    return Response.json({ success: false }, { status: 500 });
  }
}
