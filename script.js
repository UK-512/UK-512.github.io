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

  /* ---------- GitHub repos ---------- */
  var repoGrid = document.getElementById("repoGrid");
  if (!repoGrid || !window.fetch) return;

  var API_URL = "https://api.github.com/users/UK-512/repos?per_page=100&sort=updated";

  fetch(API_URL)
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API " + res.status);
      return res.json();
    })
    .then(function (repos) {
      var own = repos
        .filter(function (r) { return !r.fork && r.name.toLowerCase() !== "uk-512.github.io"; })
        .sort(function (a, b) {
          if (b.stargazers_count !== a.stargazers_count) {
            return b.stargazers_count - a.stargazers_count;
          }
          return new Date(b.pushed_at) - new Date(a.pushed_at);
        })
        .slice(0, 6);

      if (own.length === 0) return; // keep static fallback

      repoGrid.innerHTML = "";
      own.forEach(function (repo) {
        var card = document.createElement("article");
        card.className = "card repo-card";

        var h3 = document.createElement("h3");
        var link = document.createElement("a");
        link.href = repo.html_url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = repo.name;
        h3.appendChild(link);

        var desc = document.createElement("p");
        desc.textContent = repo.description || "No description yet.";

        var meta = document.createElement("div");
        meta.className = "repo-meta";
        if (repo.language) {
          var lang = document.createElement("span");
          var dot = document.createElement("span");
          dot.className = "lang-dot";
          lang.appendChild(dot);
          lang.appendChild(document.createTextNode(repo.language));
          meta.appendChild(lang);
        }
        var stars = document.createElement("span");
        stars.textContent = "★ " + repo.stargazers_count;
        meta.appendChild(stars);

        card.appendChild(h3);
        card.appendChild(desc);
        card.appendChild(meta);
        repoGrid.appendChild(card);
      });
    })
    .catch(function () {
      /* API unreachable or rate-limited: static fallback cards remain */
    });
})();
