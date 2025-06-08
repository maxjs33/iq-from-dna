export const num = (v, d = 0) => {
  const n = parseFloat(v);
  return Number.isNaN(n) ? d : n;
};