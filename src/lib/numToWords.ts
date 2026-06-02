const ONES_M = ["","один","два","три","четыре","пять","шесть","семь","восемь","девять"];
const ONES_F = ["","одна","две","три","четыре","пять","шесть","семь","восемь","девять"];
const TEENS  = ["десять","одиннадцать","двенадцать","тринадцать","четырнадцать","пятнадцать","шестнадцать","семнадцать","восемнадцать","девятнадцать"];
const TENS   = ["","","двадцать","тридцать","сорок","пятьдесят","шестьдесят","семьдесят","восемьдесят","девяносто"];
const HUNDREDS = ["","сто","двести","триста","четыреста","пятьсот","шестьсот","семьсот","восемьсот","девятьсот"];

// [nominative-singular, genitive-singular, genitive-plural, gender: m|f]
const GROUPS: [string, string, string, "m"|"f"][] = [
  ["","","","m"],                                        // units
  ["тысяча","тысячи","тысяч","f"],                      // thousands
  ["миллион","миллиона","миллионов","m"],                // millions
  ["миллиард","миллиарда","миллиардов","m"],             // billions
];

function plural(n: number, forms: [string, string, string]): string {
  const mod100 = n % 100;
  const mod10  = n % 10;
  if (mod100 >= 11 && mod100 <= 19) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

function threeDigits(n: number, fem: boolean): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(HUNDREDS[h]);
  if (rest >= 10 && rest <= 19) {
    parts.push(TEENS[rest - 10]);
  } else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (t) parts.push(TENS[t]);
    if (o) parts.push(fem ? ONES_F[o] : ONES_M[o]);
  }
  return parts.join(" ");
}

export function numToWords(value: number): string {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return "ноль";

  const negative = value < 0;
  let n = Math.abs(Math.floor(value));

  const groups: number[] = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  const parts: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    if (g === 0) continue;
    const [sg, gen2, genN, gender] = GROUPS[i];
    const fem = gender === "f";
    const w = threeDigits(g, fem);
    if (i === 0) {
      parts.push(w);
    } else {
      parts.push(w + (sg ? " " + plural(g, [sg, gen2, genN]) : ""));
    }
  }

  return (negative ? "минус " : "") + parts.join(" ");
}

/** Format a number string as "65 000 (шестьдесят пять тысяч)" */
export function formatNumberWithWords(raw: string): string {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return raw;

  // Format integer part with thousands separator
  const intPart = Math.floor(Math.abs(num));
  const formatted = intPart.toLocaleString("ru-RU");

  const words = numToWords(num < 0 ? num : intPart);
  return `${formatted} (${words})`;
}
