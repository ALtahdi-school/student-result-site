<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script>
document.addEventListener("DOMContentLoaded", () => {
  gsap.to(".container", {duration: 1, y: 0, opacity: 1, ease: "power3.out"});
  gsap.to(".input-field", {duration: 1, y: 0, opacity: 1, ease: "power2.out", stagger: 0.15, delay: 0.4});
  gsap.to("button", {duration: 1, y: 0, opacity: 1, ease: "power2.out", delay: 0.9});
  gsap.to(".forgot-link, .message, .back-btn", {duration: 1, y: 0, opacity: 1, ease: "power2.out", delay: 1.2});
});
</script>
