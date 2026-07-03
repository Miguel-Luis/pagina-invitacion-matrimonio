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

  /* Un archivo por calidad: en pantallas pequeñas o conexiones
     lentas se parte del más liviano y el selector permite subir. */
  const VIDEO_SOURCES = {
    "480": "assets/pedida_de_mano_manizales_480p.mp4",
    "720": "assets/pedida_de_mano_manizales_1280p.mp4",
    "1080": "assets/pedida_de_mano_manizales_1080p.mp4",
  };

  function pickInitialVideoQuality() {
    const connection = navigator.connection;
    const isConstrained =
      connection &&
      (connection.saveData || /(^|-)([23])g$/.test(connection.effectiveType || ""));

    if (isConstrained || window.matchMedia("(max-width: 640px)").matches) {
      return "480";
    }
    // 720p rinde de sobra para el ancho del marco; 1080p queda como
    // elección manual (p. ej. para pantalla completa).
    return "720";
  }

  function initHeroVideoPlayer() {
    const video = document.getElementById("heroVideo");
    const playButton = document.getElementById("videoPlayButton");
    const qualityControl = document.getElementById("videoQuality");

    if (!video || !playButton) return;

    let currentQuality = pickInitialVideoQuality();
    video.src = VIDEO_SOURCES[currentQuality];
    video.preload = "metadata";

    function markActiveQualityButton() {
      if (!qualityControl) return;
      qualityControl.querySelectorAll("button").forEach(function (button) {
        button.classList.toggle(
          "is-active",
          button.dataset.quality === currentQuality
        );
      });
    }

    /* Cambia de archivo conservando el punto de reproducción y el
       estado de pausa, para que se sienta como un cambio de calidad
       y no como volver a empezar. */
    function switchQuality(quality) {
      if (quality === currentQuality || !VIDEO_SOURCES[quality]) return;

      const resumeAt = video.currentTime;
      const wasPaused = video.paused;

      currentQuality = quality;
      markActiveQualityButton();

      video.src = VIDEO_SOURCES[quality];
      video.addEventListener(
        "loadedmetadata",
        function () {
          video.currentTime = resumeAt;
          if (!wasPaused) video.play();
        },
        { once: true }
      );
      video.load();
    }

    markActiveQualityButton();

    if (qualityControl) {
      qualityControl.addEventListener("click", function (event) {
        const button = event.target.closest("button[data-quality]");
        if (button) switchQuality(button.dataset.quality);
      });
    }

    playButton.addEventListener("click", function () {
      playButton.classList.add("is-hidden");
      video.controls = true;
      if (qualityControl) qualityControl.classList.add("is-visible");
      video.play();
    });

    // Si el video termina, el botón pintado vuelve a invitar a verlo.
    video.addEventListener("ended", function () {
      video.controls = false;
      if (qualityControl) qualityControl.classList.remove("is-visible");
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
