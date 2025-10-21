// رابط الـ API بعد نشر Google Apps Script
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxpge4rpbNb-dzD8xGsRLJXg0WHsELwzPNvJzwtlXhZ7o13L8QWIrlw89dyyP0xjq31/exec";

// مصفوفة لتخزين البيانات بعد التحويل
let STUDENTS_DATA = [];

// تحميل البيانات من Google Sheet
async function fetchStudentsData() {
  try {
    const resp = await fetch(SHEET_API_URL);
    if (!resp.ok) throw new Error("فشل تحميل البيانات");
    const data = await resp.json(); // تأكد أن الـ Apps Script يعيد JSON
    STUDENTS_DATA = data.map(row => {
      let obj = {};
      Object.keys(row).forEach(k => obj[k.trim()] = row[k] ? row[k].trim() : "");
      return obj;
    });
    console.log("تم تحميل البيانات بنجاح:", STUDENTS_DATA.length, "طالب");
  } catch (err) {
    console.error("حدث خطأ أثناء تحميل البيانات:", err);
  }
}

// دالة البحث عن الطالب
function findStudent(parent, code) {
  return STUDENTS_DATA.find(s => 
    String(s["رقم ولي الامر"] || s["parent"] || "").trim() === parent.trim() &&
    String(s["كود الطالب"] || s["id"] || "").trim() === code.trim()
  );
}

// تسجيل الدخول
document.getElementById('loginBtn').addEventListener('click', async () => {
  const parent = document.getElementById('parentNumber').value.trim();
  const code = document.getElementById('studentCode').value.trim();

  if (!parent || !code) {
    alert("ادخل جميع البيانات");
    return;
  }

  // تحميل البيانات إذا لم تكن موجودة
  if (STUDENTS_DATA.length === 0) await fetchStudentsData();

  const student = findStudent(parent, code);

  if (!student) {
    alert("الرقم أو الكود خاطئ");
    updateStudentStatus(parent, code, "خطأ");
    return;
  }

  // تسجيل الدخول ناجح
  updateStudentStatus(parent, code, "تم تسجيل الدخول");

  // عرض البيانات
  document.getElementById('loginForm').style.display = 'none';
  document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
  document.getElementById('accountSection').style.display = 'block';
  populateAccount(student);
  populateGrades(student);
  populateNotifications(student);

  // إظهار البار السفلي
  document.querySelector('.bottom-bar').style.display = 'flex';
});

// تحديث الحالة في العمود "الحالة" عبر API
async function updateStudentStatus(parent, code, status) {
  try {
    await fetch(SHEET_API_URL, {
      method: 'POST',
      body: JSON.stringify({ parent, code, status }),
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error("فشل تحديث الحالة:", err);
  }
}

// باقي دوال عرض الحساب والدرجات والتبليغات كما هي
