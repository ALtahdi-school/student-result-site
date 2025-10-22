// ==================== إعدادات ====================
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycby4oH2SrV2-8PqYZFcoJnZM9_AZ0X-l3Ol_urEsty-PmJ9RLrCKQdYaXjd34hTYah-cOA/exec";
let currentStudent = null;
let currentPage = "account"; // الصفحة الحالية

// ==================== تسجيل الدخول ====================
async function login() {
    const parentNumber = document.getElementById("parentNumber").value.trim().replace(/^0/, "");
    const studentCode = document.getElementById("studentCode").value.trim().replace(/^0/, "");

    if (!parentNumber || !studentCode) {
        alert("الرجاء إدخال رقم ولي الأمر وكود الطالب");
        return;
    }

    try {
        const res = await fetch(SHEET_API_URL);
        const data = await res.json();
        const student = data.find(s => s["كود الطالب"] === studentCode && s["رقم ولي الامر"] === parentNumber);

        if (!student) {
            alert("❌ لم يتم العثور على الطالب");
            return;
        }

        currentStudent = student;
        showMainInterface();
    } catch (err) {
        console.error(err);
        alert("حدث خطأ أثناء جلب البيانات");
    }
}

// ==================== تسجيل الخروج ====================
function logout() {
    currentStudent = null;
    showLoginPage();
}

// ==================== عرض صفحة تسجيل الدخول ====================
function showLoginPage() {
    document.getElementById("loginPage").style.display = "block";
    document.getElementById("mainInterface").style.display = "none";
}

// ==================== عرض واجهة المستخدم الرئيسية ====================
function showMainInterface() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainInterface").style.display = "block";
    switchPage("account"); // الصفحة الافتراضية
}

// ==================== التنقل بين الصفحات ====================
function switchPage(page) {
    currentPage = page;
    const pages = ["account", "chat", "notifications", "grades"];
    pages.forEach(p => {
        document.getElementById(p).style.display = (p === page ? "block" : "none");
    });

    if(page === "account") loadAccount();
    if(page === "chat") loadChat();
    if(page === "notifications") loadNotifications();
    if(page === "grades") loadGrades();
}

// ==================== الحساب ====================
function loadAccount() {
    if (!currentStudent) return;

    const container = document.getElementById("accountContent");
    container.innerHTML = "";

    // قسم المعلومات العامة
    const generalHTML = `
        <h3>المعلومات العامة</h3>
        <table>
            <tr><th>id</th><td>${currentStudent["id"]}</td></tr>
            <tr><th>اسم الطالب</th><td>${currentStudent["اسم الطالب"]}</td></tr>
            <tr><th>الصف</th><td>${currentStudent["الصف"]}</td></tr>
            <tr><th>القاعة</th><td>${currentStudent["القاعة"]}</td></tr>
            <tr><th>الجنس</th><td>${currentStudent["الجنس"]}</td></tr>
            <tr><th>رقم ولي الامر</th><td>${currentStudent["رقم ولي الامر"]}</td></tr>
            <tr><th>رقم الخط</th><td>${currentStudent["رقم الخط"]}</td></tr>
            <tr><th>الملاحظات</th><td>${currentStudent["الملاحظات"]}</td></tr>
            <tr><th>رقم الطالب</th><td>${currentStudent["رقم الطالب"]}</td></tr>
            <tr><th>الكتب</th><td>${currentStudent["الكتب"]}</td></tr>
            <tr><th>العنوان</th><td>${currentStudent["العنوان"]}</td></tr>
            <tr><th>اسم الام</th><td>${currentStudent["اسم الام"]}</td></tr>
            <tr><th>المدرسة القادم منها</th><td>${currentStudent["المدرسة القادم منها"]}</td></tr>
            <tr><th>المعدل في الصف السابق</th><td>${currentStudent["المعدل في الصف السابق"]}</td></tr>
        </table>
    `;

    // قسم المعلومات المالية
    const financeHTML = `
        <h3>المعلومات المالية</h3>
        <table>
            ${[...Array(8)].map(i => {
                const n = i+1;
                return `<tr><th>القسط ${n}</th><td>${currentStudent[`القسط ${n}`] || ""}</td>
                        <th>تاريخ ${n}</th><td>${currentStudent[`تاريخ ${n}`] || ""}</td></tr>`;
            }).join('')}
            <tr><th>الباقي الكلي</th><td>${currentStudent["الباقي الكلي"]}</td></tr>
            <tr><th>المبلغ الكلي</th><td>${currentStudent["المبلغ الكلي"]}</td></tr>
            <tr><th>الواصل الكلي</th><td>${currentStudent["الواصل الكلي"]}</td></tr>
            <tr><th>الكفالة</th><td>${currentStudent["الكفالة"]}</td></tr>
            <tr><th>مبلغ الكفالة</th><td>${currentStudent["مبلغ الكفالة"]}</td></tr>
        </table>
    `;

    container.innerHTML = generalHTML + financeHTML + `<button onclick="logout()">تسجيل الخروج</button>`;
}

// ==================== الدردشة ====================
function loadChat() {
    if(!currentStudent) return;

    const container = document.getElementById("chatContent");
    container.innerHTML = `
        <div id="chatMessages"></div>
        <input type="text" id="chatInput" placeholder="اكتب رسالتك هنا">
        <button onclick="sendChat()">ارسال</button>
    `;

    displayChatMessages();
}

// عرض الرسائل الحالية
function displayChatMessages() {
    const chatDiv = document.getElementById("chatMessages");
    chatDiv.innerHTML = "";
    for(let i=1; i<=5; i++){
        const msg = currentStudent[`دردشة ${i}`] || "";
        if(msg) chatDiv.innerHTML += `<p>${msg}</p>`;
    }
}

// إرسال رسالة جديدة وتدوير الرسائل
async function sendChat() {
    const input = document.getElementById("chatInput");
    const msg = input.value.trim();
    if(!msg) return;

    // تدوير الرسائل
    for(let i=5; i>1; i--){
        currentStudent[`دردشة ${i}`] = currentStudent[`دردشة ${i-1}`];
    }
    currentStudent[`دردشة 1`] = msg;

    // تحديث Google Sheet
    try{
        await fetch(SHEET_API_URL, {
            method:"POST",
            body: JSON.stringify({action:"updateChat", id:currentStudent["id"], chatNumber:1, message:msg})
        });
        displayChatMessages();
        input.value = "";
    } catch(err){ console.error(err); }
}

// ==================== التبليغات ====================
function loadNotifications() {
    const container = document.getElementById("notificationsContent");
    container.innerHTML = `
        <div id="notifMessages"></div>
    `;
    displayNotifications();

    // إذا كان الصف "الادارة" يمكن إضافة تبليغ
    if(currentStudent["الصف"] === "الادارة"){
        container.innerHTML += `
            <input type="text" id="notifInput" placeholder="اكتب التبليغ هنا">
            <button onclick="sendNotification()">إرسال تبليغ</button>
        `;
    }
}

function displayNotifications() {
    const container = document.getElementById("notifMessages");
    container.innerHTML = currentStudent["تبليغات"] ? currentStudent["تبليغات"].split("\n").map(t=>`<p>${t}</p>`).join("") : "<p>لا توجد تبليغات</p>";
}

async function sendNotification() {
    const msg = document.getElementById("notifInput").value.trim();
    if(!msg) return;

    try{
        await fetch(SHEET_API_URL, {
            method:"POST",
            body: JSON.stringify({action:"addNotification", id:currentStudent["id"], notification: msg})
        });
        if(currentStudent["تبليغات"]){
            currentStudent["تبليغات"] += "\n" + msg;
        } else currentStudent["تبليغات"] = msg;

        displayNotifications();
        document.getElementById("notifInput").value = "";
    } catch(err){ console.error(err); }
}

// ==================== الدرجات ====================
async function loadGrades() {
    if(!currentStudent) return;
    try{
        const res = await fetch(SHEET_API_URL);
        const data = await res.json();
        const student = data.find(s => s["id"] === currentStudent["id"]);
        if(!student) return;

        const container = document.getElementById("gradesContainer");
        container.innerHTML = "";

        const subjects = [
            "اسلامية", "العربي", "الانكليزي", "الرياضيات", "الكيمياء", "الفيزياء",
            "الاحياء", "الاجتماعيات", "الحاسوب", "رياضة", "الفنية", "السلوك"
        ];

        subjects.forEach(sub => {
            const card = document.createElement("div");
            card.classList.add("gradeCard");
            card.innerHTML = `
                <h3>${sub}</h3>
                <table>
                    <tr>
                        <th>شهر 1</th><th>شهر 2</th><th>فصل 1</th><th>نصف سنة</th>
                        <th>شهر 3</th><th>شهر 4</th><th>فصل 2</th><th>الامتحان النهائي</th>
                        <th>السعي</th><th>التقدير</th>
                    </tr>
                    <tr>
                        <td>${student[`${sub} شهر 1`] || ""}</td>
                        <td>${student[`${sub} شهر 2`] || ""}</td>
                        <td>${student[`${sub} فصل 1`] || ""}</td>
                        <td>${student[`${sub} نصف سنة`] || ""}</td>
                        <td>${student[`${sub} شهر 3`] || ""}</td>
                        <td>${student[`${sub} شهر 4`] || ""}</td>
                        <td>${student[`${sub} فصل 2`] || ""}</td>
                        <td>${student[`${sub} الامتحان النهائي`] || ""}</td>
                        <td>${student[`${sub} السعي`] || ""}</td>
                        <td>${student[`${sub} التقدير`] || ""}</td>
                    </tr>
                </table>
            `;
            container.appendChild(card);
        });
    } catch(err){
        console.error(err);
    }
}

// ==================== تنزيل الدرجات ====================
function downloadGrades(){
    if(!currentStudent) return alert("يجب تسجيل الدخول");
    const subjects = [
        "اسلامية", "العربي", "الانكليزي", "الرياضيات", "الكيمياء", "الفيزياء",
        "الاحياء", "الاجتماعيات", "الحاسوب", "رياضة", "الفنية", "السلوك"
    ];

    let csv = "المادة,شهر 1,شهر 2,فصل 1,نصف سنة,شهر 3,شهر 4,فصل 2,الامتحان النهائي,السعي,التقدير\n";

    subjects.forEach(sub=>{
        csv += `${sub},${currentStudent[`${sub} شهر 1`] || ""},${currentStudent[`${sub} شهر 2`] || ""},${currentStudent[`${sub} فصل 1`] || ""},${currentStudent[`${sub} نصف سنة`] || ""},${currentStudent[`${sub} شهر 3`] || ""},${currentStudent[`${sub} شهر 4`] || ""},${currentStudent[`${sub} فصل 2`] || ""},${currentStudent[`${sub} الامتحان النهائي`] || ""},${currentStudent[`${sub} السعي`] || ""},${currentStudent[`${sub} التقدير`] || ""}\n`;
    });

    const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "grades.csv";
    link.click();
}
