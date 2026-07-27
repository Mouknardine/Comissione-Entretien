/**
 * Overlay de navigation mobile : ouverture, fermeture, piège de focus léger.
 */
export function initNav() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const overlay = document.querySelector("[data-nav-overlay]");

    if (!toggle || !overlay) return;

    const close = () => {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
        document.body.classList.remove("is-locked");
    };

    const open = () => {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fermer le menu");
        document.body.classList.add("is-locked");
    };

    toggle.addEventListener("click", () => {
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        isOpen ? close() : open();
    });

    overlay.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", close);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) {
            close();
            toggle.focus();
        }
    });

    // Le menu n'a plus de raison d'être ouvert si l'on repasse en navigation desktop.
    const desktop = window.matchMedia("(min-width: 1060px)");
    desktop.addEventListener("change", (event) => {
        if (event.matches) close();
    });
}
