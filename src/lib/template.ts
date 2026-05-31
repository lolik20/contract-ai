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
