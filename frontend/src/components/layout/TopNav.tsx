"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard/natal-chart", label: "Натальная карта", service: "natal_chart" },
  { href: "/dashboard/forecasts", label: "Прогнозы", service: "forecasts" },
  { href: "/dashboard/tarot", label: "Таро", service: "tarot" },
];

export function TopNav() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0f0a1e]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">✦</span>
            <span className="text-xl font-bold text-white">
              Neo<span className="text-purple-400">Astro</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user?.is_admin && (
              <Link
                href="/admin"
                className="text-xs px-3 py-1.5 rounded-lg bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 hover:bg-yellow-600/30 transition-colors"
              >
                Админ
              </Link>
            )}
            <span className="text-sm text-gray-400">
              <span className="text-white font-medium">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="text-sm px-3 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Выйти
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                pathname === item.href
                  ? "bg-purple-600/30 text-purple-300"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
