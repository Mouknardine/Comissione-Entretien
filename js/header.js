/**
 * Header transparent au-dessus du hero, opaque dès que l'on quitte le haut de page.
 * Sur les pages sans hero (`.header--solid`), rien à faire.
 */
export function initHeader() {
    const header = document.querySelector("[data-header]");

    if (!header || header.classList.contains("header--solid")) return;

    const sentinel = document.querySelector("[data-header-sentinel]");
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
        header.classList.toggle("is-scrolled", !entry.isIntersecting);
    });

    observer.observe(sentinel);
}
