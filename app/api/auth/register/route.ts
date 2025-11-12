// app/api/auth/register/route.ts
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, password } = await req.json();

    if (!name || !password) {
      return NextResponse.json({ error: "ユーザー名とパスワードを入力してください" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { name },
    });

    if (existingUser) {
      return NextResponse.json({ error: "このユーザー名はすでに使われています" }, { status: 400 });
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
        exp: 0,
        level: 1,
        avatar: "/avatars/level1.png",
        ownedAvatars: ["/avatars/level1.png"],
      },
    });

    return NextResponse.json({ message: "登録完了", user });
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
