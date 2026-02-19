/**
 * Commissione Entretien — script.js
 */

document.addEventListener('DOMContentLoaded', function () {

    var HEADER_HEIGHT    = 68;
    var SCROLL_THRESHOLD = 50;
    var SCROLL_HIDE_MIN  = 120;
    var SCROLL_DELTA     = 5;
    var FLOATING_CTA_MIN = 500;
    var MENU_CLOSE_DELAY = 400;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var header      = document.getElementById('header');
    var menuToggle  = document.getElementById('menuToggle');
    var navOverlay  = document.getElementById('navOverlay');
    var navClose    = document.getElementById('navClose');
    var logoBtn     = document.getElementById('logoBtn');
    var floatingCta = document.getElementById('floatingCta');
    var hero        = document.querySelector('.hero');

    // Pré-cache les références GSAP pour éviter querySelectorAll à chaque ouverture
    var navLinks       = document.querySelectorAll('#navOverlay .nav-link');
    var navContactInfo = document.querySelector('#navOverlay .nav-contact-info');

    var lastScrollY      = 0;
    var headerHidden     = false;
    var ticking          = false;
    var menuOpen         = false;
    var scrollStopTimer  = null;
    var savedScrollY     = 0;


    // ─────────────────────────────────────────────────────────────
    // 1. VIEWPORT HEIGHT — iOS Safari
    // ─────────────────────────────────────────────────────────────

    function setVh() {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }

    setVh();
    window.addEventListener('resize', setVh, { passive: true });

    // Annule les timers précédents avant d'en créer de nouveaux
    var vhTimer1 = null, vhTimer2 = null;
    window.addEventListener('orientationchange', function () {
        clearTimeout(vhTimer1);
        clearTimeout(vhTimer2);
        vhTimer1 = setTimeout(setVh, 100);
        vhTimer2 = setTimeout(setVh, 300);
    }, { passive: true });


    // ─────────────────────────────────────────────────────────────
    // 2. REVEAL — IntersectionObserver
    // ─────────────────────────────────────────────────────────────

    var revealEls        = document.querySelectorAll('.reveal');
    var revealCount      = 0;
    var revealFallback   = null;

    function showAllReveals() {
        clearTimeout(revealFallback);
        document.body.classList.add('reveal-done');
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        showAllReveals();
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                    revealCount++;
                    if (revealCount >= revealEls.length) {
                        clearTimeout(revealFallback);
                        document.body.classList.add('reveal-done');
                    }
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });
        revealFallback = setTimeout(showAllReveals, 3000);
    }


    // ─────────────────────────────────────────────────────────────
    // 3. HERO ENTRANCE + will-change libéré après animation
    // ─────────────────────────────────────────────────────────────

    var heroWords = document.querySelectorAll('.hero-word');

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            if (hero) hero.classList.add('hero-loaded');
            // Libère les couches GPU des hero-words après la fin de la dernière transition
            setTimeout(function () {
                heroWords.forEach(function (w) { w.style.willChange = 'auto'; });
            }, 1200);
        });
    });


    // ─────────────────────────────────────────────────────────────
    // 4. SMOOTH SCROLL
    // ─────────────────────────────────────────────────────────────

    function smoothScrollTo(target) {
        if (!target) return;
        var finalY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT);
        window.scrollTo({ top: finalY, behavior: 'smooth' });
    }


    // ─────────────────────────────────────────────────────────────
    // 5. NAVIGATION OVERLAY
    // ─────────────────────────────────────────────────────────────

    function openMenu() {
        menuOpen     = true;
        savedScrollY = window.scrollY;

        if (menuToggle) {
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
        }
        if (navOverlay) {
            navOverlay.classList.add('open');
            navOverlay.setAttribute('aria-hidden', 'false');
        }
        document.body.classList.add('menu-open');

        // Toutes les mutations body dans un seul rAF pour éviter les reflows en cascade
        requestAnimationFrame(function () {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top      = '-' + savedScrollY + 'px';
            document.body.style.width    = '100%';

            // GSAP lancé dans le frame suivant, layout déjà validé
            requestAnimationFrame(function () {
                if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
                    gsap.killTweensOf(navLinks);
                    gsap.killTweensOf(navContactInfo);
                    gsap.fromTo(navLinks,
                        { y: 60, opacity: 0 },
                        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.05 }
                    );
                    if (navContactInfo) {
                        gsap.fromTo(navContactInfo,
                            { y: 20, opacity: 0 },
                            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.38 }
                        );
                    }
                }
            });
        });
    }

    function closeMenu() {
        menuOpen = false;

        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
        if (navOverlay) {
            navOverlay.classList.remove('open');
            navOverlay.setAttribute('aria-hidden', 'true');
        }

        // Attend la fin de la transition CSS du nav-overlay (0.4s) avant de libérer le body
        // Evite le flash de la page qui apparaît pendant que le menu est encore visible
        setTimeout(function () {
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top      = '';
            document.body.style.width    = '';
            window.scrollTo(0, savedScrollY);
        }, 410);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            if (menuOpen) { closeMenu(); } else { openMenu(); }
        });
    }

    if (navClose) {
        navClose.addEventListener('click', closeMenu);
    }

    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var target  = document.querySelector(link.getAttribute('href'));
            var wasOpen = menuOpen;
            if (menuOpen) { closeMenu(); }
            // Attend que le body soit restauré (closeMenu attend 410ms) + marge
            setTimeout(function () { smoothScrollTo(target); }, wasOpen ? MENU_CLOSE_DELAY + 50 : 0);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuOpen) { closeMenu(); }
    });


    // ─────────────────────────────────────────────────────────────
    // 6. BOUTONS SCROLL-TO + LOGO
    // ─────────────────────────────────────────────────────────────

    document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            smoothScrollTo(document.getElementById(btn.getAttribute('data-scroll-to')));
        });
    });

    if (logoBtn) {
        logoBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    // ─────────────────────────────────────────────────────────────
    // 7. HEADER SCROLL BEHAVIOR
    // ─────────────────────────────────────────────────────────────

    function updateHeader() {
        if (!header) { ticking = false; return; }
        // Ne rien faire si le menu est ouvert (évite les mutations DOM parasites)
        if (menuOpen) { ticking = false; return; }

        var scroll = window.scrollY;

        header.classList.toggle('scrolled', scroll > SCROLL_THRESHOLD);

        if (scroll > SCROLL_HIDE_MIN) {
            if (scroll > lastScrollY + SCROLL_DELTA && !headerHidden) {
                header.classList.add('hide-up');
                headerHidden = true;
            } else if (scroll < lastScrollY - SCROLL_DELTA && headerHidden) {
                header.classList.remove('hide-up');
                headerHidden = false;
            }
        } else {
            header.classList.remove('hide-up');
            headerHidden = false;
        }

        if (floatingCta) {
            floatingCta.classList.toggle('visible', scroll > FLOATING_CTA_MIN);
        }

        lastScrollY = scroll;
        ticking     = false;
    }

    window.addEventListener('scroll', function () {
        // Guard : ignorer les scroll events quand le menu est ouvert
        if (menuOpen) return;

        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(function () {
            if (header && headerHidden && !menuOpen) {
                header.classList.remove('hide-up');
                headerHidden = false;
            }
        }, 300);

        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    updateHeader();

});
