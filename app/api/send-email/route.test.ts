// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { beforeAll, beforeEach, describe, expect, it, mock } from "bun:test";

// Resend simulé : aucun courriel ne part pendant les tests.
const envois = [];

mock.module("resend", () => ({
  Resend: class {
    emails = {
      send: async (courriel) => {
        envois.push(courriel);

        return { data: { id: `essai-${envois.length}` }, error: null };
      },
    };
  },
}));

const NBSP = "\u00a0";
let POST;

beforeAll(async () => {
  process.env.EMAIL_FROM = "site@exemple.test";
  process.env.EMAIL_ADMIN = "equipe@exemple.test";
  ({ POST } = await import("./route"));
});

beforeEach(() => {
  envois.length = 0;
});

// Chaque test a sa propre adresse IP publique : la limite d'envoi est gardée
// en mémoire par adresse, d'un test à l'autre.
let compteurIp = 10;

function requete(corps, ip = `41.207.${compteurIp++}.20`) {
  return new Request("http://localhost/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Real-IP": ip },
    body: JSON.stringify(corps),
  });
}

const FORMULAIRE = {
  nom: "Koné",
  prenom: "Awa",
  email: "awa@exemple.test",
  telephone: "05 05 05 05 05",
  message: "Bonjour, une question sur vos horaires.",
};

describe("POST /api/send-email", () => {
  it("sans sujet : message de contact, objet « Message du site »", async () => {
    const reponse = await POST(requete(FORMULAIRE));

    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ success: true });
    expect(envois).toHaveLength(2);
    expect(envois[0].subject).toBe(`Message du site${NBSP}: Awa Koné`);
    expect(envois[0].to).toEqual(["equipe@exemple.test"]);
    expect(envois[0].replyTo).toBe("awa@exemple.test");
    expect(envois[0].html).toContain("Message du site");
    // Accusé de réception au visiteur, sans aucun texte saisi.
    expect(envois[1].to).toEqual(["awa@exemple.test"]);
    expect(envois[1].subject).toBe("Nous avons bien reçu votre message");
    expect(envois[1].html).not.toContain("horaires");
  });

  it("sujet franchise : objet « Demande de franchise »", async () => {
    const reponse = await POST(requete({ ...FORMULAIRE, sujet: "franchise" }));

    expect(reponse.status).toBe(200);
    expect(envois[0].subject).toBe(`Demande de franchise${NBSP}: Awa Koné`);
    expect(envois[0].html).toContain(
      "<strong>Objet :</strong> Demande de franchise",
    );
    expect(envois[1].subject).toBe(
      "Nous avons bien reçu votre demande de franchise",
    );
  });

  it("sujet contact explicite : même objet que sans sujet", async () => {
    await POST(requete({ ...FORMULAIRE, sujet: "contact" }));

    expect(envois[0].subject).toBe(`Message du site${NBSP}: Awa Koné`);
  });

  it("refuse un sujet inconnu, sans rien envoyer", async () => {
    const reponse = await POST(requete({ ...FORMULAIRE, sujet: "commande" }));

    expect(reponse.status).toBe(400);
    expect(envois).toHaveLength(0);
  });

  it("refuse un formulaire incomplet ou illisible", async () => {
    const sansMessage = await POST(requete({ ...FORMULAIRE, message: "" }));
    const telephoneFaux = await POST(
      requete({ ...FORMULAIRE, telephone: "appelez-moi" }),
    );
    const pasDuJson = await POST(
      new Request("http://localhost/api/send-email", {
        method: "POST",
        body: "nom=Koné",
      }),
    );

    expect(sansMessage.status).toBe(400);
    expect(telephoneFaux.status).toBe(400);
    // Pas du JSON : refusé avant même d'être lu (envoi d'un autre site).
    expect(pasDuJson.status).toBe(403);
    expect(envois).toHaveLength(0);
  });

  it("champ piège rempli : réponse normale, aucun courriel", async () => {
    const reponse = await POST(
      requete({
        ...FORMULAIRE,
        sujet: "franchise",
        site_web: "https://robot.test",
      }),
    );

    expect(reponse.status).toBe(200);
    expect(await reponse.json()).toEqual({ success: true });
    expect(envois).toHaveLength(0);
  });

  it("retire les retours à la ligne de l'objet et échappe le HTML", async () => {
    await POST(
      requete({
        ...FORMULAIRE,
        prenom: "Awa\r\nBcc: robot@exemple.test",
        message: "<script>alert(1)</script>",
      }),
    );

    expect(envois[0].subject).not.toMatch(/[\r\n]/);
    expect(envois[0].html).not.toContain("<script>");
    expect(envois[0].html).toContain("&lt;script&gt;");
  });

  it("limite d'envoi : 5 messages par adresse IP en 15 minutes", async () => {
    const ip = "41.207.200.7";
    const statuts = [];

    for (let i = 0; i < 6; i++) {
      statuts.push((await POST(requete(FORMULAIRE, ip))).status);
    }

    expect(statuts).toEqual([200, 200, 200, 200, 200, 429]);
    // 5 messages et leurs 5 accusés ; rien pour le sixième.
    expect(envois).toHaveLength(10);
  });
});

describe("POST /api/send-email : envois venus d'un autre site (recette sécurité I1)", () => {
  const brut = (entetes, corps = FORMULAIRE) =>
    new Request("http://localhost:3099/api/send-email", {
      method: "POST",
      headers: { "X-Real-IP": `41.207.${compteurIp++}.30`, ...entetes },
      body: JSON.stringify(corps),
    });

  it("text/plain (fetch d'un autre site sans contrôle préalable) : 403, rien n'est envoyé", async () => {
    const r = await POST(
      brut({
        "Content-Type": "text/plain;charset=UTF-8",
        Origin: "https://evil.example",
        "Sec-Fetch-Site": "cross-site",
      }),
    );

    expect(r.status).toBe(403);
    expect(envois).toHaveLength(0);
  });

  it("JSON mais d'une autre origine : 403", async () => {
    expect(
      (
        await POST(
          brut({
            "Content-Type": "application/json",
            Origin: "https://evil.example",
            Host: "localhost:3099",
          }),
        )
      ).status,
    ).toBe(403);
    expect(
      (
        await POST(
          brut({
            "Content-Type": "application/json",
            "Sec-Fetch-Site": "same-site",
          }),
        )
      ).status,
    ).toBe(403);
    expect(envois).toHaveLength(0);
  });

  it("le formulaire du site (même origine, ou www) passe", async () => {
    const r1 = await POST(
      brut({
        "Content-Type": "application/json",
        Origin: "http://localhost:3099",
        Host: "localhost:3099",
        "Sec-Fetch-Site": "same-origin",
      }),
    );
    const r2 = await POST(
      brut({
        "Content-Type": "application/json",
        Origin: "https://www.chicken-nation.com",
        Host: "127.0.0.1:3000",
      }),
    );

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });
});
