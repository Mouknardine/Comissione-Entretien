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

        // Signal principal, et le seul réellement fiable : un échec de
        // chargement déclenche toujours `error`.
        img.addEventListener("error", flag, { once: true });

        // Filet pour le cas où l'image aurait déjà échoué avant l'exécution du
        // script (les modules sont différés, les images se chargent en parallèle).
        //
        // On ne peut PAS conclure sur `complete && naturalWidth === 0` : depuis
        // le passage en <picture>, cette combinaison se produit couramment sur
        // des images parfaitement valides — l'<img> traverse des états où la
        // source retenue n'est pas encore décodée, y compris après `load`.
        // S'y fier masquait le hero une fois sur deux.
        //
        // On demande donc une seconde opinion à une requête neuve : elle seule
        // tranche. Si l'URL répond, rien ne se passe ; si elle est réellement
        // cassée, `error` se déclenche et le repli s'applique. Aucun faux
        // positif possible, et aucun coût réseau quand la ressource est déjà là.
        const recheck = () => {
            if (!img.complete || img.naturalWidth > 0) return;

            const url = img.currentSrc || img.src;
            if (!url) return;

            const probe = new Image();
            probe.addEventListener("error", flag, { once: true });
            probe.src = url;
        };

        if (document.readyState === "complete") recheck();
        else window.addEventListener("load", recheck, { once: true });
    });
}
