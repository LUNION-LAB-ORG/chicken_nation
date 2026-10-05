// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import Image from "./Image";

describe("Image du site (attributs de next/image, sans composant client)", () => {
  it("image optimisée par Next, différée par défaut", () => {
    const html = renderToStaticMarkup(
      <Image
        alt="Seau"
        height={700}
        sizes="240px"
        src="/assets/site/seau.webp"
        width={586}
      />,
    );

    expect(html).toMatch(/^<img /);
    expect(html).toContain('alt="Seau"');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('data-nimg="1"');
    expect(html).toContain('sizes="240px"');
    expect(html).toContain(
      "/_next/image?url=%2Fassets%2Fsite%2Fseau.webp&amp;w=",
    );
  });

  it("remplissage du parent et chargement immédiat", () => {
    const html = renderToStaticMarkup(
      <Image
        fill
        alt=""
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        src="/assets/site/fond-salle.webp"
      />,
    );

    expect(html).toContain('data-nimg="fill"');
    expect(html).toContain("position:absolute");
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
  });

  it("image préchargée : jamais différée", () => {
    const html = renderToStaticMarkup(
      <Image
        preload
        alt="Seau"
        height={700}
        sizes="240px"
        src="/assets/site/seau.webp"
        width={586}
      />,
    );

    expect(html).not.toContain('loading="lazy"');
  });
});
