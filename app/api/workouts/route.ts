import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EXP_PER_KG_REP = 0.2;
const EXP_TO_NEXT_LEVEL = 100;

export async function GET() {
  const workouts = await prisma.workout.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(workouts);
}

export async function POST(req: Request) {
  try {
    const { userId, type, weight, reps } = await req.json();
    const expGain = Math.floor(weight * reps * EXP_PER_KG_REP);

    // ユーザーを取得
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 新しい経験値とレベルを計算
    const newExp = user.exp + expGain;
    const oldLevel = user.level;
    const newLevel = Math.floor(newExp / EXP_TO_NEXT_LEVEL) + 1;

    // Workout登録
    const workout = await prisma.workout.create({
      data: {
        userId,
        type,
        weight,
        reps,
        expGain,
      },
    });

    // User更新
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        exp: newExp,
        level: newLevel,
      },
    });

    const leveledUp = newLevel > oldLevel;

    // 🎁 レベルアップ報酬処理（報酬チケット付与）
    if (leveledUp) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          rewards: { push: `Lv.${newLevel}報酬チケット` },
        },
      });
    }

    return NextResponse.json({
      workout,
      updatedUser,
      leveledUp,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record workout' }, { status: 500 });
  }
}
