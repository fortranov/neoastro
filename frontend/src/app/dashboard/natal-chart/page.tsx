import { NatalChartForm } from "@/components/services/NatalChartForm";

export default function NatalChartPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-purple-400">☉</span> Натальная карта
        </h1>
        <p className="text-gray-400 mt-1">
          Введите данные о рождении для расчёта положения планет
        </p>
      </div>
      <NatalChartForm />
    </div>
  );
}
