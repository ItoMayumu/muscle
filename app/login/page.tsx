'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn("credentials", {
      redirect: false, // 🔹 手動でリダイレクト制御
      name,
      password,
      callbackUrl: "/", // 成功時の遷移先
    });

    if (result?.error) {
      setError("ユーザー名またはパスワードが違います。");
      return;
    }

    // 成功時にホームへ遷移
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <h1 className="text-3xl font-bold mb-6">🏋️ Training Quest ログイン</h1>

      <form
        onSubmit={handleLogin}
        className="bg-white/10 p-6 rounded-xl shadow-lg backdrop-blur-md border border-white/20 w-80 flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="ユーザー名"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none"
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="p-3 rounded-md bg-white/20 text-white placeholder-gray-300 focus:outline-none"
        />

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          className="bg-lime-400 hover:bg-lime-500 text-black font-bold py-2 rounded-md transition"
        >
          ログイン
        </button>
      </form>
    </div>
  );
}
