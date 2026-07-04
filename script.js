/* uk-512.github.io — site behavior: theme toggle, mobile nav,
   scroll reveal, and live GitHub repo cards with static fallback. */

(function () {
  "use strict";

  /* ---------- theme toggle ---------- */
  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");

  var savedTheme = null;
  try { savedTheme = localStorage.getItem("theme"); } catch (e) { /* private mode */ }
  if (savedTheme === "light" || savedTheme === "dark") {
    root.setAttribute("data-theme", savedTheme);
  }

  function currentTheme() {
    var explicit = root.getAttribute("data-theme");
    if (explicit) return explicit;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- template switcher (classic / terminal) ---------- */
  var TEMPLATES = ["classic", "terminal"];
  var templateToggle = document.getElementById("templateToggle");

  var savedTemplate = null;
  try { savedTemplate = localStorage.getItem("template"); } catch (e) { /* ignore */ }
  if (TEMPLATES.indexOf(savedTemplate) > 0) {
    root.setAttribute("data-template", savedTemplate);
  }

  if (templateToggle) {
    templateToggle.addEventListener("click", function () {
      var current = root.getAttribute("data-template") || "classic";
      var next = TEMPLATES[(TEMPLATES.indexOf(current) + 1) % TEMPLATES.length];
      if (next === "classic") {
        root.removeAttribute("data-template");
      } else {
        root.setAttribute("data-template", next);
      }
      try { localStorage.setItem("template", next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- mobile nav ---------- */
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    // Only enable the hidden state once JS is confirmed running,
    // and show anything already in the viewport right away.
    root.classList.add("js");
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    function revealInView() {
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        if (!el.classList.contains("visible") && el.getBoundingClientRect().top < viewportH) {
          el.classList.add("visible");
          observer.unobserve(el);
        }
      });
    }

    revealEls.forEach(function (el) { observer.observe(el); });
    // Cover cases the observer can miss: initial paint and #fragment deep links.
    revealInView();
    window.addEventListener("load", revealInView);
    window.addEventListener("hashchange", function () {
      requestAnimationFrame(revealInView);
    });
  }

  /* ---------- footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- GitHub repos ----------
     The card list is a curated selection in the HTML; the API only
     refreshes stars/language on those cards. If it fails, the static
     values remain — nothing is added or removed. */
  var repoCards = document.querySelectorAll("#repoGrid [data-repo]");
  if (!repoCards.length || !window.fetch) return;

  fetch("https://api.github.com/users/UK-512/repos?per_page=100")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API " + res.status);
      return res.json();
    })
    .then(function (repos) {
      var byName = {};
      repos.forEach(function (r) { byName[r.name] = r; });

      repoCards.forEach(function (card) {
        var repo = byName[card.getAttribute("data-repo")];
        var meta = card.querySelector(".repo-meta");
        if (!repo || !meta) return;

        meta.innerHTML = "";
        if (repo.language) {
          var lang = document.createElement("span");
          var dot = document.createElement("span");
          dot.className = "lang-dot";
          lang.appendChild(dot);
          lang.appendChild(document.createTextNode(repo.language));
          meta.appendChild(lang);
        }
        if (repo.stargazers_count > 0) {
          var stars = document.createElement("span");
          stars.textContent = "★ " + repo.stargazers_count;
          meta.appendChild(stars);
        }
      });
    })
    .catch(function () {
      /* API unreachable or rate-limited: static values remain */
    });
})();
