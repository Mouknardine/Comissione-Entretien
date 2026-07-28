/**
 * Verrou de défilement partagé par le menu et la visionneuse.
 *
 * iOS Safari ignore `overflow: hidden` sur le body : la page continue de
 * défiler derrière le panneau ouvert. Le seul remède fiable est de figer le
 * body en position fixe, ce qui fait perdre la position de défilement — on la
 * mémorise donc pour la restituer au déverrouillage.
 */
let savedScrollY = 0;
let depth = 0;

export function lockScroll() {
    if (depth++ > 0) return;

    savedScrollY = window.scrollY;
    document.body.style.top = `-${savedScrollY}px`;
    document.body.classList.add("is-locked");
}

export function unlockScroll() {
    if (depth === 0 || --depth > 0) return;

    document.body.classList.remove("is-locked");
    document.body.style.top = "";

    /* La feuille de styles applique `scroll-behavior: smooth` : sans cette
       neutralisation, la page glisserait jusqu'à sa position au lieu de s'y
       retrouver simplement, ce qui se voit à la fermeture du menu. */
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, savedScrollY);
    root.style.scrollBehavior = previous;
}
