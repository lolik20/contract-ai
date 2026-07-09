// Тарифы нейроюриста — единый источник правды (в коде, не в БД).
// amountKopecks — цена в копейках (для Т-Кассы), questions — сколько вопросов начисляется.

import type { TariffPlan } from "@prisma/client";

export interface Tariff {
  plan: TariffPlan;
  questions: number;
  amountKopecks: number;
  title: string;
  /** Цена за один вопрос, руб. — для подписи «выгоднее» */
  perQuestionRub: number;
  highlighted?: boolean;
}

export const TARIFFS: Tariff[] = [
  {
    plan: "Q3",
    questions: 3,
    amountKopecks: 15000,
    title: "3 вопроса",
    perQuestionRub: 50,
  },
  {
    plan: "Q10",
    questions: 10,
    amountKopecks: 40000,
    title: "10 вопросов",
    perQuestionRub: 40,
    highlighted: true,
  },
  {
    plan: "Q30",
    questions: 30,
    amountKopecks: 100000,
    title: "30 вопросов",
    perQuestionRub: 33,
  },
];

export function getTariff(plan: TariffPlan): Tariff | undefined {
  return TARIFFS.find((t) => t.plan === plan);
}

export function formatRub(kopecks: number): string {
  return (kopecks / 100).toLocaleString("ru-RU");
}
