/**
 * main.js — Inicialización y pegamento de la página.
 * Responsabilidad única: arrancar cada módulo en el momento adecuado
 * y cablear las interacciones de UI que no son ni "tiempo" ni "efectos"
 * (como el reproductor de video del hero).
 */
window.WeddingApp = window.WeddingApp || {};

(function (app) {
  "use strict";

  /* ── Reproductor de video con botón pintado ────────────────── */

  function initHeroVideoPlayer() {
    const video = document.getElementById("heroVideo");
    const playButton = document.getElementById("videoPlayButton");

    if (!video || !playButton) return;

    playButton.addEventListener("click", function () {
      playButton.classList.add("is-hidden");
      video.controls = true;
      video.play();
    });

    // Si el video termina, el botón pintado vuelve a invitar a verlo.
    video.addEventListener("ended", function () {
      video.controls = false;
      playButton.classList.remove("is-hidden");
    });
  }

  /* ── Arranque ──────────────────────────────────────────────── */

  function bootstrap() {
    if (app.countdown) app.countdown.init();
    if (app.effects) app.effects.init();
    initHeroVideoPlayer();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootstrap);
  } else {
    bootstrap();
  }
})(window.WeddingApp);
