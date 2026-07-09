"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { STARTER_QUESTIONS } from "@/lib/starterQuestions";
import { BalanceBadge } from "./BalanceBadge";

interface ConsultationItem {
  id: string;
  title: string | null;
}
interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
}

export function Chat({
  initialConsultations,
  initialBalance,
  initialActiveId,
  welcome,
}: {
  initialConsultations: ConsultationItem[];
  initialBalance: number;
  initialActiveId: string | null;
  welcome: boolean;
}) {
  const [consultations, setConsultations] =
    useState<ConsultationItem[]>(initialConsultations);
  const [balance, setBalance] = useState(initialBalance);
  const [activeId, setActiveId] = useState<string | null>(initialActiveId);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showWelcome, setShowWelcome] = useState(welcome);
  const [noBalance, setNoBalance] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeId) void loadThread(activeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, draft]);

  async function loadThread(id: string) {
    const res = await fetch(`/api/consultations/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }

  async function createConsultation(): Promise<string | null> {
    const res = await fetch("/api/consultations", { method: "POST" });
    if (!res.ok) return null;
    const data = await res.json();
    const c = data.consultation as ConsultationItem;
    setConsultations((prev) => [c, ...prev]);
    return c.id;
  }

  function openConsultation(id: string) {
    setActiveId(id);
    setMessages([]);
    void loadThread(id);
  }

  async function startNew() {
    const id = await createConsultation();
    if (id) {
      setActiveId(id);
      setMessages([]);
    }
  }

  async function send(text: string, consultationId?: string) {
    const question = text.trim();
    if (!question || streaming) return;
    if (balance <= 0) {
      setNoBalance(true);
      return;
    }

    let cid = consultationId ?? activeId;
    if (!cid) {
      cid = await createConsultation();
      if (!cid) return;
      setActiveId(cid);
    }

    setInput("");
    setNoBalance(false);
    setStreaming(true);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "USER", content: question },
    ]);

    const res = await fetch(`/api/consultations/${cid}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: question }),
    });

    if (res.status === 409) {
      setStreaming(false);
      setNoBalance(true);
      return;
    }
    if (!res.ok || !res.body) {
      setStreaming(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "ASSISTANT",
          content:
            res.status === 503
              ? "Нейроюрист временно недоступен (не настроен ключ API)."
              : "Не удалось получить ответ. Попробуйте ещё раз.",
        },
      ]);
      return;
    }

    setBalance((b) => Math.max(0, b - 1));

    // Обновляем заголовок треда в списке, если он был пустой.
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === cid && !c.title ? { ...c, title: question.slice(0, 60) } : c
      )
    );

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let acc = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      acc += decoder.decode(value, { stream: true });
      setDraft(acc);
    }

    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: "ASSISTANT", content: acc },
    ]);
    setDraft("");
    setStreaming(false);
  }

  const isEmpty = messages.length === 0 && !streaming;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Список диалогов */}
      <aside
        className={`${
          activeId ? "hidden md:flex" : "flex"
        } w-full flex-col border-r border-gray-200 bg-white md:w-72`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-gray-100 p-3">
          <BalanceBadge balance={balance} />
          <button
            type="button"
            onClick={startNew}
            className="rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-800"
          >
            + Новый
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {consultations.length === 0 ? (
            <p className="p-4 text-sm text-gray-400">Диалогов пока нет.</p>
          ) : (
            <ul className="divide-y divide-gray-50">
              {consultations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => openConsultation(c.id)}
                    className={`block w-full truncate px-4 py-3 text-left text-sm hover:bg-gray-50 ${
                      activeId === c.id ? "bg-blue-50 text-blue-800" : "text-gray-700"
                    }`}
                  >
                    {c.title || "Новый диалог"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Тред */}
      <section
        className={`${
          activeId ? "flex" : "hidden md:flex"
        } flex-1 flex-col bg-gray-50`}
      >
        {/* Мобильная шапка треда */}
        {activeId && (
          <div className="flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-2 md:hidden">
            <button
              type="button"
              onClick={() => setActiveId(null)}
              className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
            >
              ← Диалоги
            </button>
            <BalanceBadge balance={balance} />
          </div>
        )}

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {showWelcome && (
              <div className="rounded-xl bg-blue-50 p-4 text-center text-sm text-blue-800">
                🎁 Вам начислен 1 бесплатный вопрос нейроюристу. Задайте его прямо
                сейчас!
                <button
                  onClick={() => setShowWelcome(false)}
                  className="ml-2 text-blue-600 underline"
                >
                  Ок
                </button>
              </div>
            )}

            {isEmpty && (
              <div>
                <h2 className="text-center text-lg font-semibold text-gray-800">
                  С чего начать?
                </h2>
                <p className="mt-1 text-center text-sm text-gray-500">
                  Выберите вопрос или напишите свой.
                </p>
                <div className="mt-4 grid gap-2">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
                      className="rounded-2xl border border-gray-100 bg-white p-4 text-left text-sm text-gray-700 shadow-sm hover:border-blue-200 hover:shadow-md"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} role={m.role} content={m.content} />
            ))}
            {streaming && draft && (
              <MessageBubble role="ASSISTANT" content={draft} />
            )}
            {streaming && !draft && (
              <div className="text-sm text-gray-400">Нейроюрист печатает…</div>
            )}

            {noBalance && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
                Закончились вопросы. Пополните баланс, чтобы продолжить.
                <Link
                  href="/tarify"
                  className="mt-2 inline-block rounded-lg bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"
                >
                  Выбрать тариф
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Поле ввода */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t border-gray-100 bg-white p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] safe-bottom"
        >
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Опишите вашу ситуацию…"
              className="max-h-40 flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2.5 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-200 hover:bg-blue-800 disabled:opacity-50 disabled:shadow-none"
            >
              Отправить
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function MessageBubble({
  role,
  content,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
}) {
  const isUser = role === "USER";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
          isUser
            ? "bg-blue-700 text-white shadow-blue-200"
            : "border border-gray-100 bg-white text-gray-800"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
