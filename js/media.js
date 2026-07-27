/**
 * Filet de sécurité photo : si un fichier est absent ou illisible, le conteneur
 * bascule sur un aplat sombre plutôt que d'afficher une icône d'image cassée
 * ou son texte alternatif au milieu de la mise en page.
 */
export function initMediaFallback() {
    document.querySelectorAll(".media img, .hero-bg").forEach((img) => {
        const flag = () => {
            const holder = img.closest(".media");
            (holder || img).classList.add("is-missing");
        };

        if (img.complete && img.naturalWidth === 0) {
            flag();
            return;
        }

        img.addEventListener("error", flag, { once: true });
    });
}
