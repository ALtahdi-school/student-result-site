const SHEET_API_URL = "ضع رابط Web App هنا";

let STUDENTS_DATA=[];
let currentStudent=null;
let refreshIntervalId;
let chatHistory=[];

// parse CSV
function parseCSV(text){
  const rows=text.split("\n").map(r=>r.split(","));
  return rows;
}

// fetch data
async function fetchStudentsData(){
  try{
    const resp = await fetch(SHEET_API_URL);
    const text = await resp.text();
    const rows=parseCSV(text).filter(r=>r.some(c=>c.trim()!=""));
    const header = rows[0];
    STUDENTS_DATA = rows.slice(1).map(r=>{
      let obj={};
      header.forEach((h,i)=>obj[h.trim()]=r[i]?r[i].trim():"");
      return obj;
    });
  }catch(e){console.error(e);}
}

// login
document.getElementById("loginBtn").addEventListener("click", async ()=>{
  const parent = document.getElementById("parentNumber").value.trim();
  const code = document.getElementById("studentCode").value.trim();
  await fetchStudentsData();
  currentStudent = STUDENTS_DATA.find(s=>s["رقم ولي الامر"]==parent && s["كود الطالب"]==code);
  if(!currentStudent){
    alert("كود خاطئ");
    updateStatus(parent, code,"خطاء");
    return;
  }
  updateStatus(parent, code,"تم تسجيل الدخول");
  document.getElementById("loginPage").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");
  startAutoRefresh();
});

// logout
document.getElementById("logoutBtn").addEventListener("click", ()=>{
  document.getElementById("loginPage").classList.remove("hidden");
  document.getElementById("mainPage").classList.add("hidden");
  clearInterval(refreshIntervalId);
  updateStatus(currentStudent["رقم ولي الامر"], currentStudent["كود الطالب"],"تم تسجيل الخروج");
});

// save edits
document.getElementById("saveBtn").addEventListener("click", ()=>{
  const editableFields=["رقم الطالب","رقم الخط","رقم ولي الامر","المدرسة القادم منها","العنوان","اسم الام"];
  editableFields.forEach(f=>{
    const el=document.querySelector(`[data-field="${f}"]`);
    if(el) currentStudent[f]=el.value;
  });
  saveToSheet(currentStudent);
});

// auto refresh
function startAutoRefresh(){
  refreshIntervalId=setInterval(()=>{
    populateAccount();
    populateFinancial();
    populateGrades();
    populateNotifications();
    populateChat();
  },1000);
}

// populate account
function populateAccount(){
  const table=document.getElementById("generalInfoTable");
  table.innerHTML="";
  const fields=["id","اسم الطالب","الصف","القاعة","الجنس","رقم ولي الامر","رقم الخط","الملاحظات",
                "رقم الطالب","الكتب","العنوان","اسم الام","المدرسة القادم منها","المعدل في الصف السابق"];
  fields.forEach(f=>{
    const tr=document.createElement("tr");
    const val=currentStudent[f] || "";
    if(["رقم الطالب","رقم الخط","رقم ولي الامر","المدرسة القادم منها","العنوان","اسم الام"].includes(f)){
      tr.innerHTML=`<th>${f}</th><td><input data-field="${f}" value="${val}"></td>`;
    }else{
      tr.innerHTML=`<th>${f}</th><td>${val}</td>`;
    }
    table.appendChild(tr);
  });
}

// باقي populateFinancial, populateGrades, populateNotifications, populateChat
// يمكن استخدام نفس الكود السابق لكل الحقول الكبيرة مثل الدرجات والتبليغات والدردشة

// update status in sheet
function updateStatus(parent, code, status){
  // هنا يمكن إضافة call لـ Apps Script لتحديث العمود الحالة
}

// save edited data
function saveToSheet(student){
  // call Apps Script لتحديث بيانات الطالب
}
