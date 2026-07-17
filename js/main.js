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

  /* El video vive en YouTube. Se muestra solo la miniatura hasta que
     el usuario pulsa play, para no cargar el iframe (y su JS) gratis.
     Ojo: el embed de YouTube no funciona abriendo index.html como
     archivo (file://); pruébalo con un servidor local o publicado. */
  function initHeroVideoPlayer() {
    const container = document.getElementById("heroVideo");
    const playButton = document.getElementById("videoPlayButton");

    if (!container || !playButton) return;

    const youtubeId = container.dataset.youtubeId;

    playButton.addEventListener("click", function () {
      const iframe = document.createElement("iframe");
      iframe.className = "video-frame__iframe";
      /* start=0 fuerza el inicio desde el segundo cero y vq=hd1080
         pide la máxima calidad (YouTube puede bajarla si la conexión
         o el tamaño del reproductor no dan para más). enablejsapi=1
         permite mandarle comandos al reproductor (volumen). */
      iframe.src =
        "https://www.youtube.com/embed/" +
        youtubeId +
        "?autoplay=1&start=0&vq=hd1080&rel=0&enablejsapi=1";
      iframe.title = "YouTube video player";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.allowFullscreen = true;
      iframe.frameBorder = "0";

      /* Al cargar el iframe, se le pide al reproductor quitar el
         silencio y subir el volumen al máximo. Se reintenta unas
         cuantas veces porque el reproductor interno tarda un poco
         en estar listo para recibir comandos. */
      iframe.addEventListener("load", function () {
        let attempts = 0;

        const raiseVolume = setInterval(function () {
          attempts += 1;

          ["unMute", "setVolume"].forEach(function (command) {
            iframe.contentWindow.postMessage(
              JSON.stringify({
                event: "command",
                func: command,
                args: command === "setVolume" ? [100] : [],
              }),
              "https://www.youtube.com"
            );
          });

          if (attempts >= 5) clearInterval(raiseVolume);
        }, 400);
      });

      container.innerHTML = "";
      container.appendChild(iframe);
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
