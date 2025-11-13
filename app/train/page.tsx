'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Workout {
  id: string;
  type: string;
  weight: number;
  reps: number;
  expGain: number;
}

export default function TrainPage() {
  const [type, setType] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [bonus, setBonus] = useState<number | null>(null); // EXPボーナス演出
  const router = useRouter();
  const {data: session,status} = useSession();
  const userId = session?.user?.id;
  const TRAIN_TYPES = [
  "ベンチプレス",
  "スクワット",
  "デッドリフト",
  "ショルダープレス",
  "ラットプルダウン",
  "アームカール",
  "レッグプレス"
];

const fetchWorkouts = async () => {
  if (!userId) return; // session が来るまで待つ

  const res = await fetch(`/api/workouts?userId=${userId}`);
  const data = await res.json();
  setWorkouts(data);
};


  useEffect(() => {
    const loadWorkouts = async () => {
      await fetchWorkouts();
    };
    loadWorkouts();
  }, []);

  // 登録処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        type,
        weight: Number(weight),
        reps: Number(reps),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert('登録に失敗しました');
      return;
    }

    // 🎁 レベルアップしたら報酬ページへ遷移
    if (data.leveledUp) {
      router.push(`/reward?oldLevel=${data.updatedUser.level - 1}&newLevel=${data.updatedUser.level}&expGain=${data.workout.expGain}`);
  return;
    }

    // 🎉 通常時 → EXP演出を表示
    const gained = data.workout?.expGain || Math.floor((Number(weight) * Number(reps)) / 10);
    setBonus(gained);
    setTimeout(() => setBonus(null), 2500);

    // フォームをクリア & 再読み込み
    setType('');
    setWeight('');
    setReps('');
    await fetchWorkouts();
  };

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-6 pb-10 relative overflow-hidden">
      <h1 className="text-2xl font-bold text-center mt-6 flex justify-center items-center gap-2">
        <Dumbbell className="text-lime-400" /> トレーニング記録
      </h1>

      {/* 🎁 EXPボーナス演出 */}
      <AnimatePresence>
        {bonus && (
          <motion.div
            className="absolute z-[9999] top-20 left-1/2 -translate-x-1/2 bg-lime-400 text-black font-bold text-xl px-6 py-3 rounded-2xl shadow-lg"
            initial={{ opacity: 0, scale: 0.5, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            +{bonus} EXP 💥
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧾 入力フォーム */}
      <motion.form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mt-6 max-w-md mx-auto shadow-lg"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col gap-4">
          <select
  value={type}
  onChange={(e) => setType(e.target.value)}
  required
  className="p-3 rounded-lg bg-white/10 border border-white/20
             focus:outline-none focus:ring-2 focus:ring-lime-400
             text-white"
>
  <option value="" disabled className="text-gray-800">
    種目を選択してください
  </option>

  {TRAIN_TYPES.map((t) => (
    <option key={t} value={t} className="text-black">
      {t}
    </option>
  ))}
</select>

          <input
            type="number"
            placeholder="重量 (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            className="p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lime-400 text-white placeholder-gray-400"
          />
          <input
            type="number"
            placeholder="回数"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            required
            className="p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-lime-400 text-white placeholder-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`flex justify-center items-center gap-2 p-3 rounded-lg font-bold transition ${
              loading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-lime-400 to-green-500 hover:brightness-110'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : '登録'}
          </button>
        </div>
      </motion.form>

      {/* 📜 トレーニング履歴 */}
      <div className="max-w-md mx-auto mt-10">
        <h2 className="text-xl font-semibold mb-3">📜 最近のトレーニング履歴</h2>
        {workouts.length === 0 ? (
          <p className="text-gray-400 text-center">まだ記録がありません</p>
        ) : (
          <motion.ul
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {workouts.map((w) => (
              <motion.li
                key={w.id}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="p-4 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <strong className="text-lime-400">{w.type}</strong>
                    <p className="text-sm text-gray-300">
                      {w.weight}kg × {w.reps}回
                    </p>
                  </div>
                  <span className="text-green-400 font-bold text-sm">
                    +{w.expGain} EXP
                  </span>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
