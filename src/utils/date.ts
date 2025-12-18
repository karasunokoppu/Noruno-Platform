export const toYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseYMD = (s: string) => {
  const parts = s.split(/[-\/]/).map(Number);
  if (parts.length < 3) return new Date(NaN);
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
};

export const formatReadable = (d: Date) => {
  return d.toLocaleDateString();
};

export default { toYMD, parseYMD, formatReadable };
