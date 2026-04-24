export type DateRange = {
  from: string;
  to: string;
};

export function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return startOfDay(next);
}

export function subtractDays(date: Date, amount: number) {
  return addDays(date, -amount);
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function toYearMonth(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
  ].join("-");
}

export function yearMonthFromDateKey(dateKey: string) {
  return dateKey.slice(0, 7);
}

export function eachDay(range: DateRange) {
  const start = parseDateKey(range.from);
  const end = parseDateKey(range.to);
  const days: string[] = [];

  for (
    let cursor = startOfDay(start);
    cursor <= end;
    cursor = addDays(cursor, 1)
  ) {
    days.push(toDateKey(cursor));
  }

  return days;
}

export function clampDateKey(value: string, min: string, max: string) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

function resolveDateLocale(locale?: string) {
  if (locale) return locale;
  if (typeof document !== "undefined") {
    return document.documentElement.lang || "en";
  }
  return "en";
}

export function formatLongDate(value: string, locale?: string) {
  return new Intl.DateTimeFormat(resolveDateLocale(locale), {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parseDateKey(value));
}

export function formatMonthLabel(range: DateRange, locale?: string) {
  const start = parseDateKey(range.from);
  const end = parseDateKey(range.to);
  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();

  if (sameMonth) {
    return new Intl.DateTimeFormat(resolveDateLocale(locale), {
      month: "long",
      year: "numeric",
    }).format(start);
  }

  const formatter = new Intl.DateTimeFormat(resolveDateLocale(locale), {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function getCurrentMonthRange(
  today = startOfDay(new Date()),
): DateRange {
  return {
    from: toDateKey(startOfMonth(today)),
    to: toDateKey(endOfMonth(today)),
  };
}

export function getRollingRange(
  days: number,
  today = startOfDay(new Date()),
): DateRange {
  return {
    from: toDateKey(subtractDays(today, days - 1)),
    to: toDateKey(today),
  };
}
