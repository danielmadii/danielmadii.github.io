const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const parts = (value) => {
  if (!value) return null;
  const match = String(value).match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!match) throw new Error(`Invalid date "${value}". Use YYYY, YYYY-MM or YYYY-MM-DD.`);
  return { year: Number(match[1]), month: match[2] ? Number(match[2]) : null, day: match[3] ? Number(match[3]) : null };
};

export const validateDate = (value) => {
  parts(value);
  return value;
};

export const formatDate = (value) => {
  const p = parts(value);
  if (!p) return "";
  return p.month ? `${MONTHS[p.month - 1]} ${p.year}` : String(p.year);
};

export const formatLongDate = (date) => `${date.getUTCDate()} ${MONTHS_LONG[date.getUTCMonth()]} ${date.getUTCFullYear()}`;

export const formatRange = (start, end, { open = "present" } = {}) => {
  if (!start && !end) return "";
  const a = formatDate(start);
  const b = end ? formatDate(end) : open;
  if (!start) return b;
  return a === b ? a : `${a} – ${b}`;
};

export const sortKey = (value) => {
  const p = parts(value);
  if (!p) return "0000-00-00";
  return `${p.year}-${String(p.month ?? 0).padStart(2, "0")}-${String(p.day ?? 0).padStart(2, "0")}`;
};

export const toDate = (value, { end = false } = {}) => {
  const p = parts(value);
  if (!p) return null;
  if (end) {
    const month = p.month ?? 12;
    return new Date(Date.UTC(p.year, month, 0));
  }
  return new Date(Date.UTC(p.year, (p.month ?? 1) - 1, p.day ?? 1));
};

export const isoDate = (value) => {
  const d = toDate(value);
  return d ? d.toISOString().slice(0, 10) : "";
};

export const machineDate = (value) => {
  const p = parts(value);
  if (!p) return "";
  return [p.year, p.month && String(p.month).padStart(2, "0"), p.day && String(p.day).padStart(2, "0")].filter(Boolean).join("-");
};

export const rfc822 = (value) => toDate(value).toUTCString();
