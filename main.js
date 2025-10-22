// -------------------- إعداد رابط Google Apps Script --------------------
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby4oH2SrV2-8PqYZFcoJnZM9_AZ0X-l3Ol_urEsty-PmJ9RLrCKQdYaXjd34hTYah-cOA/exec";

// -------------------- تسجيل الدخول --------------------
async function login(studentCode, parentNumber) {
  if(!studentCode || !parentNumber){
    alert("الرجاء إدخال رقم ولي الأمر وكود الطالب.");
    return null;
  }
  
  const students = await fetchData();
  const student = students.find(s => s["كود الطالب"] === studentCode && s["رقم ولي الامر"] === parentNumber);
  if(!student){
    alert("بيانات خاطئة أو غير موجودة.");
    return null;
  }

  // حفظ الجلسة
  localStorage.setItem("student", JSON.stringify(student));
  await updateStatus(student.id, "دخول"); // تحديث الحالة في Google Sheet
  return student;
}

// -------------------- تسجيل الخروج --------------------
async function logout() {
  const student = getCurrentStudent();
  if(student) await updateStatus(student.id, "خروج");
  localStorage.removeItem("student");
  window.location.href = "login.html";
}

// -------------------- جلب بيانات جميع الطلاب --------------------
async function fetchData() {
  try {
    const resp = await fetch(SHEET_API_URL);
    const json = await resp.json();
    if(json.status === "success") return json.data;
    else throw new Error(json.message);
  } catch(err) {
    console.error(err);
    alert("فشل الاتصال بالبيانات.");
    return [];
  }
}

// -------------------- جلب الطالب الحالي --------------------
function getCurrentStudent() {
  const student = localStorage.getItem("student");
  return student ? JSON.parse(student) : null;
}

// -------------------- تحديث الحالة --------------------
async function updateStatus(studentId, status) {
  try {
    await fetch(SHEET_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateStatus", id: studentId, status }),
    });
  } catch(err) {
    console.error("خطأ في تحديث الحالة:", err);
  }
}

// -------------------- تحديث بيانات الطالب --------------------
async function updateStudentData(studentId, updates) {
  try {
    const resp = await fetch(SHEET_API_URL, {
      method: "POST",
      body: JSON.stringify({ action: "updateStudent", id: studentId, updates }),
    });
    const json = await resp.json();
    return json;
  } catch(err) {
    console.error(err);
    return { status: "error", message: err.message };
  }
}

// -------------------- إدارة الدردشة --------------------
async function addChatMessage(message) {
  const student = getCurrentStudent();
  if(!student) return;

  // تحديد عمود دردشة فارغ (1–5)
  let chatIndex = 0;
  for(let i=1; i<=5; i++){
    if(!student["دردشة " + i] || student["دردشة " + i].trim() === ""){
      chatIndex = i; break;
    }
  }
  // إذا جميع الأعمدة ممتلئة، ندوّر الرسائل
  if(chatIndex === 0){
    for(let i=1; i<5; i++){
      student["دردشة " + i] = student["دردشة " + (i+1)];
    }
    chatIndex = 5;
  }

  student["دردشة " + chatIndex] = message;
  await fetch(SHEET_API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "updateChat", id: student.id, chatNumber: chatIndex, message }),
  });
}

// -------------------- إدارة التبليغات --------------------
async function addNotification(notification) {
  const student = getCurrentStudent();
  if(!student) return;

  if(student["الصف"] !== "الإدارة") {
    alert("غير مصرح لك بإضافة تبليغ.");
    return;
  }

  await fetch(SHEET_API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "addNotification", id: student.id, notification }),
  });
}

// -------------------- جلب التبليغات --------------------
async function fetchNotifications() {
  const students = await fetchData();
  return students.map(s => s["تبليغات"] || "").filter(t => t.trim() !== "");
}

// -------------------- مثال استخدام في صفحة الحساب --------------------
function displayStudentInfo() {
  const student = getCurrentStudent();
  if(!student) return;

  const infoDiv = document.getElementById("studentInfo");
  infoDiv.innerHTML = `
    <h3>المعلومات العامة</h3>
    <p>الاسم: ${student["اسم الطالب"]}</p>
    <p>الصف: ${student["الصف"]}</p>
    <p>رقم ولي الأمر: ${student["رقم ولي الامر"]}</p>
    <p>رقم الخط: ${student["رقم الخط"]}</p>
    <!-- أضف باقي الحقول حسب الحاجة -->
  `;
}

// -------------------- مثال استخدام في صفحة التبليغات --------------------
async function displayNotifications() {
  const notifDiv = document.getElementById("notifications");
  const notifications = await fetchNotifications();
  notifDiv.innerHTML = notifications.map(n => `<p>${n}</p>`).join("");
}
