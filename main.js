const SHEET_API_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReghaYoMk3f8ffSBLRHIwZieEWCfk5Yx8W6c843TXkC6wpA78Z0X5nw21RRpxMdQ/pub?gid=1229272896&single=true&output=csv";

function parseCSV(text){
  const rows=[];
  let cur='', rowArr=[], inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch = text[i], nxt = text[i+1];
    if(ch === '"'){
      if(inQuotes && nxt === '"'){ cur+='"'; i++; continue; }
      inQuotes = !inQuotes; continue;
    }
    if(ch === '\r') continue;
    if(ch === ',' && !inQuotes){ rowArr.push(cur); cur=''; continue; }
    if(ch === '\n' && !inQuotes){ rowArr.push(cur); rows.push(rowArr); rowArr=[]; cur=''; continue; }
    cur+=ch;
  }
  if(cur!=='' || rowArr.length){ rowArr.push(cur); rows.push(rowArr); }
  return rows;
}

async function fetchSheetData(){
  if(!SHEET_API_URL || SHEET_API_URL.includes("REPLACE")) throw new Error("ضع رابط Google Sheet في SHEET_API_URL");
  const resp = await fetch(SHEET_API_URL,{cache:"no-store"});
  if(!resp.ok) throw new Error("فشل في جلب البيانات من Google Sheets");
  const text = await resp.text();
  const rows = parseCSV(text);
  const header = rows[0].map(h=>h.trim());
  const dataRows = rows.slice(1);
  return dataRows.map(r=>{
    const obj={};
    for(let i=0;i<header.length;i++) obj[header[i]]=r[i]?.trim()||"";
    return obj;
  });
}

function normalizeNumber(n){ return n?.toString().trim().replace(/^0+/,''); }
function saveSession(obj){ sessionStorage.setItem('studentData',JSON.stringify(obj)); }
function getSession(){ try{return JSON.parse(sessionStorage.getItem('studentData')||'null');}catch(e){return null;} }
function requireLogin(redirect='index.html'){ if(!getSession()){ window.location.href=redirect; return false;} return true; }

async function findByParentAndCode(parent, code){
  const data = await fetchSheetData();
  parent = normalizeNumber(parent);
  code = code.toString().trim();
  return data.find(r => normalizeNumber(r['رقم ولي الامر']||r['رقم ولي الأمر']||r['رقم ولي الامر']||'') === parent
                     && ((r['كود الطالب']||r['كود']||r['id']||'') === code));
}

async function findByParentAndName(parent, fullname){
  const data = await fetchSheetData();
  parent = normalizeNumber(parent);
  fullname = (fullname||'').toString().trim().toLowerCase();
  return data.find(r => normalizeNumber(r['رقم ولي الامر']||r['رقم ولي الأمر']||r['رقم ولي الامر']||'') === parent
                       && ((r['اسم الطالب']||'').toString().trim().toLowerCase() === fullname));
}

window.PortalAPI = { fetchSheetData, findByParentAndCode, findByParentAndName, saveSession, getSession, requireLogin };
