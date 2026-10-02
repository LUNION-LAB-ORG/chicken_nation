/**
 * Adresse IP du visiteur, lue dans les en-têtes posés par nginx devant le
 * site. Sert aux limites par adresse : celle de l'API (demandes de code) et
 * celle du formulaire de contact (app/api/send-email).
 *
 * X-Real-IP d'abord : nginx l'écrase avec l'adresse réelle. Sinon la DERNIÈRE
 * adresse de X-Forwarded-For, celle qu'ajoute nginx : les précédentes viennent
 * du visiteur lui-même et peuvent être inventées. Une adresse privée ou locale
 * (passerelle Docker, nginx) n'identifie personne : null.
 *
 * ⚠️ Le vhost nginx du site doit poser `proxy_set_header X-Real-IP
 * $remote_addr;` : sans lui, un visiteur peut envoyer son propre X-Real-IP.
 */
export function adresseIpVisiteur(lire: (nom: string) => string | null | undefined): string | null {
  const brute = lire("x-real-ip")?.trim() || lire("x-forwarded-for")?.split(",").pop()?.trim();
  const ip = brute?.replace(/^::ffff:/i, "");
  if (!ip || !/^[0-9a-fA-F:.]{3,45}$/.test(ip)) return null;
  return nIdentifiePersonne(ip) ? null : ip;
}

/** Adresse privée, locale, de bouclage ou illisible. */
function nIdentifiePersonne(ip: string): boolean {
  if (ip.includes(".")) {
    const octets = ip.split(".").map((o) => Number(o));
    if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) return true;
    const [a, b] = octets;
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) || // réseau partagé (Tailscale, opérateurs)
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || // dont les passerelles Docker
      (a === 192 && b === 168)
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6);
}
