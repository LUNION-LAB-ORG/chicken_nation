import { NextRequest, NextResponse } from "next/server";
import { LoginDTO } from "@/features/auth/schemas/auth.schema";
import { ILoginResponse } from "@/features/auth/types/auth.type";
import { UtilisateurRole, UtilisateurStatus } from "@/features/utilisateur/types/utilisateur.type";

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as LoginDTO;

        // TODO: Vérification email/mot de passe en DB

        // Exemple fictif
        if (body.email === "admin@test.com" && body.password === "password") {

            const response: ILoginResponse = {
                user: {
                    id: "1",
                    email: body.email,
                    firstName: "Admin",
                    lastName: "Test",
                    phoneNumber: "0123456789",
                    role: UtilisateurRole.ADMIN,
                    status: UtilisateurStatus.ACTIVE,
                    isPasswordChangeRequired: false,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    deletedAt: "",
                },
                accessToken: "ACCESS_TOKEN_EXAMPLE",
                refreshToken: "REFRESH_TOKEN_EXAMPLE",
            };

            return NextResponse.json(response);
        }

        return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
    }
}
