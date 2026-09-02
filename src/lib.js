// @ts-check
/**
 * Funções puras do Hemocentro JP — sem DOM, sem Firebase, testáveis isoladamente.
 * Importadas por index.html e por tests/lib.test.js.
 */

/** Escapa texto livre para inserção segura em HTML. */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/** Nome curto (até `n` palavras) já escapado para HTML. */
export const nm = (s, n = 3) =>
  esc(String(s || "").trim().split(/\s+/).slice(0, n).join(" "));

/** Data + hora em pt-BR; "—" para valor ausente ou inválido. */
export const fmtDT = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? "—" : d.toLocaleString("pt-BR");
};

/** Só a data em pt-BR; "—" para valor ausente ou inválido. */
export const fmtD = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
};

/**
 * Duração humana entre `i` (início) e `f` (fim; usa agora se ausente).
 * @param {string|number|Date} i
 * @param {string|number|Date|null} [f]
 */
export const dur = (i, f) => {
  if (!i) return "—";
  const m = Math.round((+new Date(f || Date.now()) - +new Date(i)) / 60000);
  if (isNaN(m)) return "—";
  if (m < 1) return "<1min";
  return m < 60 ? m + "min" : Math.floor(m / 60) + "h" + (m % 60 ? " " + (m % 60) + "min" : "");
};

/** Iniciais (até 2) a partir do nome; "?" se vazio. */
export const ini = (n) =>
  String(n || "?").trim().split(/\s+/).slice(0, 2).map((x) => x[0] || "").join("").toUpperCase() || "?";

const PALETA = ["#1565C0", "#7B1FA2", "#00695C", "#2E7D32", "#C62828", "#E65100", "#1976D2", "#D81B60"];
/** Cor estável derivada do nome (para avatares). */
export const clr = (n) => {
  let h = 0;
  for (const c of String(n || "?")) h = (h * 31 + c.charCodeAt(0)) % PALETA.length;
  return PALETA[h];
};

/**
 * Início do período de um relatório.
 * @param {"hoje"|"7d"|"mes"|"tudo"} per
 * @param {Date} [now]
 * @returns {Date}
 */
export const periodoInicio = (per, now = new Date()) => {
  if (per === "hoje") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (per === "7d") return new Date(+now - 7 * 864e5);
  if (per === "mes") return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date(0);
};

/**
 * Intervalo [desde, ate) de um mês no formato "AAAA-MM" (ex.: "2026-09").
 * `ate` é exclusivo (1º dia do mês seguinte). Devolve null se inválido.
 * @param {string} mv
 * @returns {{desde: Date, ate: Date, rotulo: string} | null}
 */
export const mesRange = (mv) => {
  const m = /^(\d{4})-(\d{2})$/.exec(String(mv || ""));
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2] - 1;
  if (mo < 0 || mo > 11) return null;
  const desde = new Date(y, mo, 1);
  return {
    desde,
    ate: new Date(y, mo + 1, 1),
    rotulo: desde.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
  };
};

/**
 * Dias do mês (depois de `day`) que caem no mesmo dia da semana — para a
 * opção "repetir toda semana" da escala.
 * @returns {number[]}
 */
export const diasRepetidos = (day, month, year) => {
  const wd = new Date(year, month, day).getDay();
  const dim = new Date(year, month + 1, 0).getDate();
  const out = [];
  for (let d = day + 1; d <= dim; d++) if (new Date(year, month, d).getDay() === wd) out.push(d);
  return out;
};

/** Uma linha do CSV: aspas + escape de aspas internas, separador `;`. */
export const csvRow = (cols, sep = ";") =>
  cols.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(sep);
