const SHEET_API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReghaYoMk3f8ffSBLRHIwZieEWCfk5Yx8W6c843TXkC6wpA78Z0X5nw21RRpxMdQ/pub?gid=1229272896&single=true&output=csv";

// دالة لتحليل CSV من Google Sheets
function parseCSV(text){
  const rows=[], rowArr=[];
  let cur='', inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch = text[i], nxt = text[i+1];
    if(ch === '"'){
      if(inQuotes && nxt === '"'){ cur+='"'; i++; continue; }
      inQuotes = !inQuotes; continue;
    }
    if(ch === '\r') continue;
    if(ch === ',' && !inQuotes){ rowArr.push(cur); cur=''; continue; }
    if(ch === '\n' && !inQuotes){ rowArr.push(cur); rows.push(rowArr); rowArr.length=0; cur=''; continue; }
    cur+=ch;
  }
  if(cur!=='' || rowArr.length){ rowArr.push(cur); rows.push(rowArr); }
  return rows;
}

// جلب بيانات من Google Sheet
async function fetchSheetData(){
  const resp = await fetch(SHEET_API_URL,{cache:"no-store"});
  if(!resp.ok) throw new Error("فشل في جلب البيانات");
  const text = await resp.text();
  const rows = parseCSV(text);
  const header = rows[0].map(h=>h.trim());
  const dataRows = rows.slice(1);
  return dataRows.map(r=>{
    const obj={};
    for(let i=0;i<header.length;i++) obj[header[i]] = r[i]?.trim()||"";
    return obj;
  });
}

// دوال الجلسة
function normalizeNumber(n){ return n?.toString().trim().replace(/^0+/,''); }
function saveSession(obj){ sessionStorage.setItem('studentData',JSON.stringify(obj)); }
function getSession(){ try{return JSON.parse(sessionStorage.getItem('studentData')||'null');}catch(e){return null;} }
function requireLogin(redirect='index.html'){ if(!getSession()){ window.location.href=redirect; return false;} return true; }

// البحث حسب رقم ولي الأمر وكود الطالب
async function findByParentAndCode(parent, code){
  const data = await fetchSheetData();
  parent = normalizeNumber(parent);
  code = code.toString().trim();
  return data.find(r => normalizeNumber(r['رقم ولي الامر']||'') === parent
                     && ((r['كود الطالب']||r['كود']||r['id']||'') === code));
}

// تحديث البيانات تلقائياً
async function updateStudentData(containerId){
  if(!requireLogin()) return;
  const student = getSession();
  const container = document.getElementById(containerId);
  if(!container) return;

  try{
    const record = await findByParentAndCode(student['رقم ولي الامر'], student['كود الطالب']);
    if(!record){ container.innerHTML="<p style='color:#ef4444; text-align:center;'>❌ لم أجد بيانات مطابقة.</p>"; return; }

    // بناء HTML لكل الأعمدة تلقائياً
    let html = '<table><tr>';
    Object.keys(record).forEach(col => html += `<th>${col}</th>`);
    html += '</tr><tr>';
    Object.values(record).forEach(val => html += `<td>${val}</td>`);
    html += '</tr></table>';
    container.innerHTML = html;

  }catch(err){
    console.error(err);
    container.innerHTML="<p style='color:#ef4444; text-align:center;'>❌ حدث خطأ أثناء جلب البيانات.</p>";
  }
}

// تشغيل التحديث كل ثانية
document.addEventListener('DOMContentLoaded', ()=>{
  updateStudentData('gradesData');
  setInterval(()=>updateStudentData('gradesData'),1000);
});

// تعيين PortalAPI عالمي للاستخدام في الصفحات الأخرى
window.PortalAPI = { fetchSheetData, findByParentAndCode, saveSession, getSession, requireLogin };
