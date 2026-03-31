import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f0a1e] stars-bg">
      {/* Hero */}
      <header className="relative">
        <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✦</span>
            <span className="text-xl font-bold text-white">
              Neo<span className="text-purple-400">Astro</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              Войти
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-900/30"
            >
              Регистрация
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto text-center px-6 py-24">
          <div className="float inline-block mb-8">
            <span className="text-8xl">✦</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">NeoAstro</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            Откройте тайны звёзд. Узнайте своё предназначение через астрологию и Таро.
          </p>
          <p className="text-gray-500 mb-10 max-w-lg mx-auto">
            Натальные карты, персональные прогнозы и расклады Таро — всё в одном месте.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 hover:-translate-y-0.5 pulse-glow"
            >
              Начать бесплатно ✦
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 transition-all hover:-translate-y-0.5"
            >
              Войти в аккаунт
            </Link>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="gold-text">Наши услуги</span>
        </h2>
        <p className="text-gray-400 text-center mb-12 max-w-xl mx-auto">
          Три мощных инструмента для глубокого самопознания
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "☉",
              title: "Натальная карта",
              desc: "Точный расчёт положения планет на момент вашего рождения. Узнайте о своих сильных сторонах, потенциале и жизненных задачах.",
              color: "from-purple-900/40 to-indigo-900/40 border-purple-500/30",
              available: "Все тарифы",
            },
            {
              icon: "✦",
              title: "Астрологические прогнозы",
              desc: "Ежедневные, недельные и месячные прогнозы на основе вашего знака зодиака и текущего положения планет.",
              color: "from-blue-900/40 to-cyan-900/40 border-blue-500/30",
              available: "Базовый и Про",
            },
            {
              icon: "🔮",
              title: "Расклады Таро",
              desc: "Расклады из 1, 3 карт или Кельтский крест. Найдите ответы на важные вопросы с помощью мудрости карт Таро.",
              color: "from-yellow-900/40 to-orange-900/40 border-yellow-500/30",
              available: "Тариф Про",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className={`relative p-8 rounded-2xl border bg-gradient-to-br ${feature.color} backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 group`}
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed mb-4">{feature.desc}</p>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300">
                {feature.available}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          <span className="gradient-text">Тарифные планы</span>
        </h2>
        <p className="text-gray-400 text-center mb-12">
          Выберите план, который подходит именно вам
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Пробный",
              price: "0",
              period: "бесплатно",
              features: ["Натальная карта", "Базовый доступ"],
              color: "border-white/10",
              button: "bg-white/10 hover:bg-white/20",
            },
            {
              name: "Базовый",
              price: "9.99",
              period: "в месяц",
              features: ["Натальная карта", "Прогнозы (ежедневные, недельные, месячные)"],
              color: "border-purple-500/40",
              button: "bg-purple-600 hover:bg-purple-500",
              popular: true,
            },
            {
              name: "Про",
              price: "19.99",
              period: "в месяц",
              features: ["Натальная карта", "Прогнозы", "Расклады Таро", "Полный доступ"],
              color: "border-yellow-500/40",
              button: "bg-yellow-600 hover:bg-yellow-500",
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl border ${plan.color} bg-white/3 backdrop-blur-sm ${
                plan.popular ? "ring-1 ring-purple-500/40" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                    Популярный
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-gray-400 ml-2 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <span className="text-green-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/register"
                className={`block text-center py-3 rounded-xl text-white font-medium ${plan.button} transition-colors`}
              >
                Выбрать план
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto text-center px-6 py-20">
        <div className="p-12 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-white mb-4">
            Начните своё космическое путешествие
          </h2>
          <p className="text-gray-400 mb-8">
            Зарегистрируйтесь бесплатно и откройте свою натальную карту прямо сейчас
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-8 py-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-900/40 hover:-translate-y-0.5"
          >
            Создать аккаунт бесплатно ✦
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-lg">✦</span>
          <span className="text-white font-semibold">NeoAstro</span>
        </div>
        <p>© 2025 NeoAstro. Все права защищены.</p>
      </footer>
    </div>
  );
}
