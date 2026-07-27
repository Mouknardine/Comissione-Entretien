import { initNav } from "./nav.js";
import { initHeader } from "./header.js";
import { initScrollReveal } from "./scroll-reveal.js";
import { initParallax } from "./parallax.js";
import { initMediaFallback } from "./media.js";
import { initLightbox } from "./lightbox.js";

const start = () => {
    initNav();
    initHeader();
    initScrollReveal();
    initParallax();
    initMediaFallback();
    initLightbox();
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
} else {
    start();
}
