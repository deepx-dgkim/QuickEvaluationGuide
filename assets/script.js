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
    // Re-run the TOC scroll spy: switching language swaps which headings are visible.
    document.dispatchEvent(new Event("scroll"));
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

    function isShown(el) {
      return el.offsetParent !== null;
    }

    // A clicked TOC link stays highlighted until the user scrolls by hand: sections
    // near the end of the page can't scroll up to the top, so position alone
    // would highlight the previous section.
    var clicked = null;
    targets.forEach(function (t) {
      t.link.addEventListener("click", function () { clicked = t; });
    });
    ["wheel", "touchmove", "keydown"].forEach(function (ev) {
      window.addEventListener(ev, function () { clicked = null; }, { passive: true });
    });

    function onScroll() {
      var pos = window.scrollY + 110;
      // Only the TOC links and headings of the current language are rendered;
      // hidden ones report offsetTop 0 and would otherwise win every time.
      var visible = targets.filter(function (t) {
        return isShown(t.link) && isShown(t.el);
      });
      if (!visible.length) return;
      var current = visible[0];
      if (clicked && isShown(clicked.link)) {
        current = clicked;
      } else {
        visible.forEach(function (t) {
          if (t.el.getBoundingClientRect().top + window.scrollY <= pos) current = t;
        });
        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom) current = visible[visible.length - 1];
      }
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

  // Section headings exist once per language: the English one has the base id
  // (e.g. "prereq"), the others "<id>-<lang>" (e.g. "prereq-ko"). Only the current
  // language's heading is rendered, so map any heading id to the visible one.
  function visibleTarget(id) {
    var el = document.getElementById(id);
    if (el && el.getClientRects().length) return el;
    var lang = document.documentElement.getAttribute("data-lang") || "en";
    var base = id.replace(/-(ko|zh|ja|vi)$/, "");
    var alt = document.getElementById(lang === "en" ? base : base + "-" + lang);
    return alt && alt.getClientRects().length ? alt : null;
  }

  function initLangAnchors() {
    // In-page links (TOC, diagrams, cross references)
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var href = a.getAttribute("href") || a.getAttribute("xlink:href") || "";
      if (href.charAt(0) !== "#" || href.length < 2) return;
      var id = href.slice(1);
      var el = document.getElementById(id);
      if (el && el.getClientRects().length) return;
      var alt = visibleTarget(id);
      if (!alt) return;
      e.preventDefault();
      alt.scrollIntoView({ behavior: "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", "#" + alt.id);
    });
  }

  // Links from other pages (e.g. basic.html#prereq) land on the English heading,
  // which is hidden in other languages; scroll to the visible one after load.
  function scrollToHashTarget() {
    var id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    var el = document.getElementById(id);
    if (el && el.getClientRects().length) return;
    var alt = visibleTarget(id);
    if (alt) alt.scrollIntoView({ block: "start" });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLangAnchors();
    initLangToggle();
    initMethodTabs();
    initCopyButtons();
    initTocScrollSpy();
    initNavActive();
    scrollToHashTarget();
  });
  // Run again after load (and after the browser's own fragment handling) so late
  // layout shifts such as images don't leave the heading off-screen.
  window.addEventListener("load", function () { setTimeout(scrollToHashTarget, 0); });
})();
