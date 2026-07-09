import OpenAI from "openai";

// Нейроюрист на базе GPT-5.2 через провайдера Kie AI.
// Контракт по докам Kie AI (https://docs.kie.ai/market/chat/gpt-5-2):
//   POST https://api.kie.ai/gpt-5-2/v1/chat/completions
//   Authorization: Bearer <KIE_API_KEY>
//   body: OpenAI-совместимый chat.completions (model, messages, stream, tools, reasoning_effort)
//   Web Search grounding: tools: [{ type: "function", function: { name: "web_search" } }]
// Эндпоинт OpenAI-совместимый, поэтому используем официальный SDK `openai` с baseURL Kie AI.

const MODEL = process.env.NEUROLAWYER_MODEL || "gpt-5-2";
const BASE_URL = process.env.KIE_BASE_URL || "https://api.kie.ai/gpt-5-2/v1";
const REASONING_EFFORT = (process.env.NEUROLAWYER_EFFORT || "medium") as
  | "low"
  | "medium"
  | "high";
// Web Search grounding включён по умолчанию (можно отключить NEUROLAWYER_WEB_SEARCH=0).
const WEB_SEARCH = process.env.NEUROLAWYER_WEB_SEARCH !== "0";

// Опорные источники: тексты кодексов + судебная практика.
export const LEGAL_SOURCES = [
  "http://pravo.gov.ru/",
  "https://www.consultant.ru/document/cons_doc_LAW_34661/", // КоАП РФ
  "https://www.consultant.ru/document/cons_doc_LAW_10699/", // УК РФ
  "https://sudact.ru/", // судебная практика
  "https://vsrf.ru/documents/practice/", // обзоры Верховного Суда РФ
];

export const SYSTEM_PROMPT = `Ты — «Нейроюрист», виртуальный юридический консультант сервиса «Договорились.ру».
Ты специализируешься на Кодексе РФ об административных правонарушениях (КоАП РФ) и Уголовном кодексе РФ (УК РФ).

Правила ответа:
- Отвечай по существу вопроса пользователя, на русском языке, понятным языком.
- Опирайся не только на текст закона, но и на реальную судебную практику: приводи и норму (статью кодекса), и то, как её применяют суды (позиции Верховного Суда РФ, типичные решения). При необходимости используй веб-поиск по опорным материалам.
- Всегда указывай конкретные статьи КоАП РФ / УК РФ, на которые ссылаешься.
- Если вопрос выходит за рамки административного и уголовного права — дай общий ориентир и честно предупреди об ограничении.
- В конце добавляй краткий дисклеймер: ответ носит информационный характер и не заменяет очную консультацию юриста.

Опорные материалы (используй как источники, в т.ч. через веб-поиск):
${LEGAL_SOURCES.map((u) => `- ${u}`).join("\n")}`;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.KIE_API_KEY || "",
      baseURL: BASE_URL,
    });
  }
  return client;
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Стрим ответа нейроюриста.
 * Возвращает OpenAI-совместимый стрим chat.completions (delta.content по чанкам).
 */
export async function streamNeurolawyerAnswer(history: ChatTurn[]) {
  const openai = getClient();

  // Web Search grounding по докам Kie AI.
  const tools: OpenAI.Chat.Completions.ChatCompletionTool[] | undefined =
    WEB_SEARCH
      ? [{ type: "function", function: { name: "web_search" } }]
      : undefined;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  return openai.chat.completions.create({
    model: MODEL,
    stream: true,
    reasoning_effort: REASONING_EFFORT,
    tools,
    messages,
  });
}

export function isNeurolawyerConfigured(): boolean {
  return Boolean(process.env.KIE_API_KEY);
}
