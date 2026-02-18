/**
 * Commissione Entretien
 * Animations & Interactions
 * Cross-browser & Mobile Optimized
 */

document.addEventListener('DOMContentLoaded', function() {

    // ========================
    // 0. MOBILE VIEWPORT HEIGHT FIX
    // Fixes iOS Safari bottom bar that changes viewport height
    // ========================
    function setVhVariable() {
        var vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    setVhVariable();

    window.addEventListener('resize', setVhVariable, { passive: true });
    window.addEventListener('orientationchange', function() {
        setTimeout(setVhVariable, 100);
        setTimeout(setVhVariable, 300);
    }, { passive: true });

    // ========================
    // 1. GSAP SETUP
    // ========================
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('Commissione: GSAP not loaded. Showing content without animations.');
        var hero = document.querySelector('.hero');
        if (hero) hero.classList.add('hero-loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
        // Accessibilité : on montre tout immédiatement
        var heroEl = document.querySelector('.hero');
        if (heroEl) heroEl.classList.add('hero-loaded');
        // Les .reveal n'ont plus d'opacity:0 en CSS, donc rien à forcer
        return;
    }

    // ========================
    // 2. HERO ENTRANCE ANIMATION
    // ========================
    var hero = document.querySelector('.hero');

    // Déclenche les transitions CSS du hero (eyebrow, sub, ctas, location)
    requestAnimationFrame(function() {
        setTimeout(function() {
            if (hero) hero.classList.add('hero-loaded');
        }, 80);
    });

    // Hero words — GSAP word-by-word reveal
    var heroWords = document.querySelectorAll('.hero-word');
    if (heroWords.length > 0) {
        gsap.fromTo(heroWords,
            { y: '110%', opacity: 0 },
            {
                y: '0%',
                opacity: 1,
                duration: 1.1,
                stagger: 0.15,
                ease: 'power4.out',
                delay: 0.15,
                clearProps: 'transform,opacity',
            }
        );
    }

    // Scroll hint fade
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

    // ========================
    // 3. SCROLL REVEAL ANIMATIONS
    // fromTo() : GSAP définit lui-même l'état de départ opacity:0
    // once:true : se joue même si l'élément est déjà dans le viewport
    // ========================
    var revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach(function(el) {
        gsap.fromTo(el,
            { y: 28, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.85,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 95%',
                    once: true,
                },
            }
        );
    });

    // ========================
    // 4. SERVICE CARDS
    // ========================
    var serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(function(card) {
        gsap.fromTo(card,
            { y: 24, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.75,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 95%',
                    once: true,
                },
            }
        );
    });

    // Value cards stagger
    var valueCards = document.querySelectorAll('.value-card');
    if (valueCards.length > 0) {
        gsap.fromTo(valueCards,
            { y: 20, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.65,
                stagger: 0.08,
                ease: 'power3.out',
                clearProps: 'transform,opacity',
                scrollTrigger: {
                    trigger: '.values-grid',
                    start: 'top 95%',
                    once: true,
                },
            }
        );
    }

    // ========================
    // 5. FOOTER WATERMARK PARALLAX
    // ========================
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

    // ========================
    // 6. NAVIGATION OVERLAY
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

        gsap.fromTo('.nav-link',
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power3.out', delay: 0.05 }
        );
        gsap.fromTo('.nav-contact-info',
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.38 }
        );
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

    function toggleMenu() {
        if (menuOpen) { closeMenu(); } else { openMenu(); }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = link.getAttribute('href');
            var targetEl = targetId ? document.querySelector(targetId) : null;
            var wasOpen = menuOpen;
            if (menuOpen) { closeMenu(); }
            setTimeout(function() {
                if (targetEl) { smoothScrollTo(targetEl); }
            }, wasOpen ? 350 : 0);
        });
    });

    document.addEventListener('keydown', function(e) {
        if ((e.key === 'Escape' || e.keyCode === 27) && menuOpen) {
            closeMenu();
        }
    });

    // ========================
    // 7. SMOOTH SCROLL (cross-browser)
    // ========================
    function smoothScrollTo(target) {
        if (!target) return;
        var targetTop = target.getBoundingClientRect().top + window.pageYOffset;
        var headerHeight = 68;
        var finalY = targetTop - headerHeight;

        if ('scrollBehavior' in document.documentElement.style) {
            window.scrollTo({ top: finalY, behavior: 'smooth' });
        } else {
            var startY = window.pageYOffset;
            var distance = finalY - startY;
            var duration = 600;
            var startTime = null;

            function easeInOutQuad(t) {
                return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            }

            function step(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                window.scrollTo(0, startY + distance * easeInOutQuad(progress));
                if (progress < 1) requestAnimationFrame(step);
            }

            requestAnimationFrame(step);
        }
    }

    // ========================
    // 8. SCROLL-TO BUTTONS
    // ========================
    var scrollToButtons = document.querySelectorAll('[data-scroll-to]');
    scrollToButtons.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var id = btn.getAttribute('data-scroll-to');
            var target = document.getElementById(id);
            if (target) smoothScrollTo(target);
        });
    });

    var logoBtn = document.getElementById('logoBtn');
    if (logoBtn) {
        logoBtn.addEventListener('click', function() {
            if ('scrollBehavior' in document.documentElement.style) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                window.scrollTo(0, 0);
            }
        });
    }

    // ========================
    // 9. HEADER SCROLL BEHAVIOR
    // ========================
    var header = document.getElementById('header');
    var floatingCta = document.getElementById('floatingCta');
    var lastScrollY = 0;
    var headerHidden = false;
    var ticking = false;

    function updateHeader() {
        var scroll = window.pageYOffset || document.documentElement.scrollTop;
        var heroHeight = window.innerHeight;

        if (scroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (hero) {
            if (scroll > heroHeight * 1.5) {
                hero.style.visibility = 'hidden';
            } else {
                hero.style.visibility = 'visible';
            }
        }

        if (scroll > 120) {
            if (scroll > lastScrollY + 5 && !headerHidden) {
                header.classList.add('hide-up');
                headerHidden = true;
            } else if (scroll < lastScrollY - 5 && headerHidden) {
                header.classList.remove('hide-up');
                headerHidden = false;
            }
        } else {
            if (headerHidden) {
                header.classList.remove('hide-up');
                headerHidden = false;
            }
        }

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
    // 10. REFRESH SCROLLTRIGGER ON RESIZE
    // ========================
    var resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            ScrollTrigger.refresh();
        }, 250);
    }, { passive: true });

    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            ScrollTrigger.refresh();
        }, 400);
    }, { passive: true });

});
