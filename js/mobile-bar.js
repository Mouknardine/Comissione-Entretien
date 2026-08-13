/**
 * Barre d'appel fixe (mobile) — retirée tant que le haut de page est à l'écran.
 *
 * Le hero et les en-têtes de page portent déjà un bouton d'appel et un bouton
 * secondaire. La barre fixe par-dessus faisait une troisième action concurrente
 * sur le premier écran. Elle n'apparaît donc qu'une fois ce bloc dépassé, et
 * se retire si l'on remonte.
 *
 * Le masquage est purement décoratif : il vit dans `.js-anim`, posé sur <html>
 * par le script inline en tête de page. Si ce module ne s'exécute pas, aucune
 * règle ne masque la barre et elle reste visible en permanence.
 */
const HEAD_SELECTOR = ".hero, .contact-hero, .page-head";

export function initMobileBar() {
    const bar = document.querySelector(".mobile-bar");
    if (!bar) return;

    const show = (visible) => bar.classList.toggle("is-shown", visible);

    const head = document.querySelector(HEAD_SELECTOR);

    // Pas de bloc d'en-tête repéré, ou navigateur sans IntersectionObserver :
    // on affiche la barre sans condition plutôt que de risquer de la perdre.
    if (!head || !("IntersectionObserver" in window)) {
        show(true);
        return;
    }

    const observer = new IntersectionObserver(
        ([entry]) => {
            // Le premier retour de l'observateur arme le masquage. Tant qu'il
            // n'est pas venu, aucune règle CSS ne masque la barre : un
            // observateur muet laisse le bouton d'appel en place plutôt que de
            // le faire disparaître définitivement.
            bar.classList.add("is-armed");
            show(!entry.isIntersecting);
        },
        { threshold: 0 }
    );

    observer.observe(head);
}
