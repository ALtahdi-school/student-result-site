// GSAP أنيميشن للبار السفلي عند التبديل بين الصفحات
const buttons = document.querySelectorAll(".bottom-bar button");
buttons.forEach(btn => {
  btn.addEventListener("click", () => {
    const activePage = document.querySelector(".page.active");
    if(activePage) {
      gsap.fromTo(activePage, {opacity:0, y:50}, {opacity:1, y:0, duration:0.5});
    }
  });
});

// وظيفة تغيير الصفحات
function showPage(pageId){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
}
