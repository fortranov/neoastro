import { TarotReading } from "@/components/services/TarotReading";

export default function TarotPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          <span className="text-yellow-400">🔮</span> Расклады Таро
        </h1>
        <p className="text-gray-400 mt-1">
          Задайте вопрос и выберите тип расклада для получения ответа
        </p>
      </div>
      <TarotReading />
    </div>
  );
}
