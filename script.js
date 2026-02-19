/**
 * Commissione Entretien — script.js
 */

document.addEventListener('DOMContentLoaded', function () {

    // ─────────────────────────────────────────────────────────────
    // CONSTANTES & ÉTAT GLOBAL
    // ─────────────────────────────────────────────────────────────

    var HEADER_HEIGHT      = 68;   // hauteur fixe du header (px)
    var SCROLL_THRESHOLD   = 50;   // seuil pour .scrolled
    var SCROLL_HIDE_MIN    = 120;  // seuil minimum avant hide/show header
    var SCROLL_DELTA       = 5;    // delta de mouvement pour déclencher hide/show
    var FLOATING_CTA_MIN   = 500;  // seuil d'apparition du CTA flottant
    var SNAP_FAILSAFE      = 3000; // libération forcée de snapAnimating (ms)
    var MENU_CLOSE_DELAY   = 350;  // délai après fermeture menu avant scroll (ms)

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Éléments DOM
    var header      = document.getElementById('header');
    var menuToggle  = document.getElementById('menuToggle');
    var navOverlay  = document.getElementById('navOverlay');
    var navClose    = document.getElementById('navClose');
    var logoBtn     = document.getElementById('logoBtn');
    var floatingCta = document.getElementById('floatingCta');
    var hero        = document.querySelector('.hero');
    var heroWrap    = document.querySelector('.hero-wrapper');

    // État du header
    var lastScrollY  = 0;
    var headerHidden = false;
    var ticking      = false;
    var snapAnimating = false;

    // État du menu
    var menuOpen = false;

    // Watcher de fin de scroll (unique — évite les doublons)
    var navScrollHandler  = null;
    var navScrollEndTimer = null;
    var navScrollFailsafe = null;


    // ─────────────────────────────────────────────────────────────
    // 1. VIEWPORT HEIGHT — iOS Safari
    // ─────────────────────────────────────────────────────────────

    function setVh() {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }

    setVh();
    window.addEventListener('resize', setVh, { passive: true });
    window.addEventListener('orientationchange', function () {
        // Double timeout : couvre les navigateurs qui retardent le redimensionnement
        setTimeout(setVh, 100);
        setTimeout(setVh, 300);
    }, { passive: true });


    // ─────────────────────────────────────────────────────────────
    // 2. REVEAL — IntersectionObserver
    // ─────────────────────────────────────────────────────────────

    var revealEls = document.querySelectorAll('.reveal');

    function showAllReveals() {
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
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(function (el) { revealObserver.observe(el); });

        // Failsafe : force l'affichage si le scroll ne se produit pas
        setTimeout(showAllReveals, SNAP_FAILSAFE);
    }


    // ─────────────────────────────────────────────────────────────
    // 3. HERO ENTRANCE
    // ─────────────────────────────────────────────────────────────

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            if (hero) hero.classList.add('hero-loaded');
        });
    });

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollTrigger);

        var scrollHint = document.querySelector('.hero-scroll-hint');
        if (scrollHint) {
            gsap.to(scrollHint, {
                opacity: 0,
                scrollTrigger: {
                    trigger: '.hero-wrapper',
                    start: 'top top',
                    end: '25% top',
                    scrub: true,
                },
            });
        }

        var footerWatermark = document.querySelector('.footer-watermark');
        if (footerWatermark) {
            gsap.fromTo(footerWatermark,
                { yPercent: 30 },
                {
                    yPercent: -10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: '.footer',
                        start: 'top bottom',
                        end: 'bottom bottom',
                        scrub: true,
                    },
                }
            );
        }
    }


    // ─────────────────────────────────────────────────────────────
    // 4. SMOOTH SCROLL
    // ─────────────────────────────────────────────────────────────

    function smoothScrollTo(target) {
        if (!target) return;
        var finalY = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - HEADER_HEIGHT);

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: finalY, behavior: 'smooth' });
        } else {
            var startY    = window.pageYOffset;
            var distance  = finalY - startY;
            var duration  = 600;
            var startTime = null;

            function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

            function step(ts) {
                if (!startTime) startTime = ts;
                var p = Math.min((ts - startTime) / duration, 1);
                window.scrollTo(0, startY + distance * ease(p));
                if (p < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }
    }


    // ─────────────────────────────────────────────────────────────
    // 5. HEADER LOCK — navigation programmatique
    // ─────────────────────────────────────────────────────────────

    function lockHeader() {
        snapAnimating = true;
        if (header) header.classList.remove('hide-up');
        headerHidden = false;
    }

    function cleanupNavWatcher() {
        if (navScrollHandler) {
            window.removeEventListener('scroll', navScrollHandler);
            navScrollHandler = null;
        }
        clearTimeout(navScrollEndTimer);
        clearTimeout(navScrollFailsafe);
    }

    function releaseNavSnap() {
        cleanupNavWatcher();
        snapAnimating = false;
        lastScrollY   = window.pageYOffset;
    }

    function watchNavScrollEnd() {
        // Nettoie le watcher précédent sans toucher snapAnimating
        cleanupNavWatcher();

        navScrollHandler = function () {
            clearTimeout(navScrollEndTimer);
            navScrollEndTimer = setTimeout(releaseNavSnap, SNAP_RELEASE_DELAY);
        };
        window.addEventListener('scroll', navScrollHandler, { passive: true });

        // Failsafe : libère même si aucun événement scroll ne se déclenche
        navScrollFailsafe = setTimeout(releaseNavSnap, SNAP_FAILSAFE);
    }

    function navigateTo(target) {
        if (!target) return;
        lockHeader();
        smoothScrollTo(target);
        watchNavScrollEnd();
    }


    // ─────────────────────────────────────────────────────────────
    // 6. NAVIGATION OVERLAY
    // ─────────────────────────────────────────────────────────────

    function openMenu() {
        menuOpen = true;
        if (menuToggle) {
            menuToggle.classList.add('active');
            menuToggle.setAttribute('aria-expanded', 'true');
        }
        if (navOverlay) {
            navOverlay.classList.add('open');
            navOverlay.setAttribute('aria-hidden', 'false');
        }
        document.body.classList.add('menu-open');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width    = '100%';

        if (typeof gsap !== 'undefined' && !prefersReducedMotion) {
            gsap.fromTo('.nav-link',
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.05 }
            );
            gsap.fromTo('.nav-contact-info',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.38 }
            );
        }
    }

    function closeMenu() {
        menuOpen = false;
        if (menuToggle) {
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.focus(); // Accessibilité : renvoie le focus avant aria-hidden
        }
        if (navOverlay) {
            navOverlay.classList.remove('open');
            navOverlay.setAttribute('aria-hidden', 'true');
        }
        document.body.classList.remove('menu-open');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width    = '';
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

            lockHeader(); // Verrouille immédiatement, avant closeMenu
            if (menuOpen) { closeMenu(); }

            setTimeout(function () { navigateTo(target); }, wasOpen ? MENU_CLOSE_DELAY : 0);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuOpen) { closeMenu(); }
    });


    // ─────────────────────────────────────────────────────────────
    // 7. BOUTONS SCROLL-TO + LOGO
    // ─────────────────────────────────────────────────────────────

    document.querySelectorAll('[data-scroll-to]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            navigateTo(document.getElementById(btn.getAttribute('data-scroll-to')));
        });
    });

    if (logoBtn) {
        logoBtn.addEventListener('click', function () {
            lockHeader();
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
            watchNavScrollEnd();
        });
    }


    // ─────────────────────────────────────────────────────────────
    // 8. HEADER SCROLL BEHAVIOR
    // ─────────────────────────────────────────────────────────────

    function updateHeader() {
        if (!header) { ticking = false; return; }

        var scroll = window.pageYOffset || document.documentElement.scrollTop;

        header.classList.toggle('scrolled', scroll > SCROLL_THRESHOLD);

        if (hero) {
            hero.style.visibility = scroll > window.innerHeight * 1.5 ? 'hidden' : 'visible';
        }

        if (!snapAnimating && scroll > SCROLL_HIDE_MIN) {
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

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('touchmove', onScroll, { passive: true });
    updateHeader();


    // ─────────────────────────────────────────────────────────────
    // 9. HERO SNAP SCROLL — désactivé, scroll libre
    // ─────────────────────────────────────────────────────────────


    // ─────────────────────────────────────────────────────────────
    // 10. SCROLLTRIGGER REFRESH
    // ─────────────────────────────────────────────────────────────

    if (typeof ScrollTrigger !== 'undefined') {
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 250);
        }, { passive: true });

        window.addEventListener('orientationchange', function () {
            setTimeout(function () { ScrollTrigger.refresh(); }, 400);
        }, { passive: true });
    }

});
