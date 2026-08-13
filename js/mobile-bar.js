/**
 * Barre d'appel fixe (mobile) — retirée tant que l'image du hero est à l'écran.
 *
 * Uniquement sur l'accueil : son hero occupe tout le premier écran et porte
 * déjà un bouton d'appel et un bouton secondaire. La barre fixe par-dessus
 * faisait une troisième action concurrente. Elle apparaît donc dès que l'image
 * est dépassée, et se retire si l'on remonte.
 *
 * Les autres pages ne sont pas concernées : `.hero` n'y existe pas, la barre y
 * reste affichée en permanence.
 *
 * Le masquage est purement décoratif : il vit dans `.js-anim`, posé sur <html>
 * par le script inline en tête de page. Si ce module ne s'exécute pas, aucune
 * règle ne masque la barre et elle reste visible en permanence.
 */
const HEAD_SELECTOR = ".hero";

export function initMobileBar() {
    const bar = document.querySelector(".mobile-bar");
    if (!bar) return;

    const show = (visible) => bar.classList.toggle("is-shown", visible);

    const head = document.querySelector(HEAD_SELECTOR);

    // Page sans hero — toutes sauf l'accueil — ou navigateur sans
    // IntersectionObserver : la barre reste affichée sans condition.
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
