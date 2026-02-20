/**
 * Commissione Entretien — script.js
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

    // ── Constantes ───────────────────────────────────────────────
    const HEADER_HEIGHT    = 68;
    const SCROLL_THRESHOLD = 50;
    const FLOATING_CTA_MIN = 500;
    const MENU_CLOSE_DELAY = 400; // durée transition CSS nav-overlay (0.4s)
    const WILL_CHANGE_TTL  = 1200; // durée totale animation hero-words (ms)

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Références DOM ───────────────────────────────────────────
    const header      = document.getElementById('header');
    const menuToggle  = document.getElementById('menuToggle');
    const navOverlay  = document.getElementById('navOverlay');
    const navClose    = document.getElementById('navClose');
    const logoBtn     = document.getElementById('logoBtn');
    const floatingCta = document.getElementById('floatingCta');
    const hero        = document.querySelector('.hero');
    const heroWrapper = document.querySelector('.hero-wrapper');
    const heroWords   = document.querySelectorAll('.hero-word');

    // Pré-cache pour éviter querySelectorAll à chaque ouverture du menu
    const navLinks       = document.querySelectorAll('#navOverlay .nav-link');
    const navContactInfo = document.querySelector('#navOverlay .nav-contact-info');

    // ── État ─────────────────────────────────────────────────────
    let ticking         = false;
    let menuOpen        = false;
    let scrollStopTimer = null;
    let savedScrollY    = 0;
    let restoringScroll = false; // bloque le scroll listener pendant la restauration

    // ─────────────────────────────────────────────────────────────
    // 1. VIEWPORT HEIGHT — iOS Safari
    // ─────────────────────────────────────────────────────────────

    // Fixe la hauteur du hero-wrapper une seule fois (évite les rollbacks iOS Safari)
    if (heroWrapper) {
        heroWrapper.style.height = window.innerHeight + 'px';
    }

    function setVh() {
        document.documentElement.style.setProperty('--vh', (window.innerHeight * 0.01) + 'px');
    }

    setVh();
    window.addEventListener('resize', setVh, { passive: true });

    let vhTimer1 = null;
    let vhTimer2 = null;
    window.addEventListener('orientationchange', () => {
        clearTimeout(vhTimer1);
        clearTimeout(vhTimer2);
        vhTimer1 = setTimeout(setVh, 100);
        vhTimer2 = setTimeout(setVh, 300);
    }, { passive: true });


    // ─────────────────────────────────────────────────────────────
    // 2. REVEAL — IntersectionObserver
    // ─────────────────────────────────────────────────────────────

    const revealEls = document.querySelectorAll('.reveal');
    let revealCount    = 0;
    let revealFallback = null;

    function showAllReveals() {
        clearTimeout(revealFallback);
        document.body.classList.add('reveal-done');
        revealEls.forEach(el => el.classList.add('revealed'));
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        showAllReveals();
    } else {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('revealed');
                revealObserver.unobserve(entry.target);
                revealCount++;
                if (revealCount >= revealEls.length) {
                    clearTimeout(revealFallback);
                    document.body.classList.add('reveal-done');
                }
            });
        }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
        // Fallback de sécurité si IntersectionObserver ne répond pas
        revealFallback = setTimeout(showAllReveals, 3000);
    }


    // ─────────────────────────────────────────────────────────────
    // 3. HERO ENTRANCE + libération will-change après animation
    // ─────────────────────────────────────────────────────────────

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (hero) hero.classList.add('hero-loaded');
            // Libère les couches GPU des hero-words après la fin de la dernière transition
            setTimeout(() => {
                heroWords.forEach(w => { w.style.willChange = 'auto'; });
            }, WILL_CHANGE_TTL);
        });
    });


    // ─────────────────────────────────────────────────────────────
    // 4. SMOOTH SCROLL
    // ─────────────────────────────────────────────────────────────

    function smoothScrollTo(target) {
        if (!target) return;
        const finalY = Math.max(0, target.getBoundingClientRect().top + window.scrollY - HEADER_HEIGHT);
        window.scrollTo({ top: finalY, behavior: 'smooth' });
    }


    // ─────────────────────────────────────────────────────────────
    // 5. NAVIGATION OVERLAY
    // ─────────────────────────────────────────────────────────────

    function openMenu() {
        menuOpen     = true;
        savedScrollY = window.scrollY;

        menuToggle?.classList.add('active');
        menuToggle?.setAttribute('aria-expanded', 'true');
        navOverlay?.classList.add('open');
        navOverlay?.setAttribute('aria-hidden', 'false');
        document.body.classList.add('menu-open');

        // Toutes les mutations body dans un seul rAF pour éviter les reflows en cascade
        requestAnimationFrame(() => {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top      = `-${savedScrollY}px`;
            document.body.style.width    = '100%';

            // GSAP lancé dans le frame suivant, layout déjà validé
            requestAnimationFrame(() => {
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

        menuToggle?.classList.remove('active');
        menuToggle?.setAttribute('aria-expanded', 'false');
        navOverlay?.classList.remove('open');
        navOverlay?.setAttribute('aria-hidden', 'true');

        // Attend la fin de la transition CSS du nav-overlay avant de libérer le body
        // (+10ms de marge pour éviter tout flash)
        setTimeout(() => {
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top      = '';
            document.body.style.width    = '';
            restoringScroll = true;
            window.scrollTo(0, savedScrollY);
            setTimeout(() => { restoringScroll = false; }, 200);
        }, MENU_CLOSE_DELAY + 10);
    }

    menuToggle?.addEventListener('click', () => {
        if (menuOpen) { closeMenu(); } else { openMenu(); }
    });

    navClose?.addEventListener('click', closeMenu);

    document.querySelectorAll('[data-nav-link]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const href    = link.getAttribute('href');
            if (!href) return;
            const target  = href === '#home' ? null : document.querySelector(href);
            const wasOpen = menuOpen;
            if (menuOpen) closeMenu();
            // Attend que le body soit restauré (closeMenu attend MENU_CLOSE_DELAY + 10ms) + marge
            setTimeout(() => {
                if (!target) { window.scrollTo({ top: 0, behavior: 'smooth' }); }
                else         { smoothScrollTo(target); }
            }, wasOpen ? MENU_CLOSE_DELAY + 50 : 0);
        });
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && menuOpen) closeMenu();
    });


    // ─────────────────────────────────────────────────────────────
    // 6. BOUTONS SCROLL-TO + LOGO
    // ─────────────────────────────────────────────────────────────

    document.querySelectorAll('[data-scroll-to]').forEach(btn => {
        btn.addEventListener('click', () => {
            smoothScrollTo(document.getElementById(btn.getAttribute('data-scroll-to')));
        });
    });

    logoBtn?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });


    // ─────────────────────────────────────────────────────────────
    // 7. HEADER SCROLL BEHAVIOR
    // ─────────────────────────────────────────────────────────────

    function updateHeader() {
        if (!header) { ticking = false; return; }
        // Ne rien faire si le menu est ouvert (évite les mutations DOM parasites)
        if (menuOpen) { ticking = false; return; }

        const scroll = window.scrollY;

        header.classList.toggle('scrolled', scroll > SCROLL_THRESHOLD);

        floatingCta?.classList.toggle('visible', scroll > FLOATING_CTA_MIN);

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        // Guard : ignorer les scroll events quand le menu est ouvert ou pendant la restauration
        if (menuOpen || restoringScroll) return;

        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });

    updateHeader();

});
