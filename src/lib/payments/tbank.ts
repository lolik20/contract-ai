import { createHash } from "crypto";

// Интеграция с Т-Кассой (эквайринг Т-Банк / Tinkoff).
// Docs: https://www.tinkoff.ru/kassa/dev/payments/

const INIT_URL = "https://securepay.tinkoff.ru/v2/Init";

export function isPaymentsConfigured(): boolean {
  return Boolean(process.env.TBANK_TERMINAL_KEY && process.env.TBANK_PASSWORD);
}

/**
 * Подпись запроса Т-Кассы (Token): берём корневые скалярные параметры,
 * добавляем Password, сортируем по ключу, конкатенируем значения, SHA-256.
 */
export function signTBank(
  params: Record<string, string | number | boolean>,
  password: string
): string {
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    if (typeof v === "object") continue; // вложенные объекты (Receipt/DATA) не участвуют
    data[k] = String(v);
  }
  data.Password = password;

  const concatenated = Object.keys(data)
    .sort()
    .map((k) => data[k])
    .join("");

  return createHash("sha256").update(concatenated, "utf8").digest("hex");
}

export interface InitParams {
  orderId: string;
  amountKopecks: number;
  description: string;
}

export interface InitResult {
  success: boolean;
  paymentId?: string;
  paymentUrl?: string;
  errorCode?: string;
  message?: string;
}

/** Инициализация платежа: возвращает PaymentURL для редиректа на форму банка. */
export async function initPayment(p: InitParams): Promise<InitResult> {
  const terminalKey = process.env.TBANK_TERMINAL_KEY!;
  const password = process.env.TBANK_PASSWORD!;
  const base = process.env.NEXT_PUBLIC_SITE_URL || "";

  const signable = {
    TerminalKey: terminalKey,
    Amount: p.amountKopecks,
    OrderId: p.orderId,
    Description: p.description,
  };
  const token = signTBank(signable, password);

  const body = {
    ...signable,
    Token: token,
    NotificationURL: `${base}/api/payments/webhook`,
    SuccessURL: `${base}/kabinet?paid=1`,
    FailURL: `${base}/tarify?error=1`,
  };

  const res = await fetch(INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as {
    Success: boolean;
    PaymentId?: string | number;
    PaymentURL?: string;
    ErrorCode?: string;
    Message?: string;
  };

  return {
    success: Boolean(data.Success),
    paymentId: data.PaymentId != null ? String(data.PaymentId) : undefined,
    paymentUrl: data.PaymentURL,
    errorCode: data.ErrorCode,
    message: data.Message,
  };
}

export interface WebhookPayload {
  TerminalKey: string;
  OrderId: string;
  Success: boolean;
  Status: string;
  PaymentId: string | number;
  Amount: number;
  Token: string;
  [key: string]: unknown;
}

/** Проверка подписи входящей нотификации Т-Кассы. */
export function verifyWebhook(payload: WebhookPayload): boolean {
  const password = process.env.TBANK_PASSWORD;
  if (!password) return false;

  const { Token, Receipt, DATA, ...rest } = payload as Record<string, unknown>;
  void Receipt;
  void DATA;

  const signable: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(rest)) {
    if (typeof v === "object" || v === undefined || v === null) continue;
    signable[k] = v as string | number | boolean;
  }
  const expected = signTBank(signable, password);
  return expected === Token;
}
