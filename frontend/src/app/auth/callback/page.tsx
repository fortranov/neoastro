"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

function CallbackContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      login(token, false);
    }
  }, [searchParams, login]);

  return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 float">✦</div>
        <p className="text-gray-300">Входим в систему...</p>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
        <p className="text-gray-300">Загрузка...</p>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
