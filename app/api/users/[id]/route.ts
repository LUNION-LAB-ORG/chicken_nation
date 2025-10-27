import { NextRequest } from "next/server";

export async function DELETE(_: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    const { id } = await ctx.params;

    return Response.json({
        success: true,
        message: "Utilisateur supprimé avec succès.",
        id,
    });
}
