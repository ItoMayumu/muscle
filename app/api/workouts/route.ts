import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const EXP_PER_KG_REP = 0.2;
const EXP_TO_NEXT_LEVEL = 100;

export async function GET(req: Request) {
  const {searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const workouts = await prisma.workout.findMany({
    where: { userId },
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
    const newBadges = await checkAndAwardBadges(userId);

    return NextResponse.json({
      workout,
      updatedUser,
      leveledUp,
      newBadges,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to record workout' }, { status: 500 });
  }
}

// 🎯 実績バッジチェック関数
async function checkAndAwardBadges(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { workouts: true } });
  if (!user) return [];

  const newBadges: string[] = [];

  // 1️⃣ 初トレーニング
  if (user.workouts.length === 1 && !user.badges.includes("初トレーニング")) {
    newBadges.push("初トレーニング");
  }

  // 2️⃣ 7日連続
  const sorted = user.workouts.map(w => w.createdAt).sort();
  const streak = sorted.reduce((acc, date, i) => {
    if (i === 0) return 1;
    const diff = (sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 1.5 ? acc + 1 : 1;
  }, 1);
  if (streak >= 7 && !user.badges.includes("継続の鬼")) {
    newBadges.push("継続の鬼");
  }

  // 3️⃣ Lv10到達
  if (user.level >= 10 && !user.badges.includes("筋肉王")) {
    newBadges.push("筋肉王");
  }

  if (newBadges.length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        badges: { push: newBadges },
      },
    });
  }

  return newBadges;
}
