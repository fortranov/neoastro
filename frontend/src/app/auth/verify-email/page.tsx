"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";

function VerifyContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Токен верификации не найден");
      return;
    }
    authApi.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.response?.data?.detail || "Ошибка верификации email");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#0f0a1e] stars-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {status === "loading" && (
          <>
            <div className="text-5xl mb-4 float">✦</div>
            <p className="text-gray-300">Проверяем ваш email...</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">Email подтверждён!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
            >
              Войти в аккаунт
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Ошибка</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Link
              href="/auth/login"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium border border-white/20 transition-colors"
            >
              На страницу входа
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
        <p className="text-gray-300">Загрузка...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
