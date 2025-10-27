import { NextRequest } from "next/server";
import { UtilisateurUpdateDTO } from "@/features/utilisateur/schema/utilisateur.schema";
import { users } from "../../data"


export async function GET(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    const { id } = await ctx.params;
    const user = users.find((user) => user.id === id);
    return Response.json(user);
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    const { id } = await ctx.params;
    const user = users.find((user) => user.id === id);

    try {
        const body = (await req.json()) as UtilisateurUpdateDTO;

        return Response.json({
            ...user,
            ...body,
            updatedAt: new Date().toISOString(),
        });
    } catch (error) {
        return Response.json({ error: "Something went wrong" }, { status: 500 });
    }
}
