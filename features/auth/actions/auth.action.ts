"use server";

import { auth, signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginDTO, loginSchema } from "../schemas/auth.schema";
import { processAndValidateFormData } from "ak-zod-form-kit";
import { authAPI } from "../apis/auth.api";
import { ActionResponse } from "@/types/api.type";
import { handleServerActionError } from "@/utils/handleServerActionError";

export async function login(
  formdata: LoginDTO
): Promise<ActionResponse<void>> {
  // Validation des données
  const result = processAndValidateFormData(loginSchema, formdata, {
    outputFormat: "object",
  });

  if (!result.success) {
    return {
      success: false,
      message: result.errorsInString,
    };
  }
  // 1️⃣ Premier essai avec Auth.js pour la gestion de session
  try {
    await signIn("credentials", {
      ...result.data,
      redirect: false,
    });

    return {
      success: true,
      message: "Connexion réussie.",
    };
  } catch (error) {
    // 2️⃣ Si Auth.js échoue, on essaie directement l'API pour avoir la vraie réponse
    try {
      await authAPI.login(result.data as LoginDTO);

      await signIn("credentials", {
        ...result.data,
        redirect: false,
      });

      return {
        success: true,
        message: "Connexion réussie.",
      };
    } catch (error) {
      // 3️⃣ Si l'API échoue, on retourne l'erreur
      return handleServerActionError(error, "Erreur lors de la connexion");
    }
  }
}

export async function refresh() {
  const session = await auth();

  if (!session?.user?.accessToken) {
    return {
      success: false,
      message: "Aucune session ou token trouvé",
    };
  }

  return {
    success: true,
    message: "Rafraîchissement du jeton d'accès réussi.",
  };
}

export async function logout() {
  await signOut({ redirect: false });
  redirect("/");
}
