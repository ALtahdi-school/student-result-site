/* main.js — الاتصال بمحور البيانات Google Sheets لجميع الصفحات */
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReghaYoMk3f8ffSBLRHIwZieEWCfk5Yx8W6c843TXkC6wpA78Z0X5nw21RRpxMdQ/pub?gid=1229272896&single=true&output=csv";

window.StudentPortal = (function(){
  let _students = null;

  // تحميل البيانات من Google Sheet
  async function loadData(){
    if(_students) return _students;
    const resp = await fetch(SHEET_URL);
    if(!resp.ok) throw new Error("فشل جلب البيانات من Google Sheet");
    const text = await resp.text();
    const rows = text.split("\n").map(r=>r.split(","));
    const header = rows[0].map(h=>h.trim());
    const dataRows = rows.slice(1);
    _students = dataRows.map(r=>{
      const obj = {};
      for(let i=0;i<header.length;i++) obj[header[i].trim()] = (r[i]||"").trim();
      return obj;
    });
    return _students;
  }

  // البحث بالوالد + كود الطالب
  async function findByParentAndCode(parent, code){
    const data = await loadData();
    return data.find(o=>{
      let p = o["رقم ولي الامر"] || o["رقم ولي الأمر"] || "";
      let c = o["كود الطالب"] || o["id"] || "";
      if(p.startsWith("0")) p=p.substring(1);
      if(c.startsWith("0")) c=c.substring(1);
      return p===parent && c===code;
    });
  }

  // البحث بالوالد + الاسم (نسيت الكود)
  async function findByParentAndName(parent, name){
    const data = await loadData();
    return data.find(o=>{
      let p = o["رقم ولي الامر"] || o["رقم ولي الأمر"] || "";
      if(p.startsWith("0")) p=p.substring(1);
      return p===parent && (o["اسم الطالب"]||"").trim()===name.trim();
    });
  }

  // حفظ جلسة الطالب
  function saveSession(student){
    localStorage.setItem("studentPortalSession", JSON.stringify(student));
  }

  // استرجاع الجلسة
  function getSession(){
    const s = localStorage.getItem("studentPortalSession");
    return s ? JSON.parse(s) : null;
  }

  // التأكد من تسجيل الدخول
  function requireLogin(redirect){
    const s = getSession();
    if(!s){ window.location.href = redirect; return false; }
    return true;
  }

  return {
    loadData,
    findByParentAndCode,
    findByParentAndName,
    saveSession,
    getSession,
    requireLogin
  };
})();
