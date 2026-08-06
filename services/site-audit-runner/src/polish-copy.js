const pluralRules = new Intl.PluralRules("pl-PL");

export function formatPolishCount(count, forms) {
  const value = Number(count);
  const category = pluralRules.select(value);
  const form = forms[category] || forms.many || forms.other;
  if (!Number.isFinite(value) || !form) throw new TypeError("Nieprawidłowe dane polskiej odmiany liczebnika.");
  return `${value} ${form}`;
}
