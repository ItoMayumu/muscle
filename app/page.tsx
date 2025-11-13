"use client";

import { useState, useEffect, type ReactNode } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Award, XCircle } from "lucide-react";
import { Value } from "@prisma/client/runtime/library";

type CalendarValue = Value;

type User = {
  id: string;
  name: string | null;
  exp: number;
  level: number;
  avatar: string | null;
  ownedAvatars?: string[] | null;
  rewards?: string[] | null;
  badges?: string[] | null;
};

// 🎚️ 経験値バー
function ExpBar({ exp, level }: { exp: number; level: number }) {
  const expToNext = 100;
  const percent = Math.min(((exp % expToNext) / expToNext) * 100, 100);
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-lime-400">Lv.{level}</h2>
        <p className="text-sm text-gray-300">
          {exp % expToNext} / {expToNext} EXP
        </p>
      </div>
      <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mt-1">
        <motion.div
          className="h-full bg-gradient-to-r from-lime-400 to-green-500"
          style={{ width: `${percent}%` }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
    </div>
  );
}

// 🧍‍♂️ プレイヤーカード
function PlayerCard({
  user,
  onAvatarClick,
}: {
  user: User;
  onAvatarClick: () => void;
}) {
  return (
    <div className="flex items-center gap-6 bg-white/10 p-5 rounded-3xl border border-white/20 shadow-xl">
      <div
        onClick={onAvatarClick}
        className="w-30 h-30 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:brightness-110 transition"
      >
        <img
          src={user.avatar || "/avatars/level1.png"}
          alt="Avatar"
          className="w-24 h-24 object-contain pixelated"
        />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          {user.name || "筋肉見習い"}
        </h1>
        <p className="text-lime-300 text-lg font-semibold mt-1">ベンチの勇者</p>
        <p className="text-gray-400 text-sm mt-2">Lv.{user.level}</p>
      </div>
    </div>
  );
}

// 🎮 アバター選択モーダル
function AvatarModal({
  isOpen,
  onClose,
  user,
  onSelected,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSelected: (avatar: string) => void;
}) {
  if (!isOpen) return null;

  const handleSelect = async (avatar: string) => {
    await fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, avatar }),
    });
    onSelected(avatar);
    onClose();
  };

  const ownedAvatars = user.ownedAvatars ?? [];

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 w-80 text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">🎨 所持アバター</h2>
          <button onClick={onClose}>
            <XCircle className="text-gray-400 hover:text-white" />
          </button>
        </div>

        {ownedAvatars.length ? (
          <div className="grid grid-cols-2 gap-4">
            {ownedAvatars.map((a, i) => (
              <div
                key={i}
                onClick={() => handleSelect(a)}
                className="bg-black border-2 border-lime-400 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition flex items-center justify-center p-2"
              >
                <img src={a} alt={`avatar-${i}`} className="w-24 h-24 pixelated" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-300 text-sm">まだアバターを獲得していません</p>
        )}
      </motion.div>
    </motion.div>
  );
}

// 🎁 報酬チケット一覧
function RewardTickets({
  user,
  refresh,
}: {
  user: User;
  refresh: () => void;
}) {
  const rewards = user.rewards ?? [];

  const handleUseTicket = async (ticket: string) => {
    if (!confirm(`${ticket} を使用しますか？`)) return;
    const res = await fetch("/api/reward/use", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ticket }),
    });
    if (res.ok) {
      alert(`${ticket} を使用しました！`);
      refresh();
    }
  };

  if (rewards.length === 0) {
    return (
      <>
        <h3 className="text-lg text-white mb-2 font-semibold">🎁 報酬チケット</h3>
        <p className="text-gray-400">まだ報酬チケットがありません。</p>
      </>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg text-white mb-2 font-semibold">🎁 報酬チケット</h3>
      <div className="grid grid-cols-2 gap-3">
        {rewards.map((ticket, i) => (
          <motion.div
            key={i}
            className="bg-gradient-to-br from-purple-500/30 to-pink-500/20 border border-purple-300/40 rounded-xl p-4 flex flex-col items-center shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <p className="font-bold text-white">{ticket}</p>
            <button
              onClick={() => handleUseTicket(ticket)}
              className="mt-2 px-4 py-1 bg-lime-400 text-black rounded-lg font-bold text-sm hover:brightness-110 transition"
            >
              使用する
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Achievements({ badges }: { badges: string[] }) {
  const icons: Record<string, ReactNode> = {
    初トレーニング: <Trophy className="text-yellow-400" />,
    継続の鬼: <Award className="text-orange-400" />,
    筋肉王: <Trophy className="text-purple-400" />,
  };

  if (!badges.length) {
    return (
      <div className="mt-8">
        <h3 className="text-lg text-white mb-2 font-semibold">🏅 実績・バッジ</h3>
        <p className="text-gray-400 text-sm">まだ実績がありません。</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg text-white mb-2 font-semibold">🏅 実績・バッジ</h3>
      <div className="flex gap-3 flex-wrap">
        {badges.map((b, i) => (
          <motion.div
            key={i}
            className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10 flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
          >
            {icons[b] ?? <Award />}
            <p className="text-gray-300 text-xs mt-1">{b}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("API Error");
      const data: User = await res.json();
      setUser(data);
      console.log("ログインユーザー:", data);
    } catch (e) {
      console.error("ユーザー取得失敗:", e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAvatarChange = (newAvatar: string) => {
    setUser((prev) => (prev ? { ...prev, avatar: newAvatar } : prev));
  };

  const badges = user?.badges ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] p-6 text-white">
      {user && (
        <>
          <PlayerCard user={user} onAvatarClick={() => setShowModal(true)} />
          <ExpBar exp={user.exp} level={user.level} />
        </>
      )}

      <hr className="border-white/20 my-4" />
      <h2 className="text-lg mb-2 font-semibold">📅 トレーニングカレンダー</h2>
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
        <Calendar
          onChange={(value: CalendarValue) => {
            if (value instanceof Date) {
              setDate(value);
            } else if (Array.isArray(value) && value[0] instanceof Date) {
              setDate(value[0]);
            }
          }}
          value={date}
          className="!bg-transparent !text-white"
        />
        
      </div>

      <Achievements badges={badges} />
      {user && <RewardTickets user={user} refresh={fetchUser} />}

      <footer className="text-center text-gray-400 mt-10 text-sm">
        🎮 Training Quest - 筋肉を鍛えてレベルアップ！
      </footer>

      <AnimatePresence>
        {showModal && user && (
          <AvatarModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            user={user}
            onSelected={handleAvatarChange}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
