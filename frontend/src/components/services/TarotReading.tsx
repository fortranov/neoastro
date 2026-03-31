"use client";

import React, { useState } from "react";
import { servicesApi, TarotRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

interface TarotCard {
  name: string;
  suit: string;
  is_reversed: boolean;
  meaning: string;
  orientation: string;
  position?: string;
}

interface TarotResult {
  question: string;
  spread_type: string;
  spread_name: string;
  cards: TarotCard[];
  drawn_at: string;
}

const SUIT_COLORS: Record<string, string> = {
  major: "from-yellow-900/40 to-purple-900/40 border-yellow-500/30",
  wands: "from-orange-900/40 to-red-900/40 border-orange-500/30",
  cups: "from-blue-900/40 to-cyan-900/40 border-blue-500/30",
  swords: "from-slate-900/40 to-gray-900/40 border-slate-500/30",
  pentacles: "from-green-900/40 to-emerald-900/40 border-green-500/30",
};

const SUIT_LABELS: Record<string, string> = {
  major: "Старший Аркан",
  wands: "Жезлы",
  cups: "Кубки",
  swords: "Мечи",
  pentacles: "Пентакли",
};

const SUIT_SYMBOLS: Record<string, string> = {
  major: "✦",
  wands: "🔥",
  cups: "🌊",
  swords: "⚔️",
  pentacles: "⭐",
};

const SPREAD_OPTIONS = [
  { value: "one_card", label: "Одна карта" },
  { value: "three_card", label: "Три карты (Прошлое/Настоящее/Будущее)" },
  { value: "celtic_cross", label: "Кельтский крест (10 карт)" },
];

export function TarotReading() {
  const [form, setForm] = useState<TarotRequest>({
    question: "",
    spread_type: "one_card",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TarotResult | null>(null);
  const [error, setError] = useState("");
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set());

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRevealedCards(new Set());
    try {
      const res = await servicesApi.tarot(form);
      setResult(res.data);
      // Auto-reveal cards with stagger
      res.data.cards.forEach((_: TarotCard, idx: number) => {
        setTimeout(() => {
          setRevealedCards((prev) => new Set([...prev, idx]));
        }, idx * 400 + 300);
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-white mb-6">Расклад Таро</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Ваш вопрос
            </label>
            <textarea
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="Задайте вопрос картам..."
              rows={3}
              required
              className="w-full px-4 py-2.5 rounded-lg text-white placeholder-gray-500 text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Тип расклада
            </label>
            <select
              name="spread_type"
              value={form.spread_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg text-white text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            >
              {SPREAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#1a1035]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" loading={loading} size="lg" className="w-full">
            Открыть карты ✦
          </Button>
        </form>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white">{result.spread_name}</h3>
            <p className="text-gray-400 mt-1 italic">&ldquo;{result.question}&rdquo;</p>
          </div>

          <div
            className={`grid gap-4 ${
              result.cards.length === 1
                ? "grid-cols-1 max-w-xs mx-auto"
                : result.cards.length <= 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-5"
            }`}
          >
            {result.cards.map((card, idx) => (
              <div
                key={idx}
                className={`transition-all duration-500 ${
                  revealedCards.has(idx)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-4"
                }`}
              >
                <div
                  className={`relative p-4 rounded-2xl border bg-gradient-to-br ${
                    SUIT_COLORS[card.suit] || "from-purple-900/40 to-indigo-900/40 border-purple-500/30"
                  } backdrop-blur-sm`}
                >
                  {/* Position label */}
                  {card.position && (
                    <div className="text-xs text-gray-400 mb-2 text-center">{card.position}</div>
                  )}

                  {/* Card symbol */}
                  <div className="text-center mb-3">
                    <span className="text-3xl">{SUIT_SYMBOLS[card.suit] || "✦"}</span>
                  </div>

                  {/* Card name */}
                  <div className="text-center mb-2">
                    <div className="text-sm font-bold text-white leading-tight">{card.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{SUIT_LABELS[card.suit]}</div>
                  </div>

                  {/* Orientation */}
                  <div
                    className={`text-center text-xs font-medium mb-3 ${
                      card.is_reversed ? "text-orange-400" : "text-green-400"
                    }`}
                  >
                    {card.orientation}
                  </div>

                  {/* Meaning */}
                  <p className="text-xs text-gray-300 leading-relaxed text-center">
                    {card.meaning}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-xs text-gray-500">
            Расклад выполнен: {new Date(result.drawn_at).toLocaleString("ru-RU")}
          </div>
        </div>
      )}
    </div>
  );
}
