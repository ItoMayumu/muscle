// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST: 新しいユーザーを作成
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: { name },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
  }
}



export async function GET() {
  const session = await getServerSession(authOptions);

  console.log("🟢 Session data:", session); // ← ここ！

  if (!session?.user?.name) {
    console.log("🔴 No session or user name");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { name: session.user.name },
  });

  console.log("🟢 Found user:", user); // ← ここ！

  return NextResponse.json(user);
}