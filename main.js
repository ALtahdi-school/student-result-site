/* main.js — مركزي للتعامل مع Google Sheet API (Apps Script Web App)
   After you deploy Apps Script as Web App, replace SHEET_API_URL with the deployed URL.
*/
const SHEET_API_URL = "REPLACE_WITH_YOUR_APPS_SCRIPT_WEBAPP_URL"; // <<<< استبدل هنا

/* robust CSV parser (if needed) - but our Apps Script returns JSON */
function parseCSV(text){
  const rows=[]; let cur='',rowArr=[],inQuotes=false;
  for(let i=0;i<text.length;i++){
    const ch = text[i], nxt = text[i+1];
    if(ch === '"'){
      if(inQuotes && nxt === '"'){ cur += '"'; i++; continue; }
      inQuotes = !inQuotes; continue;
    }
    if(ch === '\r') continue;
    if(ch === ',' && !inQuotes){ rowArr.push(cur); cur=''; continue; }
    if(ch === '\n' && !inQuotes){ rowArr.push(cur); rows.push(rowArr); rowArr=[]; cur=''; continue; }
    cur += ch;
  }
  if(cur !== '' || rowArr.length) { rowArr.push(cur); rows.push(rowArr); }
  return rows;
}

/* fetch JSON from Apps Script web app */
async function fetchSheetData(){
  if(!SHEET_API_URL || SHEET_API_URL.includes("REPLACE_WITH")) throw new Error("ضع رابط Apps Script في main.js في المتغير SHEET_API_URL");
  const resp = await fetch(SHEET_API_URL, {cache: "no-store"});
  if(!resp.ok) throw new Error("فشل في جلب البيانات من Google Sheets");
  const json = await resp.json();
  // json: { header: [...], data: [ {col: val, ...}, ... ] }
  return json;
}

/* helpers */
function normalizeNumber(n){ if(!n) return ''; return n.toString().trim().replace(/^0+/, ''); }
function saveSession(obj){ sessionStorage.setItem('studentData', JSON.stringify(obj)); }
function getSession(){ try{ return JSON.parse(sessionStorage.getItem('studentData')||'null'); }catch(e){return null;} }
function requireLogin(redirect='index.html'){ if(!getSession()){ window.location.href = redirect; return false;} return true; }

/* finders */
async function findByParentAndCode(parent, code){
  const j = await fetchSheetData();
  parent = normalizeNumber(parent); code = code.toString().trim();
  return j.data.find(r => normalizeNumber(r['رقم ولي الامر']||r['رقم ولي الأمر']||r['رقم ولي الامر']||'') === parent
                        && ((r['كود الطالب']||r['كود']||r['id']||'') === code));
}
async function findByParentAndName(parent, fullname){
  const j = await fetchSheetData();
  parent = normalizeNumber(parent); fullname = (fullname||'').toString().trim().toLowerCase();
  return j.data.find(r => normalizeNumber(r['رقم ولي الامر']||r['رقم ولي الأمر']||r['رقم ولي الامر']||'') === parent
                         && ((r['اسم الطالب']||'').toString().trim().toLowerCase() === fullname));
}

/* expose */
window.PortalAPI = {
  fetchSheetData,
  findByParentAndCode,
  findByParentAndName,
  saveSession,
  getSession,
  requireLogin
};
