import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { userId, ticket } = await req.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const current = user.rewards || [];
    if (!current.includes(ticket)) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        rewards: {
          set: current.filter((r) => r !== ticket), // 🎫 チケット消費
        },
      },
    });

    return NextResponse.json({ success: true, updated });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to use ticket' }, { status: 500 });
  }
}
