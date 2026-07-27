/**
 * Apparition progressive au scroll.
 *
 * Deux familles d'éléments sont observées :
 *   .reveal        — fondu + translation légère du bloc
 *   .reveal-media  — rideau rouge qui se retire de la photo
 *
 * Le décalage en cascade entre voisins est calculé automatiquement à partir de
 * la position dans le parent ; un `data-delay` explicite reste prioritaire.
 *
 * IntersectionObserver mène la danse, mais un balayage géométrique sert de
 * filet : si l'observateur ne répond pas (onglet en arrière-plan au moment du
 * rendu, navigateur exotique), le contenu apparaît quand même. Sans ce filet,
 * un blocage laisserait la page entière à opacité 0.
 */
const STAGGER_MS = 70;
const STAGGER_MAX_MS = 350;
const TRIGGER_RATIO = 0.92;

function applyStagger(el) {
    if (el.dataset.delay) return;

    const parent = el.parentElement;
    if (!parent) return;

    const siblings = [...parent.children].filter((child) =>
        child.classList.contains("reveal")
    );
    if (siblings.length < 2) return;

    const delay = Math.min(siblings.indexOf(el) * STAGGER_MS, STAGGER_MAX_MS);
    el.style.transitionDelay = `${delay}ms`;
}

export function initScrollReveal() {
    const items = [...document.querySelectorAll(".reveal, .reveal-media")];
    if (!items.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
        items.forEach((item) => item.classList.add("is-visible"));
        return;
    }

    const pending = new Set(items);
    let observer = null;

    const show = (el) => {
        applyStagger(el);
        el.classList.add("is-visible");
        pending.delete(el);
        observer?.unobserve(el);
    };

    if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        show(entry.target);
                        return;
                    }

                    // Arrivée directe sur une ancre : ce qui est déjà passé
                    // au-dessus du viewport doit rester visible si l'on remonte.
                    if (entry.boundingClientRect.bottom < 0) show(entry.target);
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
        );

        items.forEach((item) => observer.observe(item));
    }

    let ticking = false;

    const sweep = () => {
        ticking = false;

        if (!pending.size) {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            return;
        }

        const limit = window.innerHeight * TRIGGER_RATIO;

        pending.forEach((el) => {
            const box = el.getBoundingClientRect();
            if (box.top < limit && box.bottom > 0) show(el);
        });
    };

    // Volontairement sur setTimeout et non requestAnimationFrame : le filet doit
    // rester opérant même quand le navigateur ne rend pas de frame. Le balayage
    // est léger et déjà limité par le drapeau `ticking`.
    function onScroll() {
        if (ticking) return;
        ticking = true;
        setTimeout(sweep, 16);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // Ce qui est déjà à l'écran au chargement, si l'observateur n'a rien dit
    setTimeout(sweep, 400);
}
