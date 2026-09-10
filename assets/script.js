// DEEPX NPU Performance Evaluation Guide — shared behavior
(function () {
  "use strict";

  var STORAGE_KEY = "dx-guide-lang";

  function applyLang(lang) {
    document.documentElement.setAttribute("data-lang", lang);
    var btns = document.querySelectorAll(".dx-lang-toggle button");
    btns.forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function initLangToggle() {
    var saved = "en";
    try { saved = localStorage.getItem(STORAGE_KEY) || "en"; } catch (e) {}
    applyLang(saved);

    document.querySelectorAll(".dx-lang-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  var SETUP_KEY = "dx-guide-setup";

  function applyMethod(method) {
    document.documentElement.setAttribute("data-setup", method);
    document.querySelectorAll(".dx-method-tabs button").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-method") === method);
    });
    try { localStorage.setItem(SETUP_KEY, method); } catch (e) {}
  }

  function initMethodTabs() {
    if (!document.querySelector(".dx-method-tabs")) return;
    var saved = "allsuite";
    try { saved = localStorage.getItem(SETUP_KEY) || "allsuite"; } catch (e) {}
    applyMethod(saved);

    document.querySelectorAll(".dx-method-tabs button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyMethod(btn.getAttribute("data-method"));
      });
    });
  }

  function initCopyButtons() {
    document.querySelectorAll(".dx-code-wrap").forEach(function (wrap) {
      var btn = document.createElement("button");
      btn.className = "dx-copy-btn";
      btn.type = "button";
      btn.textContent = "Copy";
      btn.addEventListener("click", function () {
        var code = wrap.querySelector("pre code, pre");
        var text = code ? code.textContent : "";
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text).then(function () {
            btn.textContent = "Copied!";
            setTimeout(function () { btn.textContent = "Copy"; }, 1500);
          });
        }
      });
      wrap.appendChild(btn);
    });
  }

  function initTocScrollSpy() {
    var tocLinks = document.querySelectorAll(".dx-toc a");
    if (!tocLinks.length) return;
    var targets = [];
    tocLinks.forEach(function (a) {
      var id = a.getAttribute("href").replace("#", "");
      var el = document.getElementById(id);
      if (el) targets.push({ link: a, el: el });
    });
    if (!targets.length) return;

    function onScroll() {
      var pos = window.scrollY + 110;
      var current = targets[0];
      targets.forEach(function (t) {
        if (t.el.offsetTop <= pos) current = t;
      });
      tocLinks.forEach(function (a) { a.classList.remove("active"); });
      current.link.classList.add("active");
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  function initNavActive() {
    var path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".dx-nav__links a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path) a.classList.add("active");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLangToggle();
    initMethodTabs();
    initCopyButtons();
    initTocScrollSpy();
    initNavActive();
  });
})();
