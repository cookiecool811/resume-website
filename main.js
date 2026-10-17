/* ============================================
   Adrian 简历网站 — 交互脚本
   纯原生 JS，无依赖
   ============================================ */

(function () {
    "use strict";

    /* ==========================================
       ⑦ 深色模式：系统跟随 + 手动切换
       ========================================== */
    var THEME_KEY = "adrian-theme";
    var themeToggle = document.getElementById("themeToggle");

    function initTheme() {
        var saved = localStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") {
            document.documentElement.setAttribute("data-theme", saved);
        }
    }

    function getCurrentTheme() {
        var manual = document.documentElement.getAttribute("data-theme");
        if (manual) return manual;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function toggleTheme() {
        var current = getCurrentTheme();
        var next = current === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem(THEME_KEY, next);
    }

    initTheme();
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    // 系统主题变化时，仅在用户未手动设置时跟随
    if (window.matchMedia) {
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
            if (!localStorage.getItem(THEME_KEY)) {
                document.documentElement.removeAttribute("data-theme");
            }
        });
    }

    /* ==========================================
       ② 邮箱复制到剪贴板 + Toast
       ========================================== */
    var toastEl = document.getElementById("toast");
    var toastText = document.getElementById("toastText");
    var toastTimer = null;

    function showToast(message) {
        if (!toastEl) return;
        toastText.textContent = message || "已复制";
        toastEl.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastEl.classList.remove("show");
        }, 1800);
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        // 降级：HTTP / 微信 / 旧浏览器
        return new Promise(function (resolve, reject) {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            ta.style.top = "0";
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            try {
                var ok = document.execCommand("copy");
                document.body.removeChild(ta);
                ok ? resolve() : reject();
            } catch (e) {
                document.body.removeChild(ta);
                reject(e);
            }
        });
    }

    var copyEmailBtn = document.getElementById("copyEmail");
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener("click", function (e) {
            e.preventDefault();
            var email = this.getAttribute("data-email") || "";
            copyText(email).then(function () {
                showToast("邮箱已复制：" + email);
            }).catch(function () {
                window.location.href = "mailto:" + email;
            });
        });
    }

    /* ==========================================
       ① 导航栏滚动增强 + ③ 返回顶部
       ========================================== */
    var navBar = document.getElementById("navBar");
    var backToTop = document.getElementById("backToTop");

    function onScroll() {
        var y = window.pageYOffset;

        if (y > 10) {
            navBar.classList.add("scrolled");
        } else {
            navBar.classList.remove("scrolled");
        }

        if (y > 400) {
            backToTop.classList.add("visible");
        } else {
            backToTop.classList.remove("visible");
        }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (backToTop) {
        backToTop.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    /* ==========================================
       ⑤ 滚动淡入动画
       ========================================== */
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var fadeEls = document.querySelectorAll(".card, .skill-category, .section-title");
    fadeEls.forEach(function (el) {
        el.classList.add("fade-in");
    });

    if (!reduceMotion && "IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
        );
        fadeEls.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        fadeEls.forEach(function (el) {
            el.classList.add("visible");
        });
    }

    /* ==========================================
       导航栏滚动高亮
       ========================================== */
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".nav-link");

    function highlightNav() {
        var scrollY = window.pageYOffset + 100;
        var currentId = "";
        sections.forEach(function (section) {
            if (scrollY >= section.offsetTop) {
                currentId = section.getAttribute("id");
            }
        });
        navLinks.forEach(function (link) {
            link.classList.remove("active");
            if (link.getAttribute("href") === "#" + currentId) {
                link.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", highlightNav, { passive: true });
    highlightNav();

    /* ==========================================
       平滑滚动锚点
       ========================================== */
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener("click", function (e) {
            var targetId = this.getAttribute("href");
            if (targetId === "#" || targetId.length <= 1) return;
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offset = 80;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
            }
        });
    });

    /* ==========================================
       Lightbox（证书图片放大）
       ========================================== */
    window.openLightbox = function (src, alt) {
        var lightbox = document.getElementById("lightbox");
        var img = document.getElementById("lightboxImg");
        var caption = document.getElementById("lightboxCaption");
        img.src = src;
        img.alt = alt || "";
        caption.textContent = alt || "";
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
    };

    window.closeLightbox = function () {
        var lightbox = document.getElementById("lightbox");
        lightbox.classList.remove("open");
        document.body.style.overflow = "";
    };

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") window.closeLightbox();
    });
})();
