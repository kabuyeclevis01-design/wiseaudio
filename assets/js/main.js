/* Wise Audio Speaker — interactions & motion graphics */
(function () {
  "use strict";

  var doc = document;
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero slider ---------- */
  var hero = doc.getElementById("hero");
  var slides = hero ? hero.querySelectorAll(".hero-slide") : [];
  var dots = hero ? hero.querySelectorAll(".hero-dot") : [];
  var current = 0;
  var heroTimer = null;
  var SLIDE_MS = 6500;

  function setHeroHeight() {
    if (!hero) return;
    hero.style.height = window.innerHeight + "px";
  }
  setHeroHeight();
  window.addEventListener("resize", setHeroHeight);

  function restartHeroAnimation() {
    if (!hero || prefersReduced) return;
    hero.classList.remove("in");
    // Force reflow so the stagger animation replays on every slide change
    void hero.offsetWidth;
    hero.classList.add("in");
  }

  function goToSlide(i) {
    if (!slides.length) return;
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
    restartHeroAnimation();
  }

  function startHeroAutoplay() {
    if (prefersReduced) return;
    stopHeroAutoplay();
    heroTimer = setInterval(function () { goToSlide(current + 1); }, SLIDE_MS);
  }
  function stopHeroAutoplay() {
    if (heroTimer) clearInterval(heroTimer);
    heroTimer = null;
  }

  if (hero && slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goToSlide(parseInt(dot.getAttribute("data-slide"), 10));
        startHeroAutoplay();
      });
    });
    hero.addEventListener("mouseenter", stopHeroAutoplay);
    hero.addEventListener("mouseleave", startHeroAutoplay);

    // Swipe support
    var touchX = null;
    hero.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (touchX === null) return;
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) goToSlide(dx < 0 ? current + 1 : current - 1);
      touchX = null;
      startHeroAutoplay();
    }, { passive: true });

    restartHeroAnimation();
    startHeroAutoplay();
  }

  /* ---------- Nav scroll state ---------- */
  var nav = doc.getElementById("nav");
  function onScroll() {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 30);
    updateActiveLink();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Active nav link on scroll ---------- */
  var sections = ["features", "about", "products", "news", "contact"];
  var navLinks = nav ? nav.querySelectorAll(".nav-link") : [];

  function updateActiveLink() {
    if (!navLinks.length) return;
    var pos = window.scrollY + window.innerHeight * 0.35;
    var activeId = "";
    sections.forEach(function (id) {
      var el = doc.getElementById(id);
      if (el && el.offsetTop <= pos) activeId = id;
    });
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      // Page links keep their markup-defined active state
      if (href.charAt(0) !== "#") return;
      link.classList.toggle("is-active", href === "#" + activeId || (activeId === "" && href === "#top"));
    });
  }

  /* ---------- Dropdown (touch / click support) ---------- */
  var dropItems = doc.querySelectorAll(".nav-item.has-drop");
  dropItems.forEach(function (item) {
    var btn = item.querySelector(".nav-drop-btn");
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = item.classList.contains("is-open");
      dropItems.forEach(function (i2) { i2.classList.remove("is-open"); });
      item.classList.toggle("is-open", !open);
      btn.setAttribute("aria-expanded", String(!open));
    });
  });
  doc.addEventListener("click", function () {
    dropItems.forEach(function (i) { i.classList.remove("is-open"); });
  });

  /* ---------- Mobile menu ---------- */
  var burger = doc.getElementById("burger");
  var mm = doc.getElementById("mobileMenu");
  var mmClose = doc.getElementById("mmClose");

  function openMenu() {
    mm.classList.add("is-open");
    mm.setAttribute("aria-hidden", "false");
    burger.setAttribute("aria-expanded", "true");
    doc.body.style.overflow = "hidden";
  }
  function closeMenu() {
    mm.classList.remove("is-open");
    mm.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    doc.body.style.overflow = "";
  }
  if (burger && mm) {
    burger.addEventListener("click", openMenu);
    mmClose.addEventListener("click", closeMenu);
    mm.querySelectorAll(".mm-link, .mm-sublink").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });
  }

  /* Mobile accordion */
  var accBtn = doc.querySelector(".mm-acc-btn");
  if (accBtn) {
    accBtn.addEventListener("click", function () {
      var item = accBtn.closest(".mm-item");
      var open = item.classList.toggle("is-open");
      accBtn.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Animated counters ---------- */
  var counters = doc.querySelectorAll(".counter");
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-target")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced) { el.textContent = target + suffix; return; }
    var dur = 1800;
    var start = null;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Testimonials carousel ---------- */
  var tTrack = doc.getElementById("tTrack");
  var tDots = doc.getElementById("tDots");
  var tSlides = tTrack ? tTrack.querySelectorAll(".t-slide") : [];
  var tIndex = 0;
  var tTimer = null;

  function tGo(i) {
    if (!tSlides.length) return;
    tIndex = (i + tSlides.length) % tSlides.length;
    tTrack.style.transform = "translateX(-" + tIndex * 100 + "%)";
    if (tDots) {
      tDots.querySelectorAll(".t-dot").forEach(function (d, di) {
        d.classList.toggle("is-active", di === tIndex);
      });
    }
  }
  function tStart() {
    if (prefersReduced) return;
    tStop();
    tTimer = setInterval(function () { tGo(tIndex + 1); }, 6000);
  }
  function tStop() { if (tTimer) clearInterval(tTimer); tTimer = null; }

  if (tTrack && tSlides.length) {
    if (tDots) {
      tSlides.forEach(function (_, i) {
        var b = doc.createElement("button");
        b.className = "t-dot" + (i === 0 ? " is-active" : "");
        b.setAttribute("aria-label", "Go to testimonial " + (i + 1));
        b.addEventListener("click", function () { tGo(i); tStart(); });
        tDots.appendChild(b);
      });
    }
    var tPrev = doc.getElementById("tPrev");
    var tNext = doc.getElementById("tNext");
    if (tPrev) tPrev.addEventListener("click", function () { tGo(tIndex - 1); tStart(); });
    if (tNext) tNext.addEventListener("click", function () { tGo(tIndex + 1); tStart(); });
    var tc = doc.getElementById("tCarousel");
    tc.addEventListener("mouseenter", tStop);
    tc.addEventListener("mouseleave", tStart);
    tStart();
  }

  /* ---------- Contact form ---------- */
  var form = doc.getElementById("contactForm");
  if (form) {
    var note = doc.getElementById("formNote");
    var submitBtn = doc.getElementById("cfSubmit");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll("input, textarea").forEach(function (field) {
        var empty = !field.value.trim();
        var badEmail = field.type === "email" && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        field.classList.toggle("is-error", empty || badEmail);
        if (empty || badEmail) valid = false;
      });
      if (!valid) {
        note.textContent = "Please fill in all fields correctly.";
        return;
      }
      submitBtn.classList.add("is-sent");
      submitBtn.textContent = "Message Sent";
      note.textContent = "Thank you. We will get back to you within 24 hours.";
      form.querySelectorAll("input, textarea").forEach(function (f) { f.value = ""; });
      setTimeout(function () {
        submitBtn.classList.remove("is-sent");
        submitBtn.textContent = "Send Message";
        note.textContent = "";
      }, 5000);
    });
  }

  onScroll();
})();
