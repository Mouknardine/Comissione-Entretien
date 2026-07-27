/**
 * Visionneuse photo — chaque image marquée `.zoom` s'ouvre en grand au clic.
 * Navigation clavier (←, →, Échap), fermeture au clic sur le fond,
 * restitution du focus au déclencheur à la fermeture.
 */
export function initLightbox() {
    const triggers = [...document.querySelectorAll(".zoom")];
    if (!triggers.length) return;

    let index = 0;
    let opener = null;

    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo agrandie");
    box.setAttribute("aria-hidden", "true");
    box.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <button class="lightbox-nav lightbox-nav--prev" type="button" aria-label="Photo précédente">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="lightbox-nav lightbox-nav--next" type="button" aria-label="Photo suivante">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>
        <figure class="lightbox-figure">
            <img alt="">
            <figcaption></figcaption>
        </figure>
        <p class="lightbox-count"></p>
    `;
    document.body.appendChild(box);

    const img = box.querySelector("img");
    const caption = box.querySelector("figcaption");
    const count = box.querySelector(".lightbox-count");
    const closeBtn = box.querySelector(".lightbox-close");
    const prevBtn = box.querySelector(".lightbox-nav--prev");
    const nextBtn = box.querySelector(".lightbox-nav--next");

    const solo = triggers.length < 2;
    prevBtn.hidden = solo;
    nextBtn.hidden = solo;
    count.hidden = solo;

    const render = () => {
        const trigger = triggers[index];
        const source = trigger.querySelector("img");
        if (!source) return;

        img.src = source.currentSrc || source.src;
        img.alt = source.alt || "";
        caption.textContent = trigger.dataset.caption || source.alt || "";
        count.textContent = `${index + 1} / ${triggers.length}`;
    };

    const open = (i, trigger) => {
        index = i;
        opener = trigger;
        render();
        box.classList.add("is-open");
        box.setAttribute("aria-hidden", "false");
        document.body.classList.add("is-locked");
        closeBtn.focus();
    };

    const close = () => {
        box.classList.remove("is-open");
        box.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-locked");
        opener?.focus();
        opener = null;
    };

    const step = (delta) => {
        index = (index + delta + triggers.length) % triggers.length;
        render();
    };

    triggers.forEach((trigger, i) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            open(i, trigger);
        });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", () => step(-1));
    nextBtn.addEventListener("click", () => step(1));

    // Clic sur le fond (pas sur la photo ni les boutons) = fermeture
    box.addEventListener("click", (event) => {
        if (event.target === box || event.target.closest(".lightbox-figure") === null
            && event.target.closest("button") === null) {
            close();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!box.classList.contains("is-open")) return;

        if (event.key === "Escape") close();
        if (solo) return;
        if (event.key === "ArrowLeft") step(-1);
        if (event.key === "ArrowRight") step(1);
    });
}
