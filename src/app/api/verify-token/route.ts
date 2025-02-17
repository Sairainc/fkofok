import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "IDトークンが必要です" },
        { status: 400 }
      );
    }

    // LINEのIDトークン検証APIを呼び出す
    const response = await axios.post("https://api.line.me/oauth2/v2.1/verify", null, {
      params: {
        id_token: idToken,
        client_id: process.env.LIFF_CHANNEL_ID, // チャネルIDを使用（チャネルシークレットではない）
      },
    });

    const decodedToken = response.data;

    return NextResponse.json({
      userId: decodedToken.sub, // LINEのユーザーID
      name: decodedToken.name, // ユーザー名
      picture: decodedToken.picture, // プロフィール画像
      email: decodedToken.email || "未取得",
    });
  } catch (error: unknown) {
    console.error("Token verification error:", error instanceof Error ? error.message : error);

    return NextResponse.json(
      { error: "トークン検証に失敗しました" },
      { status: 401 }
    );
  }
}
