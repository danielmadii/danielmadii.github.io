(() => {
  "use strict";
  const root = document.documentElement;
  const store = {
    get() {
      try { return localStorage.getItem("theme"); } catch { return null; }
    },
    set(value) {
      try { localStorage.setItem("theme", value); } catch { /* storage unavailable: theme lasts for this page only */ }
    },
  };
  const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const activeTheme = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");

  /* Theme */
  const themeButton = document.querySelector(".theme-toggle");
  if (themeButton) {
    const label = themeButton.querySelector(".theme-toggle-label");
    const sync = () => {
      const next = activeTheme() === "dark" ? "light" : "dark";
      label.textContent = next === "dark" ? "Dark theme" : "Light theme";
      themeButton.setAttribute("aria-label", `Switch to ${next} theme`);
      themeButton.title = `Switch to ${next} theme`;
    };
    themeButton.hidden = false;
    sync();
    themeButton.addEventListener("click", () => {
      const next = activeTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set(next);
      sync();
    });
    if (darkQuery.addEventListener) darkQuery.addEventListener("change", sync);
  }

  /* Navigation on small screens */
  const masthead = document.querySelector(".masthead");
  const navButton = document.querySelector(".nav-toggle");
  if (masthead && navButton) {
    navButton.hidden = false;
    const setOpen = (open) => {
      masthead.classList.toggle("nav-open", open);
      navButton.setAttribute("aria-expanded", String(open));
      navButton.textContent = open ? "Close" : "Menu";
    };
    navButton.addEventListener("click", () => setOpen(!masthead.classList.contains("nav-open")));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && masthead.classList.contains("nav-open")) {
        setOpen(false);
        navButton.focus();
      }
    });
  }

  /* Search and category filters */
  document.querySelectorAll("[data-filter-root]").forEach((scopeEl) => {
    const controls = scopeEl.querySelector("[data-filter-controls]");
    if (!controls) return;
    const noun = controls.dataset.noun || "items";
    const input = controls.querySelector("[data-filter-search]");
    const buttons = [...controls.querySelectorAll("[data-filter-cat]")];
    const items = [...scopeEl.querySelectorAll("[data-filter-item]")];
    const status = controls.querySelector("[data-filter-status]");
    const empty = scopeEl.querySelector("[data-filter-empty]");
    const reset = scopeEl.querySelector("[data-filter-reset]");
    let category = "";

    const params = new URLSearchParams(window.location.search);
    if (input && params.get("q")) input.value = params.get("q");
    if (buttons.some((b) => b.dataset.filterCat === params.get("category"))) category = params.get("category");

    const apply = (updateUrl) => {
      const query = input ? input.value.trim() : "";
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      let shown = 0;
      items.forEach((item) => {
        const inCategory = !category || (item.dataset.cats || "").split(" ").includes(category);
        const text = item.dataset.text || "";
        const visible = inCategory && terms.every((t) => text.includes(t));
        item.hidden = !visible;
        if (visible) shown += 1;
      });
      buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filterCat === category)));
      status.textContent = terms.length || category ? `Showing ${shown} of ${items.length} ${noun}` : "";
      if (empty) empty.hidden = shown !== 0;
      if (updateUrl) {
        const url = new URL(window.location.href);
        if (query) url.searchParams.set("q", query); else url.searchParams.delete("q");
        if (category) url.searchParams.set("category", category); else url.searchParams.delete("category");
        window.history.replaceState(null, "", url);
      }
    };

    controls.hidden = false;
    if (input) input.addEventListener("input", () => apply(true));
    buttons.forEach((b) =>
      b.addEventListener("click", () => {
        category = b.dataset.filterCat;
        apply(true);
      })
    );
    if (reset)
      reset.addEventListener("click", () => {
        if (input) input.value = "";
        category = "";
        apply(true);
        (input || buttons[0])?.focus();
      });
    apply(false);
  });

  /* Press / to search */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))) return;
    const search = document.querySelector("[data-filter-search]");
    if (search) {
      event.preventDefault();
      search.focus();
    }
  });

  /* Fade sections in as they scroll into view */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Print button on the CV */
  document.querySelectorAll("[data-print]").forEach((button) => {
    button.hidden = false;
    button.addEventListener("click", () => window.print());
  });
})();
