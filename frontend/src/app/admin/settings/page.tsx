"use client";

import React, { useState, useEffect } from "react";
import { adminApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getErrorMessage } from "@/lib/utils";

interface SettingsState {
  google_oauth_enabled: string;
  google_client_id: string;
  google_client_secret: string;
  email_confirmation_enabled: string;
  smtp_host: string;
  smtp_port: string;
  smtp_user: string;
  smtp_password: string;
  service_natal_chart_enabled: string;
  service_forecasts_enabled: string;
  service_tarot_enabled: string;
  plan_trial_price: string;
  plan_basic_price: string;
  plan_pro_price: string;
  [key: string]: string;
}

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="text-xs text-gray-400 mt-0.5">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex w-12 h-6 items-center rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-purple-600" : "bg-gray-600"
        }`}
      >
        <span
          className={`inline-block w-5 h-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

const DEFAULT_SETTINGS: SettingsState = {
  google_oauth_enabled: "false",
  google_client_id: "",
  google_client_secret: "",
  email_confirmation_enabled: "false",
  smtp_host: "",
  smtp_port: "587",
  smtp_user: "",
  smtp_password: "",
  service_natal_chart_enabled: "true",
  service_forecasts_enabled: "true",
  service_tarot_enabled: "true",
  plan_trial_price: "0",
  plan_basic_price: "9.99",
  plan_pro_price: "19.99",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    adminApi.getSettings()
      .then((res) => {
        setSettings((prev) => ({ ...prev, ...res.data }));
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await adminApi.updateSettings(settings);
      setSuccess("Настройки сохранены успешно");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof SettingsState) => (value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const setBool = (key: keyof SettingsState) => (value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value ? "true" : "false" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl float">✦</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Настройки</h1>
          <p className="text-gray-400 mt-1">Управление конфигурацией платформы</p>
        </div>
        <div className="flex items-center gap-3">
          {success && (
            <span className="text-green-400 text-sm">✓ {success}</span>
          )}
          <Button onClick={handleSave} loading={saving} size="lg">
            Сохранить изменения
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">{error}</div>
      )}

      {/* Google OAuth */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          Google OAuth
        </h2>
        <Toggle
          checked={settings.google_oauth_enabled === "true"}
          onChange={setBool("google_oauth_enabled")}
          label="Включить Google OAuth"
          description="Разрешить пользователям входить через Google"
        />
        {settings.google_oauth_enabled === "true" && (
          <div className="space-y-3 pl-4 border-l border-purple-500/20">
            <Input
              label="Google Client ID"
              value={settings.google_client_id}
              onChange={(e) => set("google_client_id")(e.target.value)}
              placeholder="xxxx.apps.googleusercontent.com"
            />
            <Input
              label="Google Client Secret"
              type="password"
              value={settings.google_client_secret}
              onChange={(e) => set("google_client_secret")(e.target.value)}
              placeholder="••••••••"
            />
          </div>
        )}
      </section>

      {/* Email confirmation */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          Подтверждение Email
        </h2>
        <Toggle
          checked={settings.email_confirmation_enabled === "true"}
          onChange={setBool("email_confirmation_enabled")}
          label="Требовать подтверждение email"
          description="Пользователи должны подтвердить email перед входом"
        />
        {settings.email_confirmation_enabled === "true" && (
          <div className="space-y-3 pl-4 border-l border-purple-500/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="SMTP Хост"
                value={settings.smtp_host}
                onChange={(e) => set("smtp_host")(e.target.value)}
                placeholder="smtp.gmail.com"
              />
              <Input
                label="SMTP Порт"
                type="number"
                value={settings.smtp_port}
                onChange={(e) => set("smtp_port")(e.target.value)}
                placeholder="587"
              />
              <Input
                label="SMTP Пользователь"
                value={settings.smtp_user}
                onChange={(e) => set("smtp_user")(e.target.value)}
                placeholder="your@email.com"
              />
              <Input
                label="SMTP Пароль"
                type="password"
                value={settings.smtp_password}
                onChange={(e) => set("smtp_password")(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        )}
      </section>

      {/* Services */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          Сервисы
        </h2>
        <Toggle
          checked={settings.service_natal_chart_enabled === "true"}
          onChange={setBool("service_natal_chart_enabled")}
          label="Натальная карта"
          description="Включить сервис расчёта натальных карт"
        />
        <Toggle
          checked={settings.service_forecasts_enabled === "true"}
          onChange={setBool("service_forecasts_enabled")}
          label="Астрологические прогнозы"
          description="Включить сервис прогнозов"
        />
        <Toggle
          checked={settings.service_tarot_enabled === "true"}
          onChange={setBool("service_tarot_enabled")}
          label="Расклады Таро"
          description="Включить сервис раскладов Таро"
        />
      </section>

      {/* Pricing */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
          Тарифные планы (цены в USD/месяц)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="text-sm font-medium text-gray-300 mb-2">Пробный</div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.plan_trial_price}
              onChange={(e) => set("plan_trial_price")(e.target.value)}
              helperText="0 = бесплатно"
            />
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-purple-500/20">
            <div className="text-sm font-medium text-purple-300 mb-2">Базовый</div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.plan_basic_price}
              onChange={(e) => set("plan_basic_price")(e.target.value)}
            />
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-yellow-500/20">
            <div className="text-sm font-medium text-yellow-400 mb-2">Про</div>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={settings.plan_pro_price}
              onChange={(e) => set("plan_pro_price")(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Save button bottom */}
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button onClick={handleSave} loading={saving} size="lg">
          Сохранить все изменения
        </Button>
      </div>
    </div>
  );
}
