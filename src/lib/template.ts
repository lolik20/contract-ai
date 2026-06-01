const RU_MONTHS = [
  "января","февраля","марта","апреля","мая","июня",
  "июля","августа","сентября","октября","ноября","декабря",
];

/** Convert YYYY-MM-DD → "dd месяца yyyy г." */
export function formatDateRu(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [, y, mo, d] = m;
  return `${parseInt(d)} ${RU_MONTHS[parseInt(mo) - 1]} ${y} г.`;
}

/**
 * Format field values before passing to renderTemplate.
 * DATE fields are converted from YYYY-MM-DD to Russian long date.
 */
export function formatValues(
  values: Record<string, string>,
  fields: { name: string; type: string }[]
): Record<string, string> {
  const result: Record<string, string> = { ...values };
  for (const f of fields) {
    if (f.type === "DATE" && result[f.name]) {
      result[f.name] = formatDateRu(result[f.name]);
    }
  }
  return result;
}

export function renderTemplate(
  html: string,
  values: Record<string, string>
): string {
  return Object.entries(values).reduce((result, [key, val]) => {
    const replacement = val
      ? val
      : `<span class="placeholder-empty">{{${key}}}</span>`;
    return result.replaceAll(`{{${key}}}`, replacement);
  }, html);
}
