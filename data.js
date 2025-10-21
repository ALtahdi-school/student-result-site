const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReghaYoMk3f8ffSBLRHIwZieEWCfk5Yx8W6c843TXkC6wpA78Z0X5nw21RRpxMdQ/pub?output=csv";

function parseCSV(text) {
  const rows = [];
  let cur = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"') { if (inQuotes && next === '"') { cur += '"'; i++; continue; } inQuotes = !inQuotes; continue; }
    if (ch === '\r') continue;
    if (ch === ',' && !inQuotes) { row.push(cur); cur = ''; continue; }
    if (ch === '\n' && !inQuotes) { row.push(cur); rows.push(row); row = []; cur = ''; continue; }
    cur += ch;
  }
  if (cur !== '' || row.length > 0) { row.push(cur); rows.push(row); }
  return rows;
}

async function fetchSheetObjects() {
  const resp = await fetch(SHEET_URL);
  if (!resp.ok) throw new Error("فشل جلب البيانات");
  const text = await resp.text();
  const rows = parseCSV(text).filter(r => r.some(c => c.trim() !== ''));
  if (rows.length === 0) return { header: [], rows: [] };
  const header = rows[0].map(h => (h || '').toString().trim());
  const dataRows = rows.slice(1);
  const objects = dataRows.map(r => {
    const obj = {};
    for (let i = 0; i < header.length; i++) { obj[header[i]] = (r[i] || '').toString().trim(); }
    return obj;
  });
  return { header, rows: objects };
}
