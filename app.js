// رابط Google Apps Script Web App
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby4oH2SrV2-8PqYZFcoJnZM9_AZ0X-l3Ol_urEsty-PmJ9RLrCKQdYaXjd34hTYah-cOA/exec";

// -------------------- تخزين الجلسة --------------------
let currentUser = null;

// -------------------- صفحة تسجيل الدخول --------------------
async function login() {
  const parentNum = document.getElementById("parentNum").value.trim();
  const studentCode = document.getElementById("studentCode").value.trim();
  if (!parentNum || !studentCode) return alert("يرجى إدخال رقم ولي الأمر وكود الطالب");

  // جلب البيانات من Google Sheet
  const res = await fetch(SHEET_API_URL);
  const students = await res.json();

  const user = students.find(s => s["رقم ولي الامر"] == parentNum && s["كود الطالب"] == studentCode);
  if (!user) return alert("رقم ولي الأمر أو كود الطالب غير صحيح");

  currentUser = user;
  sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
  showPage("accountPage");
  loadAccount();
}

// -------------------- عرض الصفحة المطلوبة --------------------
function showPage(pageId) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}

// -------------------- تسجيل الخروج --------------------
function logout() {
  sessionStorage.removeItem("currentUser");
  currentUser = null;
  showPage("loginPage");
}

// -------------------- تحميل بيانات الحساب --------------------
function loadAccount() {
  if (!currentUser) return;

  const fields = {
    infoId: "id",
    infoName: "اسم الطالب",
    infoClass: "الصف",
    infoRoom: "القاعة",
    infoGender: "الجنس",
    infoParent: "رقم ولي الامر",
    infoLine: "رقم الخط",
    infoNotes: "الملاحظات",
    infoStudentNum: "رقم الطالب",
    infoBooks: "الكتب",
    infoAddress: "العنوان",
    infoMother: "اسم الام",
    infoSchool: "المدرسة القادم منها",
    infoPrevGrade: "المعدل في الصف السابق",
    fee1: "القسط 1", date1: "تاريخ 1",
    fee2: "القسط 2", date2: "تاريخ 2",
    fee3: "القسط 3", date3: "تاريخ 3",
    fee4: "القسط 4", date4: "تاريخ 4",
    fee5: "القسط 5", date5: "تاريخ 5",
    fee6: "القسط 6", date6: "تاريخ 6",
    fee7: "القسط 7", date7: "تاريخ 7",
    fee8: "القسط 8", date8: "تاريخ 8",
    remaining: "الباقي الكلي", total: "المبلغ الكلي",
    paid: "الواصل الكلي", guarantee: "الكفالة",
    guaranteeAmount: "مبلغ الكفالة"
  };

  for (let id in fields) {
    const value = currentUser[fields[id]] || "---";
    document.getElementById(id).innerText = value;
  }
}

// -------------------- التبليغات --------------------
async function addNotification() {
  if (!currentUser) return;
  if (currentUser["الصف"] !== "الإدارة") return alert("غير مسموح لك بإضافة تبليغ");

  const text = document.getElementById("newNotification").value.trim();
  if (!text) return;

  const body = { action: "addNotification", id: currentUser.id, notification: text };
  const res = await fetch(SHEET_API_URL, {
    method: "POST",
    body: JSON.stringify(body)
  });
  const result = await res.json();
  alert(result.message);
  document.getElementById("newNotification").value = "";
  loadNotifications();
}

// تحميل التبليغات
async function loadNotifications() {
  const res = await fetch(SHEET_API_URL);
  const students = await res.json();
  const container = document.getElementById("allNotifications");
  container.innerHTML = "";

  students.forEach(s => {
    if (s["تبليغات"]) {
      s["تبليغات"].split("\n").forEach(n => {
        const p = document.createElement("p");
        p.innerText = n;
        container.appendChild(p);
      });
    }
  });
}

// -------------------- الدردشة --------------------
async function sendMessage(chatNumber) {
  if (!currentUser) return;
  const msgInput = document.getElementById("chatInput" + chatNumber);
  const message = msgInput.value.trim();
  if (!message) return;

  const body = { action: "updateChat", id: currentUser.id, chatNumber, message };
  await fetch(SHEET_API_URL, { method: "POST", body: JSON.stringify(body) });
  msgInput.value = "";
  loadChat();
}

// تحميل الدردشة
async function loadChat() {
  const res = await fetch(SHEET_API_URL);
  const students = await res.json();
  const user = students.find(s => s.id == currentUser.id);
  if (!user) return;

  for (let i = 1; i <= 5; i++) {
    const el = document.getElementById("chatInput" + i);
    el.value = user["دردشة " + i] || "";
  }
}

// -------------------- الدرجات --------------------
async function loadGrades() {
  if (!currentUser) return;
  const res = await fetch(SHEET_API_URL);
  const students = await res.json();
  const user = students.find(s => s.id == currentUser.id);
  if (!user) return;

  document.getElementById("islamicMonth1").innerText = user["اسلامية شهر 1"] || "---";
  document.getElementById("islamicMonth2").innerText = user["اسلامية شهر 2"] || "---";
  document.getElementById("islamicTerm1").innerText = user["اسلامية فصل 1"] || "---";
}

// -------------------- تنزيل الدرجات --------------------
function downloadGrades() {
  if (!currentUser) return;
  const csvContent = "data:text/csv;charset=utf-8," +
    Object.keys(currentUser).join(",") + "\n" +
    Object.values(currentUser).join(",");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "grades.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -------------------- عند تحميل الصفحة --------------------
window.onload = () => {
  const savedUser = sessionStorage.getItem("currentUser");
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showPage("accountPage");
    loadAccount();
    loadNotifications();
    loadChat();
    loadGrades();
  } else {
    showPage("loginPage");
  }
};
