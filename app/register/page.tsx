'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "登録に失敗しました");
      return;
    }

    setSuccess("登録が完了しました！ログインしてください。");
    setTimeout(() => router.push("/login"), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <h1 className="text-3xl font-bold mb-6">🆕 Training Quest 登録</h1>

      <form
        onSubmit={handleRegister}
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

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm text-center">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`py-2 rounded-md font-bold transition ${
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-lime-400 hover:bg-lime-500 text-black"
          }`}
        >
          {loading ? "登録中..." : "登録"}
        </button>
      </form>

      <p className="text-gray-400 mt-4 text-sm">
        すでにアカウントをお持ちですか？{" "}
        <a href="/login" className="text-lime-400 hover:underline">
          ログインはこちら
        </a>
      </p>
    </div>
  );
}
