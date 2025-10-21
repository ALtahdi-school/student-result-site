const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxpge4rpbNb-dzD8xGsRLJXg0WHsELwzPNvJzwtlXhZ7o13L8QWIrlw89dyyP0xjq31/exec";

let currentStudent = null;
let allStudents = [];
let allNotifications = [];

// GSAP Animation عند التحميل
window.addEventListener('DOMContentLoaded', ()=> {
  gsap.from('.input-group input, #loginBtn, #forgotBtn', {duration:0.8,opacity:0,y:30,stagger:0.1});
  gsap.from('header',{duration:0.8,opacity:0,y:-30});
});

// تسجيل الدخول
document.getElementById('loginBtn').addEventListener('click', async ()=>{
  const parent = document.getElementById('parentNumber').value.trim();
  const code = document.getElementById('studentCode').value.trim();
  if(!parent || !code){ alert("ادخل جميع البيانات"); return;}
  const res = await fetch(SHEET_API_URL);
  const data = await res.json();
  allStudents = data;
  currentStudent = allStudents.find(s=> s["رقم ولي الامر"]==parent && s["كود الطالب"]==code);
  if(!currentStudent){ alert("البيانات غير صحيحة"); return;}
  document.getElementById('loginForm').style.display='none';
  showAllSections();
  populateAccount();
  populateFinance();
  populateGrades();
  populateNotifications();
  populateChat();
  saveLoginStatus("تم تسجيل الدخول");
});

// تسجيل الخروج
document.getElementById('logoutBtn').addEventListener('click', ()=>{
  currentStudent=null;
  document.getElementById('loginForm').style.display='flex';
  hideAllSections();
  saveLoginStatus("خارج");
});

// حفظ التعديلات
document.getElementById('saveBtn').addEventListener('click', ()=>{
  updateStudentData();
  alert("تم حفظ التعديلات");
});

// إرسال رسالة في الدردشة
document.getElementById('sendChatBtn').addEventListener('click', ()=>{
  const msg = document.getElementById('chatInput').value.trim();
  if(!msg) return;
  addChatMessage(currentStudent["اسم الطالب"],msg);
  document.getElementById('chatInput').value='';
});

function showAllSections(){
  document.querySelectorAll('.section').forEach(s=> s.style.display='block');
}
function hideAllSections(){
  document.querySelectorAll('.section').forEach(s=> s.style.display='none');
}

// عرض معلومات الحساب
function populateAccount(){
  const table = document.getElementById('generalInfoTable');
  table.innerHTML='';
  const editable = ["رقم ولي الامر","رقم الخط","رقم الطالب","المدرسة القادم منها","العنوان","اسم الام"];
  for(let key in currentStudent){
    if(editable.includes(key)){
      table.innerHTML+=`<tr><td>${key}</td><td><input value="${currentStudent[key]}" onchange="currentStudent['${key}']=this.value"></td></tr>`;
    }else{
      table.innerHTML+=`<tr><td>${key}</td><td>${currentStudent[key]}</td></tr>`;
    }
  }
}

// عرض المعلومات المالية
function populateFinance(){
  const table = document.getElementById('financialTable');
  table.innerHTML='';
  const financeFields = ["القسط 1","تاريخ 1","القسط 2","تاريخ 2","القسط 3","تاريخ 3","القسط 4","تاريخ 4","القسط 5","تاريخ 5","القسط 6","تاريخ 6","القسط 7","تاريخ 7","القسط 8","تاريخ 8","الباقي الكلي","المبلغ الكلي","الواصل الكلي","الكفالة","مبلغ الكفالة"];
  financeFields.forEach(f=>{
    table.innerHTML+=`<tr><td>${f}</td><td>${currentStudent[f]}</td></tr>`;
  });
}

// عرض الدرجات
function populateGrades(){
  const table = document.getElementById('gradesTable');
  table.innerHTML='';
  const gradeFields = Object.keys(currentStudent).filter(k=> k.includes("شهر") || k.includes("فصل") || k.includes("السعي") || k.includes("التقدير") || k.includes("الامتحان النهائي"));
  gradeFields.forEach(f=>{
    table.innerHTML+=`<tr><td>${f}</td><td>${currentStudent[f]}</td></tr>`;
  });
}

// التبليغات
function populateNotifications(){
  const div = document.getElementById('notificationsArea');
  div.innerHTML='';
  const notifications = allStudents.filter(s=> s["تبليغات"] && s["الصف"]==currentStudent["الصف"]);
  if(notifications.length==0){ div.innerHTML="لا توجد تبليغات"; return;}
  notifications.forEach(n=>{
    div.innerHTML+=`<div style="border-bottom:1px solid #ccc; margin:5px 0; padding:5px;">${n["تبليغات"]}</div>`;
  });
}

// الدردشة
function populateChat(){
  const div = document.getElementById('chatArea');
  div.innerHTML='';
  const chats = allStudents.filter(s=> s["الصف"]==currentStudent["الصف"]);
  chats.forEach(c=>{
    for(let i=1;i<=5;i++){
      const msg = c[`دردشة ${i}`];
      if(msg) div.innerHTML+=`<div><small>${c["اسم الطالب"]} - ${new Date().toLocaleTimeString()}</small><br>${msg}</div>`;
    }
  });
}

// إضافة رسالة
function addChatMessage(name,msg){
  // تحريك الدردشات للخلف إذا وصلنا 5 رسائل
  for(let i=1;i<5;i++){
    currentStudent[`دردشة ${i}`] = currentStudent[`دردشة ${i+1}`];
  }
  currentStudent["دردشة 5"] = msg;
  populateChat();
  updateStudentData();
}

// تحديث البيانات في Google Sheet
async function updateStudentData(){
  await fetch(SHEET_API_URL,{
    method:'POST',
    body:JSON.stringify(currentStudent)
  });
}

// حفظ حالة تسجيل الدخول/الخروج
function saveLoginStatus(status){
  currentStudent["الحالة"] = status;
  updateStudentData();
}

// تحديث تلقائي كل ثانية
setInterval(async ()=>{
  if(currentStudent){
    const res = await fetch(SHEET_API_URL);
    allStudents = await res.json();
    currentStudent = allStudents.find(s=> s["كود الطالب"]==currentStudent["كود الطالب"]);
    populateAccount();
    populateFinance();
    populateGrades();
    populateNotifications();
    populateChat();
  }
},1000);
