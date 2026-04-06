"use client";

import React, { useState } from "react";
import { servicesApi, NatalChartRequest } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";
import { NatalChartWheel } from "./NatalChartWheel";

interface PlanetData {
  sign: string;
  degree: number;
  longitude: number;
}

interface NatalChartResult {
  name: string;
  birth_date: string;
  birth_time: string;
  birth_place: string;
  ascendant: { sign: string; degree: number };
  planets: Record<string, PlanetData>;
  houses: Record<string, string>;
  aspects: Array<{ planet1: string; planet2: string; aspect: string; orb: number }>;
}

const PLANET_SYMBOLS: Record<string, string> = {
  "Солнце": "☉",
  "Луна": "☽",
  "Меркурий": "☿",
  "Венера": "♀",
  "Марс": "♂",
  "Юпитер": "♃",
  "Сатурн": "♄",
  "Уран": "⛢",
  "Нептун": "♆",
  "Плутон": "♇",
};

const ASPECT_COLORS: Record<string, string> = {
  "Соединение": "text-yellow-400",
  "Трин": "text-green-400",
  "Секстиль": "text-blue-400",
  "Квадрат": "text-red-400",
  "Оппозиция": "text-orange-400",
};

export function NatalChartForm() {
  const [form, setForm] = useState<NatalChartRequest>({
    name: "",
    birth_date: "",
    birth_time: "12:00",
    birth_place: "",
    latitude: 55.7558,
    longitude: 37.6173,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NatalChartResult | null>(null);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "latitude" || name === "longitude" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await servicesApi.natalChart(form);
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
        <h2 className="text-xl font-semibold text-white mb-6">Данные для расчёта</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Имя"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              required
            />
            <Input
              label="Место рождения"
              name="birth_place"
              value={form.birth_place}
              onChange={handleChange}
              placeholder="Москва, Россия"
              required
            />
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
              required
            />
            <Input
              label="Широта"
              type="number"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
              step="0.0001"
              min="-90"
              max="90"
              helperText="Например: 55.7558 (Москва)"
              required
            />
            <Input
              label="Долгота"
              type="number"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
              step="0.0001"
              min="-180"
              max="180"
              helperText="Например: 37.6173 (Москва)"
              required
            />
          </div>
          {error && (
            <p className="text-red-400 text-sm bg-red-900/20 px-4 py-2 rounded-lg">{error}</p>
          )}
          <Button type="submit" loading={loading} size="lg" className="w-full">
            Рассчитать натальную карту ✦
          </Button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-purple-900/10 backdrop-blur-sm text-center">
            <h2 className="text-2xl font-bold text-white mb-1">{result.name}</h2>
            <p className="text-gray-400">
              {result.birth_date} · {result.birth_time} · {result.birth_place}
            </p>
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 rounded-full border border-purple-500/30">
              <span className="text-purple-300 text-sm">Асцендент:</span>
              <span className="text-white font-semibold">{result.ascendant.sign} {result.ascendant.degree}°</span>
            </div>
          </div>

          {/* Chart wheel */}
          <div className="glass-card p-4 rounded-2xl border border-purple-500/20 bg-purple-900/5 backdrop-blur-sm flex justify-center">
            <NatalChartWheel
              ascendant={result.ascendant}
              planets={result.planets}
              aspects={result.aspects}
            />
          </div>

          {/* Planets */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Планеты</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(result.planets).map(([planet, data]) => (
                <div
                  key={planet}
                  className="flex flex-col items-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-colors"
                >
                  <span className="text-2xl mb-1">{PLANET_SYMBOLS[planet] || "✦"}</span>
                  <span className="text-xs text-gray-400 mb-1">{planet}</span>
                  <span className="text-sm font-semibold text-purple-300">{data.sign}</span>
                  <span className="text-xs text-gray-500">{data.degree}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* Houses */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-white mb-4">Дома (Целые знаки)</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {Object.entries(result.houses).map(([house, sign]) => (
                <div
                  key={house}
                  className="flex flex-col items-center p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <span className="text-xs text-gray-500">{house}</span>
                  <span className="text-sm font-medium text-white">{sign}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Aspects */}
          {result.aspects.length > 0 && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-white mb-4">
                Аспекты ({result.aspects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {result.aspects.map((asp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 border border-white/5"
                  >
                    <span className="text-sm text-gray-300">
                      {asp.planet1} — {asp.planet2}
                    </span>
                    <span className={`text-xs font-semibold ${ASPECT_COLORS[asp.aspect] || "text-gray-400"}`}>
                      {asp.aspect} ({asp.orb}°)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
