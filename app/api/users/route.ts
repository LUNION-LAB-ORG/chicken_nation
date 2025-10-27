import { NextRequest, NextResponse } from "next/server";
import { IUtilisateur, UtilisateurStatus, UtilisateurRole } from "@/features/utilisateur/types/utilisateur.type";
import { PaginatedResponse } from "@/types/api.type";
import { UtilisateurAddDTO } from "@/features/utilisateur/schema/utilisateur.schema";
import { users } from "./data";

export async function GET(req: NextRequest) {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
    const page = Number(searchParams.page ?? 1);
    const limit = Number(searchParams.limit ?? 5);
    const offset = (page - 1) * limit;
    let filteredUsers = users;

    if (searchParams.status) {
        filteredUsers = filteredUsers.filter((user) => user.status === searchParams.status);
    }

    if (searchParams.role) {
        filteredUsers = filteredUsers.filter((user) => user.role === searchParams.role);
    }

    if (searchParams.firstName) {
        filteredUsers = filteredUsers.filter((user) => user.firstName.toLowerCase().includes(searchParams.firstName.toLowerCase()));
    }

    if (searchParams.lastName) {
        filteredUsers = filteredUsers.filter((user) => user.lastName.toLowerCase().includes(searchParams.lastName.toLowerCase()));
    }

    if (searchParams.email) {
        filteredUsers = filteredUsers.filter((user) => user.email.toLowerCase().includes(searchParams.email.toLowerCase()));
    }

    if (searchParams.phoneNumber) {
        filteredUsers = filteredUsers.filter((user) => user.phoneNumber.toLowerCase().includes(searchParams.phoneNumber.toLowerCase()));
    }

    const response: PaginatedResponse<IUtilisateur> = {
        data: filteredUsers.slice(offset, offset + limit),
        meta: {
            total: filteredUsers.length,
            page,
            limit,
            totalPages: Math.ceil(filteredUsers.length / limit),
        }
    };

    return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as UtilisateurAddDTO;

        const newUser: IUtilisateur = {
            id: new Date().toISOString(),
            email: body.email,
            firstName: body.firstName,
            lastName: body.lastName,
            phoneNumber: body.phoneNumber,
            role: UtilisateurRole.AGENT,
            status: UtilisateurStatus.ACTIVE,
            isPasswordChangeRequired: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: "",
        };

        users.push(newUser);

        return NextResponse.json({
            ...newUser,
            generatedPassword: "Random123!",
        });
    } catch (error) {
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
