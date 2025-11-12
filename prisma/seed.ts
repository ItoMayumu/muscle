// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // テスト用ユーザー作成
  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'test@example.com',
      exp: 100,
      level: 2,
    },
  });

  // トレーニング履歴を追加
  await prisma.workout.createMany({
    data: [
      { userId: user.id, type: 'ベンチプレス', weight: 60, reps: 10, expGain: 60 },
      { userId: user.id, type: 'スクワット', weight: 80, reps: 12, expGain: 96 },
    ],
  });

  console.log('✅ Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
