import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, avatar } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    // 既に持ってるかチェック
    const alreadyOwned = user.ownedAvatars.includes(avatar);
    if (alreadyOwned) {
      return NextResponse.json({ success: true, message: 'Already owned' });
    }

    // 新しいアバターを追加
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ownedAvatars: { push: avatar },
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: 'Failed to unlock avatar' }, { status: 500 });
  }
}
