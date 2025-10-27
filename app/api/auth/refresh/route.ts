import { NextRequest, NextResponse } from "next/server";
import { IRefreshTokenResponse } from "@/features/auth/types/auth.type";

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ message: "Missing token" }, { status: 400 });
    }

    // TODO: vérifier le refresh token et régénérer un access token
    const response: IRefreshTokenResponse = {
      accessToken: "NEW_ACCESS_TOKEN_EXAMPLE",
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
