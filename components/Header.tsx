'use client';

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Dumbbell } from "lucide-react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 left-0 w-full z-50">
      <nav className="
        mx-auto
        flex justify-between items-center
        px-6 py-2
        backdrop-blur-xl bg-white/5 border-b border-white/10
        shadow-[0_0_15px_rgba(163,255,108,0.1)]
      ">
        {/* 🎯 ロゴ部分 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 font-bold text-lime-300 text-lg"
        >
          <Dumbbell className="text-lime-400 w-5 h-5" />
          <span className="tracking-wide drop-shadow-[0_0_4px_#a3ff6c]">Training Quest</span>
        </motion.div>

        {/* 🔗 ナビゲーション */}
        <div className="flex gap-6 items-center text-sm text-gray-200">
          <NavLink href="/">🏠 ホーム</NavLink>
          <NavLink href="/train">💪 トレーニング</NavLink>
          

          {session && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 py-1.5 bg-gradient-to-r from-red-500/60 to-pink-600/60 rounded-lg text-xs font-semibold hover:brightness-110 transition"
            >
              ログアウト
            </motion.button>
          )}
        </div>
      </nav>
    </header>
  );
}

/* 🧩 小さめで光るリンクコンポーネント */
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ scale: 1.1 }}>
      <Link
        href={href}
        className="
          text-gray-300 hover:text-lime-300
          transition-colors font-medium tracking-wide
        "
      >
        {children}
      </Link>
    </motion.div>
  );
}
