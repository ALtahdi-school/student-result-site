// رابط Google Sheet بعد نشره كـ CSV
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReghaYoMk3f8ffSBLRHIwZieEWCfk5Yx8W6c843TXkC6wpA78Z0X5nw21RRpxMdQ/pub?output=csv";

// مصفوفة لتخزين البيانات بعد التحويل
let STUDENTS_DATA = [];

// تحويل CSV إلى كائنات JS
function parseCSV(text) {
  const rows = [];
  let cur = '', row = [], inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i], next = text[i+1];
    if (ch === '"') {
      if (inQuotes && next === '"') { cur+='"'; i++; continue; }
      inQuotes = !inQuotes; continue;
    }
    if (ch === '\r') continue;
    if (ch === ',' && !inQuotes) { row.push(cur); cur=''; continue; }
    if (ch === '\n' && !inQuotes) { row.push(cur); rows.push(row); row=[]; cur=''; continue; }
    cur += ch;
  }
  if (cur!='' || row.length>0) { row.push(cur); rows.push(row); }
  return rows;
}

// جلب البيانات من Google Sheets
async function fetchStudentsData() {
  try {
    const resp = await fetch(SHEET_URL);
    if(!resp.ok) throw new Error("فشل تحميل البيانات");
    const text = await resp.text();
    const rows = parseCSV(text).filter(r=>r.some(c=>c.trim()!=''));
    if(rows.length < 2) return;
    const header = rows[0].map(h=>h.trim());
    STUDENTS_DATA = rows.slice(1).map(r=>{
      const obj = {};
      for(let i=0;i<header.length;i++){
        obj[header[i]] = r[i] ? r[i].trim() : '';
      }
      return obj;
    });
    console.log("تم تحميل البيانات بنجاح:", STUDENTS_DATA.length, "طالب");
  } catch(err){
    console.error("حدث خطأ أثناء تحميل البيانات:", err);
  }
}

// تنفيذ التحميل فور الاستدعاء
fetchStudentsData();
