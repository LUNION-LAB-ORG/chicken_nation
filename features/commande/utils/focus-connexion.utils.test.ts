// @ts-nocheck -- lancé par `bun test` (intégré à Bun) : ses types ne sont pas installés dans le site.
import { describe, expect, it } from "bun:test";

import {
  demanderFocusConnexion,
  prendreFocusConnexion,
} from "./focus-connexion.utils";

describe("focus après déconnexion", () => {
  it("vaut une seule fois après une demande, jamais sans demande", () => {
    expect(prendreFocusConnexion()).toBe(false);
    demanderFocusConnexion();
    expect(prendreFocusConnexion()).toBe(true);
    expect(prendreFocusConnexion()).toBe(false);
  });
});
