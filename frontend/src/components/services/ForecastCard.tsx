"use client";

import React, { useState } from "react";
import { servicesApi, ForecastRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

interface ForecastResult {
  zodiac_sign: string;
  period: string;
  period_name: string;
  forecast: string;
  generated_at: string;
}

const ZODIAC_SYMBOLS: Record<string, string> = {
  "Овен": "♈", "Телец": "♉", "Близнецы": "♊", "Рак": "♋",
  "Лев": "♌", "Дева": "♍", "Весы": "♎", "Скорпион": "♏",
  "Стрелец": "♐", "Козерог": "♑", "Водолей": "♒", "Рыбы": "♓",
};

const PERIOD_OPTIONS = [
  { value: "daily", label: "Ежедневный" },
  { value: "weekly", label: "Недельный" },
  { value: "monthly", label: "Месячный" },
];

export function ForecastCard() {
  const [form, setForm] = useState<ForecastRequest>({
    birth_date: "",
    birth_time: "12:00",
    birth_place: "",
    period: "daily",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ForecastResult | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await servicesApi.forecast(form);
      setResult(res.data);
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
        <h2 className="text-xl font-semibold text-white mb-6">Получить прогноз</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Дата рождения"
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              required
            />
            <Input
              label="Время рождения"
              type="time"
              name="birth_time"
              value={form.birth_time}
              onChange={handleChange}
            />
            <Input
              label="Место рождения"
              name="birth_place"
              value={form.birth_place}
              onChange={handleChange}
              placeholder="Москва"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Период прогноза
              </label>
              <select
                name="period"
                value={form.period}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-lg text-white text-sm bg-white/5 border border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#1a1035]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" loading={loading} size="lg" className="w-full">
            Получить прогноз ✦
          </Button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="animate-fade-in">
          <div className="relative p-8 rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-purple-900/10 backdrop-blur-sm overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-4 right-4 text-6xl opacity-10">
              {ZODIAC_SYMBOLS[result.zodiac_sign] || "✦"}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">{ZODIAC_SYMBOLS[result.zodiac_sign] || "✦"}</div>
              <div>
                <div className="text-2xl font-bold text-white">{result.zodiac_sign}</div>
                <div className="text-sm text-yellow-400 capitalize">{result.period_name} прогноз</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 to-transparent" />
              <p className="text-gray-200 leading-relaxed text-lg italic pl-4">
                &ldquo;{result.forecast}&rdquo;
              </p>
            </div>

            <div className="mt-6 text-xs text-gray-500 text-right">
              Сгенерировано: {new Date(result.generated_at).toLocaleString("ru-RU")}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
