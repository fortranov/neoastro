import { ForecastCard } from "@/components/services/ForecastCard";

export default function ForecastsPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-blue-400">✦</span> Астрологические прогнозы
        </h1>
        <p className="text-gray-400 mt-1">
          Ежедневные, недельные и месячные прогнозы на основе вашего знака зодиака
        </p>
      </div>
      <ForecastCard />
    </div>
  );
}
