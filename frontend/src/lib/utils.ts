export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getPlanLabel(plan: string): string {
  const labels: Record<string, string> = {
    trial: "Пробный",
    basic: "Базовый",
    pro: "Про",
  };
  return labels[plan] || plan;
}

export function getPlanColor(plan: string): string {
  const colors: Record<string, string> = {
    trial: "text-gray-400 bg-gray-800",
    basic: "text-blue-300 bg-blue-900/40",
    pro: "text-cosmic-gold bg-yellow-900/30",
  };
  return colors[plan] || "text-gray-400 bg-gray-800";
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    return axiosError.response?.data?.detail || "Произошла ошибка";
  }
  if (error instanceof Error) return error.message;
  return "Произошла ошибка";
}
