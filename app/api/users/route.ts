// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST: 新しいユーザーを作成
export async function POST(request: Request) {
  const body = await request.json();
  const { name, email } = body;

  if (!name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    return NextResponse.json(user);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'User creation failed' }, { status: 500 });
  }
}

// GET: 全ユーザー取得
export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      level: true,
      exp: true,
      avatar: true,
      ownedAvatars: true, // ✅ ここを忘れずに！
    },
  });
  return NextResponse.json(users);
}
