"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPlanLabel, getPlanColor } from "@/lib/utils";

const PLAN_SERVICES: Record<string, string[]> = {
  trial: ["Натальная карта"],
  basic: ["Натальная карта", "Астрологические прогнозы"],
  pro: ["Натальная карта", "Астрологические прогнозы", "Расклады Таро"],
};

const SERVICE_CARDS = [
  {
    href: "/dashboard/natal-chart",
    icon: "☉",
    title: "Натальная карта",
    desc: "Рассчитайте положение планет на момент вашего рождения",
    plans: ["trial", "basic", "pro"],
    color: "from-purple-900/40 to-indigo-900/40 border-purple-500/20 hover:border-purple-500/40",
  },
  {
    href: "/dashboard/forecasts",
    icon: "✦",
    title: "Прогнозы",
    desc: "Ежедневные, недельные и месячные астрологические прогнозы",
    plans: ["basic", "pro"],
    color: "from-blue-900/40 to-cyan-900/40 border-blue-500/20 hover:border-blue-500/40",
  },
  {
    href: "/dashboard/tarot",
    icon: "🔮",
    title: "Таро",
    desc: "Расклады из 1, 3 карт или Кельтский крест",
    plans: ["pro"],
    color: "from-yellow-900/40 to-orange-900/40 border-yellow-500/20 hover:border-yellow-500/40",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const availableServices = PLAN_SERVICES[user.plan_type] || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="p-8 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Добро пожаловать, <span className="text-purple-400">{user.username}</span>! ✦
            </h1>
            <p className="text-gray-400 mt-1">
              Ваш астрологический путь начинается здесь
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPlanColor(user.plan_type)}`}>
              {getPlanLabel(user.plan_type)}
            </span>
            <span className="text-xs text-gray-500">
              {user.email_verified ? "✓ Email подтверждён" : "Email не подтверждён"}
            </span>
          </div>
        </div>
      </div>

      {/* Services */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Доступные сервисы</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SERVICE_CARDS.map((card) => {
            const hasAccess = card.plans.includes(user.plan_type);
            return (
              <div key={card.href}>
                {hasAccess ? (
                  <Link
                    href={card.href}
                    className={`block p-6 rounded-2xl border bg-gradient-to-br ${card.color} backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 group`}
                  >
                    <div className="text-4xl mb-3">{card.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-gray-400 text-sm">{card.desc}</p>
                    <div className="mt-4 flex items-center text-purple-400 text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                      Открыть
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`relative p-6 rounded-2xl border ${card.color} backdrop-blur-sm opacity-50 cursor-not-allowed`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/60 px-4 py-2 rounded-full text-xs text-gray-300 backdrop-blur-sm">
                        🔒 Недоступно на вашем тарифе
                      </div>
                    </div>
                    <div className="text-4xl mb-3">{card.icon}</div>
                    <h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3>
                    <p className="text-gray-400 text-sm">{card.desc}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan info */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/3">
        <h3 className="text-lg font-semibold text-white mb-3">Ваш тариф: {getPlanLabel(user.plan_type)}</h3>
        <p className="text-gray-400 text-sm mb-3">Включено в ваш тариф:</p>
        <ul className="space-y-1">
          {availableServices.map((s) => (
            <li key={s} className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span> {s}
            </li>
          ))}
        </ul>
        {user.plan_type !== "pro" && (
          <p className="text-yellow-400 text-xs mt-4">
            Обратитесь к администратору для улучшения тарифа.
          </p>
        )}
      </div>
    </div>
  );
}
