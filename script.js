/**
 * Commissione Entretien
 * Animations & Interactions
 * Cross-browser & Mobile Optimized
 */

document.addEventListener('DOMContentLoaded', function () {

    // ========================
    // 0. MOBILE VIEWPORT HEIGHT FIX
    // Corrige iOS Safari qui change la hauteur du viewport
    // ========================
    function setVhVariable() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    setVhVariable();
    window.addEventListener('resize', setVhVariable, { passive: true });
    window.addEventListener('orientationchange', function () {
        setTimeout(setVhVariable, 100);
        setTimeout(setVhVariable, 300);
    }, { passive: true });

    // ========================
    // 1. REVEAL PAR INTERSECTIONOBSERVER
    // Pas de dépendance GSAP — fiable sur tous navigateurs.
    // Ajoute .revealed quand l'élément entre dans le viewport.
    // Si IntersectionObserver n'existe pas (très vieux browsers),
    // on rend tout visible immédiatement.
    // ========================
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealEls = document.querySelectorAll('.reveal');

    function showAllReveals() {
        document.body.classList.add('reveal-done');
        for (var i = 0; i < revealEls.length; i++) {
            revealEls[i].classList.add('revealed');
        }
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        // Accessibilité ou navigateur très ancien : tout visible immédiatement
        showAllReveals();
    } else {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0,
            rootMargin: '0px 0px -40px 0px'
        });

        revealEls.forEach(function (el) {
            revealObserver.observe(el);
        });
    }

    // Sécurité : si la page reste ouverte longtemps sans scroll,
    // on force l'affichage de tout après 3 secondes
    setTimeout(showAllReveals, 3000);

    // ========================
    // 2. HERO ENTRANCE ANIMATION (GSAP si disponible)
    // ========================
    var hero = document.querySelector('.hero');

    // Déclenche les transitions CSS du hero (eyebrow, sub, ctas, location)
    requestAnimationFrame(function () {
        setTimeout(function () {
            if (hero) hero.classList.add('hero-loaded');
        }, 80);
    });

    // Hero words : gérés par CSS transitions via .hero-loaded
    // Pas de dépendance GSAP — toujours visible même si CDN échoue

    // GSAP optionnel : uniquement pour effets de scroll décoratifs
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
        gsap.registerPlugin(ScrollTrigger);

        // Scroll hint — disparaît au scroll
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

        // Footer watermark parallax
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

    // ========================
    // 3. NAVIGATION OVERLAY
    // ========================
    var menuToggle = document.getElementById('menuToggle');
    var navOverlay = document.getElementById('navOverlay');
    var navLinks = document.querySelectorAll('[data-nav-link]');
    var menuOpen = false;

    function openMenu() {
        menuOpen = true;
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        navOverlay.classList.add('open');
        navOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

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
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navOverlay.classList.remove('open');
        navOverlay.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            if (menuOpen) { closeMenu(); } else { openMenu(); }
        });
    }

    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var targetId = link.getAttribute('href');
            var targetEl = targetId ? document.querySelector(targetId) : null;
            var wasOpen = menuOpen;
            if (menuOpen) { closeMenu(); }
            setTimeout(function () {
                if (targetEl) { smoothScrollTo(targetEl); }
            }, wasOpen ? 350 : 0);
        });
    });

    document.addEventListener('keydown', function (e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && menuOpen) {
            closeMenu();
        }
    });

    // ========================
    // 4. SMOOTH SCROLL (cross-browser)
    // ========================
    function smoothScrollTo(target) {
        if (!target) return;
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
        var finalY = Math.max(0, targetTop - 68);

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: finalY, behavior: 'smooth' });
        } else {
            var startY = window.pageYOffset;
            var distance = finalY - startY;
            var duration = 600;
            var startTime = null;

            function ease(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            function step(ts) {
                if (!startTime) startTime = ts;
                var p = Math.min((ts - startTime) / duration, 1);
                window.scrollTo(0, startY + distance * ease(p));
                if (p < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }
    }

    // ========================
    // 5. SCROLL-TO BUTTONS (data-scroll-to)
    // ========================
    var scrollToButtons = document.querySelectorAll('[data-scroll-to]');
    scrollToButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var target = document.getElementById(btn.getAttribute('data-scroll-to'));
            if (target) smoothScrollTo(target);
        });
    });

    var logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
        logoBtn.addEventListener('click', function () {
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
        });
    }

    // ========================
    // 6. HEADER SCROLL BEHAVIOR
    // ========================
    var header = document.getElementById('header');
    var floatingCta = document.getElementById('floatingCta');
    var lastScrollY = 0;
    var headerHidden = false;
    var ticking = false;

    function updateHeader() {
        var scroll = window.pageYOffset || document.documentElement.scrollTop;

        // Background header
        if (scroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Cache le hero fixe quand il est hors champ (performance)
        if (hero) {
            hero.style.visibility = scroll > window.innerHeight * 1.5 ? 'hidden' : 'visible';
        }

        // Cache/montre le header selon direction du scroll
        if (scroll > 120) {
            if (scroll > lastScrollY + 5 && !headerHidden) {
                header.classList.add('hide-up');
                headerHidden = true;
            } else if (scroll < lastScrollY - 5 && headerHidden) {
                header.classList.remove('hide-up');
                headerHidden = false;
            }
        } else {
            header.classList.remove('hide-up');
            headerHidden = false;
        }

        // Floating CTA (desktop)
        if (floatingCta) {
            if (scroll > 500) {
                floatingCta.classList.add('visible');
            } else {
                floatingCta.classList.remove('visible');
            }
        }

        lastScrollY = scroll;
        ticking = false;
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

    // ========================
    // 7. REFRESH SCROLLTRIGGER ON RESIZE
    // ========================
    if (typeof ScrollTrigger !== 'undefined') {
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () {
                ScrollTrigger.refresh();
            }, 250);
        }, { passive: true });

        window.addEventListener('orientationchange', function () {
            setTimeout(function () {
                ScrollTrigger.refresh();
            }, 400);
        }, { passive: true });
    }

});
