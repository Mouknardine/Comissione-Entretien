/**
 * Menu de navigation mobile : ouverture, fermeture, verrou de défilement
 * compatible iOS et piège de focus.
 */
import { lockScroll, unlockScroll } from "./scroll-lock.js";

export function initNav() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const overlay = document.querySelector("[data-nav-overlay]");

    if (!toggle || !overlay) return;

    const links = [...overlay.querySelectorAll("a")];

    const close = ({ restoreFocus = false } = {}) => {
        if (toggle.getAttribute("aria-expanded") !== "true") return;

        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
        document.body.classList.remove("nav-open");
        unlockScroll();

        if (restoreFocus) toggle.focus();
    };

    const open = () => {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fermer le menu");
        document.body.classList.add("nav-open");
        lockScroll();
    };

    toggle.addEventListener("click", () => {
        toggle.getAttribute("aria-expanded") === "true" ? close() : open();
    });

    // Le menu se referme sur le lien cliqué, y compris `tel:` et `mailto:`.
    links.forEach((link) => link.addEventListener("click", () => close()));

    document.addEventListener("keydown", (event) => {
        if (toggle.getAttribute("aria-expanded") !== "true") return;

        if (event.key === "Escape") {
            close({ restoreFocus: true });
            return;
        }

        // Tant que le menu est ouvert, la tabulation reste entre le bouton et les liens.
        if (event.key === "Tab") {
            const focusable = [toggle, ...links];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && active === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && active === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    // Le menu n'a plus de raison d'être ouvert si l'on repasse en navigation desktop.
    window.matchMedia("(min-width: 1060px)").addEventListener("change", (event) => {
        if (event.matches) close();
    });
}
