"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";

// 内側：実際の画面ロジック
function RewardPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const oldLevel = Number(params.get("oldLevel")) || 0;
  const newLevel = Number(params.get("newLevel")) || oldLevel + 1;
  const expGain = Number(params.get("expGain")) || 0;
  const userId = session?.user?.id ?? null;

  const [newAvatar, setNewAvatar] = useState<string | null>(null);

  // レベルアップに応じて新アバターを解放
  useEffect(() => {
    if (!userId) return; // セッション未取得時は何もしない

    const avatarRewards: Record<number, string> = {
      3: "/avatars/level3.png",
      5: "/avatars/level5.png",
      7: "/avatars/level7.png",
      10: "/avatars/level10.png",
    };

    const reward = avatarRewards[newLevel];
    if (reward) {
      setNewAvatar(reward);
      fetch("/api/avatar/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, avatar: reward }),
      }).catch((err) => {
        console.error("Failed to unlock avatar:", err);
      });
    }

    const timer = setTimeout(() => router.push("/"), 6000);
    return () => clearTimeout(timer);
  }, [newLevel, router, userId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <motion.h1
        className="text-5xl font-extrabold text-yellow-300 drop-shadow-lg mb-6"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        🎉 LEVEL UP !!
      </motion.h1>

      <div className="text-center bg-white/10 border border-white/20 px-10 py-6 rounded-2xl backdrop-blur-md shadow-xl">
        <h2 className="text-3xl font-bold text-yellow-300 mb-2">
          Lv.{oldLevel} → Lv.{newLevel}
        </h2>
        <p className="text-lime-300 font-semibold">+{expGain} EXP</p>

        {newAvatar && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-white font-semibold">✨ 新アバター獲得！</p>
            <img
              src={newAvatar}
              alt="new avatar"
              className="w-32 h-32 mx-auto mt-2 rounded-xl border-4 border-yellow-400"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// 外側：Suspense でラップしたコンポーネントを default export
export default function RewardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
          <p className="text-lg">Loading reward...</p>
        </div>
      }
    >
      <RewardPageInner />
    </Suspense>
  );
}
