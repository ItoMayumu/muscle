'use client';

import { useState, useEffect } from 'react';
import Calendar, { Value } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Award, XCircle } from 'lucide-react';

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
  user: any;
  onAvatarClick: () => void;
}) {
  return (
    <div className="flex items-center gap-6 bg-white/10 p-5 rounded-3xl border border-white/20 shadow-xl">
      <div
        onClick={onAvatarClick}
        className="w-28 h-28 bg-black border-4 border-lime-400 rounded-2xl overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(163,255,108,0.4)] cursor-pointer hover:brightness-110 transition"
      >
        <img
          src={user.avatar || '/avatars/level1.png'}
          alt="Avatar"
          className="w-24 h-24 object-contain pixelated"
        />
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          {user.name || '筋肉見習い'}
        </h1>
        <p className="text-lime-300 text-lg font-semibold mt-1">
          ベンチの勇者
        </p>
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
  user: any;
  onSelected: (avatar: string) => void;
}) {
  if (!isOpen) return null;

  const handleSelect = async (avatar: string) => {
    await fetch('/api/avatar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, avatar }),
    });
    onSelected(avatar);
    onClose();
  };

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

        {user.ownedAvatars?.length ? (
          <div className="grid grid-cols-2 gap-4">
            {user.ownedAvatars.map((a: string, i: number) => (
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
function RewardTickets({ user, refresh }: { user: any; refresh: () => void }) {
  const handleUseTicket = async (ticket: string) => {
    if (!confirm(`${ticket} を使用しますか？`)) return;
    const res = await fetch('/api/reward/use', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ticket }),
    });
    if (res.ok) {
      alert(`${ticket} を使用しました！`);
      refresh();
    }
  };

  if (!user.rewards || user.rewards.length === 0) {
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
        {user.rewards.map((ticket: string, i: number) => (
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

// 🏅 実績バッジ
function Achievements() {
  const badges = [
    { icon: <Trophy className="text-yellow-400" />, label: '10日連続記録' },
    { icon: <Award className="text-gray-300" />, label: 'スクワット100kg達成' },
  ];
  return (
    <div className="mt-8">
      <h3 className="text-lg text-white mb-2 font-semibold">🏅 実績・バッジ</h3>
      <div className="flex gap-3">
        {badges.map((b, i) => (
          <motion.div
            key={i}
            className="bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.1 }}
          >
            {b.icon}
            <p className="text-gray-300 text-xs mt-1 text-center">{b.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showModal, setShowModal] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('API Error');
      const users = await res.json();
      if (users && users.length > 0) setUser(users[0]);
    } catch (e) {
      console.error('ユーザー取得失敗:', e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleAvatarChange = (newAvatar: string) => {
    setUser((prev: any) => ({ ...prev, avatar: newAvatar }));
  };

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
          onChange={(value: Value) => {
            if (value instanceof Date) {
              setDate(value);
            } else if (Array.isArray(value) && value[0]) {
              setDate(value[0]);
            }
          }}
          value={date}
          className="!bg-transparent !text-white"
        />
      </div>

      <Achievements />
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
