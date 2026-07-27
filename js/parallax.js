/**
 * Dérive douce au scroll sur les blocs marqués `data-parallax`.
 *
 * Le décalage porte sur le conteneur, pas sur l'image : les photos ne sont
 * jamais rognées par le mouvement. `data-parallax` accepte une amplitude en
 * pixels (26 par défaut) ; une valeur négative inverse le sens.
 *
 * Désactivé en mouvement réduit et sous 900 px, où l'effet gêne plus qu'il
 * n'apporte.
 */
export function initParallax() {
    const items = [...document.querySelectorAll("[data-parallax]")];
    if (!items.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 900px)");

    let ticking = false;

    const reset = () => items.forEach((el) => el.style.removeProperty("--shift"));

    const update = () => {
        ticking = false;

        const viewport = window.innerHeight;

        items.forEach((el) => {
            const box = el.getBoundingClientRect();

            // Hors champ : rien à calculer
            if (box.bottom < -240 || box.top > viewport + 240) return;

            const amplitude = Number(el.dataset.parallax) || 26;
            const center = box.top + box.height / 2;
            // −0.5 en haut de l'écran, +0.5 en bas
            const progress = (center - viewport / 2) / viewport;
            const shift = Math.max(-1, Math.min(1, progress)) * -amplitude;

            el.style.setProperty("--shift", `${shift.toFixed(1)}px`);
        });
    };

    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
    };

    const enable = () => {
        if (reduced.matches || small.matches) {
            window.removeEventListener("scroll", onScroll);
            reset();
            return;
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        update();
    };

    window.addEventListener("resize", () => {
        enable();
        onScroll();
    });

    reduced.addEventListener("change", enable);
    small.addEventListener("change", enable);

    enable();
}
