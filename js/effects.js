/**
 * effects.js — Efectos visuales y animaciones artísticas.
 * Responsabilidad única: todo lo decorativo inspirado en la acuarela
 * de la tarjeta (apariciones tipo lavado de pintura, pétalos de flor
 * de café flotando, navegación que emerge al hacer scroll).
 * No contiene lógica de negocio ni de tiempo.
 */
window.WeddingApp = window.WeddingApp || {};

window.WeddingApp.effects = (function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ── Aparición tipo acuarela al entrar en pantalla ─────────── */

  function initScrollReveal() {
    const revealElements = document.querySelectorAll(".reveal");

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach(function (element) {
        element.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealElements.forEach(function (element) {
      observer.observe(element);
    });
  }

  /* ── Navegación que emerge al salir del hero ───────────────── */

  function initTopNavAppearance() {
    const nav = document.getElementById("topNav");
    const hero = document.getElementById("hero");

    if (!nav || !hero || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          nav.classList.toggle("is-visible", !entry.isIntersecting);
        });
      },
      // El nav aparece cuando queda visible menos del 40 % del hero.
      { threshold: 0.4 }
    );

    observer.observe(hero);
  }

  /* ── Siluetas de aves batiendo las alas por el fondo ───────── */
  /* Como las aves de la tarjeta: trazos en "V" cuyas alas suben y
     bajan morfando la curva del trazo (animación SMIL). Cada ave
     recibe dirección de vuelo (izquierda→derecha o al revés),
     deriva vertical, inclinación, altura, tamaño, velocidad y
     cadencia de aleteo aleatorios; el retraso negativo hace que el
     cielo ya esté poblado al cargar la página. */

  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const BIRD_COUNT = 9;

  /* Tres posturas del ala: arriba, planeo y abajo (mismo nº de puntos
     para que el navegador pueda interpolar el morfado). Las puntas
     salen del viewBox a propósito — .bird tiene overflow visible —
     para que la batida sea amplia y visible. */
  const WING_UP = "M2 -3 Q16 -9 30 10 Q44 -9 58 -3";
  const WING_GLIDE = "M2 12 Q16 8 30 11 Q44 8 58 12";
  const WING_DOWN = "M2 25 Q16 31 30 13 Q44 31 58 25";

  /**
   * Ciclo de aleteo realista: unas pocas batidas rápidas seguidas de
   * un planeo largo con las alas extendidas, como hacen las aves de
   * verdad. keyTimes concentra las batidas al inicio del ciclo y
   * reserva el resto para planear.
   */
  function createWingFlapAnimation() {
    const flapCount = 2 + Math.floor(Math.random() * 3); // 2 a 4 batidas
    const cycleSeconds = 2.2 + Math.random() * 2.2;      // ciclo completo
    const strokeSeconds = 0.12 + Math.random() * 0.06;   // media batida

    const frames = [WING_GLIDE];
    const times = [0];
    let elapsed = 0;

    for (let i = 0; i < flapCount; i += 1) {
      frames.push(WING_UP);
      elapsed += strokeSeconds / cycleSeconds;
      times.push(elapsed);
      frames.push(WING_DOWN);
      elapsed += strokeSeconds / cycleSeconds;
      times.push(elapsed);
    }

    // Vuelta al planeo... y alas quietas hasta cerrar el ciclo.
    frames.push(WING_GLIDE);
    elapsed += strokeSeconds / cycleSeconds;
    times.push(Math.min(elapsed, 0.95));
    frames.push(WING_GLIDE);
    times.push(1);

    const flap = document.createElementNS(SVG_NAMESPACE, "animate");
    flap.setAttribute("attributeName", "d");
    flap.setAttribute("values", frames.join(";"));
    flap.setAttribute(
      "keyTimes",
      times.map(function (t) { return t.toFixed(3); }).join(";")
    );
    flap.setAttribute("dur", cycleSeconds.toFixed(2) + "s");
    flap.setAttribute("begin", (-Math.random() * cycleSeconds).toFixed(2) + "s");
    flap.setAttribute("repeatCount", "indefinite");
    return flap;
  }

  function createBirdElement() {
    const bird = document.createElementNS(SVG_NAMESPACE, "svg");
    bird.setAttribute("viewBox", "0 0 60 24");
    bird.classList.add("bird", "bird--sky");

    const wings = document.createElementNS(SVG_NAMESPACE, "path");
    wings.setAttribute("d", WING_GLIDE);
    wings.setAttribute("fill", "none");
    wings.appendChild(createWingFlapAnimation());
    bird.appendChild(wings);

    // Eje horizontal: la mitad cruza hacia la derecha, la otra hacia la izquierda.
    const fliesRight = Math.random() < 0.5;
    const travelVw = 110 + Math.random() * 10;

    bird.style.left = fliesRight ? "-6%" : "104%";
    bird.style.setProperty(
      "--fly-x",
      ((fliesRight ? 1 : -1) * travelVw).toFixed(0) + "vw"
    );

    // Eje vertical: deriva de subida/bajada y punto medio de remonte.
    bird.style.setProperty("--fly-y", (Math.random() * 44 - 22).toFixed(1) + "vh");
    bird.style.setProperty("--fly-lift", (Math.random() * 28 - 14).toFixed(1) + "vh");
    bird.style.rotate = (Math.random() * 14 - 7).toFixed(1) + "deg";

    // Eje de profundidad: cerca = grande y oscura; lejos = pequeña y tenue.
    bird.style.setProperty("--depth-near", (1.05 + Math.random() * 0.6).toFixed(2));
    bird.style.setProperty("--depth-far", (0.35 + Math.random() * 0.3).toFixed(2));
    bird.style.setProperty("--op-near", (0.38 + Math.random() * 0.22).toFixed(2));
    bird.style.setProperty("--op-far", (0.1 + Math.random() * 0.14).toFixed(2));

    bird.style.top = (4 + Math.random() * 42).toFixed(1) + "%";
    bird.style.width = Math.round(16 + Math.random() * 20) + "px";

    // Dos animaciones compuestas: la travesía y la respiración de
    // profundidad, cada una con duración y desfase propios para que
    // ningún vuelo se repita igual.
    const flightSeconds = 26 + Math.random() * 26;
    const depthSeconds = 9 + Math.random() * 10;
    bird.style.animation =
      "bird-fly " + flightSeconds.toFixed(1) + "s linear " +
      (-Math.random() * flightSeconds).toFixed(1) + "s infinite, " +
      "bird-depth " + depthSeconds.toFixed(1) + "s ease-in-out " +
      (-Math.random() * depthSeconds).toFixed(1) + "s infinite alternate";

    return bird;
  }

  function initBackgroundBirds() {
    const skyContainer = document.getElementById("skyBirds");
    if (!skyContainer || prefersReducedMotion) return;

    for (let i = 0; i < BIRD_COUNT; i += 1) {
      skyContainer.appendChild(createBirdElement());
    }
  }

  /* ── Pétalos de flor de café flotando en el hero ───────────── */
  /* La flor del café es blanca: pequeños trazos claros a la deriva,
     como pigmento suelto sobre el lienzo. */

  const PETAL_COUNT = 16;
  const PETAL_COLORS = [
    "rgba(255, 253, 247, 0.9)",
    "rgba(238, 217, 168, 0.75)", // crema de la balaustrada
    "rgba(201, 207, 219, 0.7)",  // gris-lavanda del vestido
  ];

  function createPetal(canvasWidth, canvasHeight, randomizeY) {
    return {
      x: Math.random() * canvasWidth,
      y: randomizeY ? Math.random() * canvasHeight : -12,
      radius: 2 + Math.random() * 3.5,
      driftX: -0.15 + Math.random() * 0.3,
      fallSpeed: 0.18 + Math.random() * 0.35,
      wobblePhase: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.004 + Math.random() * 0.008,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
    };
  }

  function drawPetal(context, petal) {
    context.beginPath();
    // Elipse levemente rotada: parece un pétalo pintado, no un punto.
    context.ellipse(
      petal.x,
      petal.y,
      petal.radius,
      petal.radius * 0.55,
      petal.wobblePhase,
      0,
      Math.PI * 2
    );
    context.fillStyle = petal.color;
    context.fill();
  }

  function initFloatingPetals() {
    const canvas = document.getElementById("petalsCanvas");
    if (!canvas || prefersReducedMotion) return;

    const context = canvas.getContext("2d");
    let petals = [];

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function resetPetals() {
      petals = [];
      for (let i = 0; i < PETAL_COUNT; i += 1) {
        petals.push(createPetal(canvas.width, canvas.height, true));
      }
    }

    function updateAndDrawFrame(timestamp) {
      context.clearRect(0, 0, canvas.width, canvas.height);

      petals.forEach(function (petal, index) {
        petal.wobblePhase += petal.wobbleSpeed;
        petal.x += petal.driftX + Math.sin(timestamp * 0.0004 + index) * 0.2;
        petal.y += petal.fallSpeed;

        const isOutOfView =
          petal.y > canvas.height + 14 ||
          petal.x < -14 ||
          petal.x > canvas.width + 14;

        if (isOutOfView) {
          petals[index] = createPetal(canvas.width, canvas.height, false);
        }

        drawPetal(context, petals[index]);
      });

      window.requestAnimationFrame(updateAndDrawFrame);
    }

    resizeCanvas();
    resetPetals();
    window.addEventListener("resize", function () {
      resizeCanvas();
      resetPetals();
    });
    window.requestAnimationFrame(updateAndDrawFrame);
  }

  /* ── API pública del módulo ─────────────────────────────────── */

  function init() {
    initScrollReveal();
    initTopNavAppearance();
    initBackgroundBirds();
    initFloatingPetals();
  }

  return { init: init };
})();
