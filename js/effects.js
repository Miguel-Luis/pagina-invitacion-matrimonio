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

  /** Menos aves en pantallas pequeñas: cada morfado SMIL cuesta CPU. */
  function getBirdCount() {
    return window.matchMedia("(max-width: 640px)").matches ? 6 : 9;
  }

  /** Número aleatorio en el rango [min, max). */
  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  /* Cada especie define sus tres posturas del ala — arriba, planeo y
     abajo — con el mismo nº de puntos para que el navegador pueda
     interpolar el morfado, más su propio carácter de vuelo: tamaño,
     grosor del trazo, nº de batidas por ciclo, velocidad de la batida
     y duración del ciclo. Las puntas salen del viewBox a propósito —
     .bird tiene overflow visible — para que la batida sea amplia. */
  const BIRD_SPECIES = [
    {
      // Golondrina: pequeña, alas puntiagudas en flecha, aleteo
      // rápido y nervioso con planeos cortos.
      name: "swallow",
      wingUp: "M8 -4 Q20 -12 30 8 Q40 -12 52 -4",
      wingGlide: "M6 20 Q18 0 30 10 Q42 0 54 20",
      wingDown: "M10 25 Q22 30 30 11 Q38 30 50 25",
      width: [13, 22],
      strokeWidth: 2.2,
      flapCount: [3, 6],
      strokeSeconds: [0.07, 0.11],
      cycleSeconds: [1.4, 2.8],
    },
    {
      // Gaviota: mediana, alas arqueadas (hombro alto, puntas caídas),
      // batidas pausadas y planeos amplios.
      name: "gull",
      wingUp: "M2 -3 Q16 -9 30 10 Q44 -9 58 -3",
      wingGlide: "M2 17 Q16 3 30 12 Q44 3 58 17",
      wingDown: "M2 25 Q16 31 30 13 Q44 31 58 25",
      width: [20, 32],
      strokeWidth: 2.4,
      flapCount: [2, 5],
      strokeSeconds: [0.12, 0.18],
      cycleSeconds: [2.2, 4.4],
    },
    {
      // Gavilán: grande, alas anchas y casi rectas de envergadura
      // completa; apenas una o dos batidas lentas y mucho planeo.
      name: "hawk",
      wingUp: "M0 2 Q14 -6 30 9 Q46 -6 60 2",
      wingGlide: "M0 12 Q15 5 30 10 Q45 5 60 12",
      wingDown: "M0 20 Q14 26 30 12 Q46 26 60 20",
      width: [28, 42],
      strokeWidth: 2.8,
      flapCount: [1, 3],
      strokeSeconds: [0.2, 0.3],
      cycleSeconds: [3.5, 6],
    },
  ];

  /**
   * Ciclo de aleteo realista: unas pocas batidas rápidas seguidas de
   * un planeo largo con las alas extendidas, como hacen las aves de
   * verdad. keyTimes concentra las batidas al inicio del ciclo y
   * reserva el resto para planear. La cadencia sale de la especie.
   */
  function createWingFlapAnimation(species) {
    const flapCount =
      species.flapCount[0] +
      Math.floor(Math.random() * (species.flapCount[1] - species.flapCount[0] + 1));
    const cycleSeconds = randomBetween(species.cycleSeconds[0], species.cycleSeconds[1]);
    const strokeSeconds = randomBetween(species.strokeSeconds[0], species.strokeSeconds[1]);

    const frames = [species.wingGlide];
    const times = [0];
    let elapsed = 0;

    for (let i = 0; i < flapCount; i += 1) {
      frames.push(species.wingUp);
      elapsed += strokeSeconds / cycleSeconds;
      times.push(elapsed);
      frames.push(species.wingDown);
      elapsed += strokeSeconds / cycleSeconds;
      times.push(elapsed);
    }

    // Vuelta al planeo... y alas quietas hasta cerrar el ciclo.
    frames.push(species.wingGlide);
    elapsed += strokeSeconds / cycleSeconds;
    times.push(Math.min(elapsed, 0.95));
    frames.push(species.wingGlide);
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
    const species = BIRD_SPECIES[Math.floor(Math.random() * BIRD_SPECIES.length)];

    const bird = document.createElementNS(SVG_NAMESPACE, "svg");
    bird.setAttribute("viewBox", "0 0 60 24");
    bird.classList.add("bird", "bird--sky");
    bird.style.strokeWidth = species.strokeWidth;

    const wings = document.createElementNS(SVG_NAMESPACE, "path");
    wings.setAttribute("d", species.wingGlide);
    wings.setAttribute("fill", "none");
    wings.appendChild(createWingFlapAnimation(species));
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
    bird.style.width =
      Math.round(randomBetween(species.width[0], species.width[1])) + "px";

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

    const birdCount = getBirdCount();
    for (let i = 0; i < birdCount; i += 1) {
      skyContainer.appendChild(createBirdElement());
    }
  }

  /* ── Pétalos de flor de café flotando en el hero ───────────── */
  /* La flor del café es blanca: pequeños trazos claros a la deriva,
     como pigmento suelto sobre el lienzo. */

  const PETAL_COLORS = [
    "rgba(255, 253, 247, 0.9)",
    "rgba(238, 217, 168, 0.75)", // crema de la balaustrada
    "rgba(201, 207, 219, 0.7)",  // gris-lavanda del vestido
  ];

  /** Densidad constante: más pétalos cuanto mayor sea el lienzo,
      con tope para no saturar pantallas grandes ni la CPU. */
  function getPetalCount(canvasWidth, canvasHeight) {
    const count = Math.round((canvasWidth * canvasHeight) / 20000);
    return Math.max(28, Math.min(count, 100));
  }

  function createPetal(canvasWidth, canvasHeight, randomizeY) {
    return {
      x: Math.random() * canvasWidth,
      y: randomizeY ? Math.random() * canvasHeight : -12,
      radius: 2 + Math.random() * 3.5,
      driftX: -0.15 + Math.random() * 0.3,
      fallSpeed: 0.10 + Math.random() * 0.25,
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
    let isAnimating = false;
    let isHeroVisible = true;

    function resizeCanvas() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }

    function resetPetals() {
      petals = [];
      const petalCount = getPetalCount(canvas.width, canvas.height);
      for (let i = 0; i < petalCount; i += 1) {
        petals.push(createPetal(canvas.width, canvas.height, true));
      }
    }

    function updateAndDrawFrame(timestamp) {
      if (!isAnimating) return;

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

    /* El bucle solo corre cuando el hero está en pantalla Y la
       pestaña visible: fuera de eso, cero trabajo por frame. */
    function syncAnimationState() {
      const shouldAnimate = isHeroVisible && !document.hidden;
      if (shouldAnimate && !isAnimating) {
        isAnimating = true;
        window.requestAnimationFrame(updateAndDrawFrame);
      } else if (!shouldAnimate) {
        isAnimating = false;
      }
    }

    resizeCanvas();
    resetPetals();

    // Solo se regeneran los pétalos si cambió el ancho: en móvil el
    // scroll dispara "resize" al ocultarse la barra de direcciones.
    let lastWidth = canvas.offsetWidth;
    window.addEventListener("resize", function () {
      if (canvas.offsetWidth !== lastWidth) {
        lastWidth = canvas.offsetWidth;
        resizeCanvas();
        resetPetals();
      } else if (canvas.height !== canvas.offsetHeight) {
        canvas.height = canvas.offsetHeight;
      }
    });

    if ("IntersectionObserver" in window) {
      const heroObserver = new IntersectionObserver(function (entries) {
        isHeroVisible = entries[0].isIntersecting;
        syncAnimationState();
      });
      heroObserver.observe(canvas);
    }

    document.addEventListener("visibilitychange", syncAnimationState);
    syncAnimationState();
  }

  /* ── Viento en la flora ─────────────────────────────────────── */
  /* Las hojas del cafeto y del plátano se mecen con SMIL dentro de
     sus símbolos SVG (ver index.html). SMIL ignora la preferencia de
     movimiento reducido, así que aquí se pausa su línea de tiempo. */

  function pauseFloraWindIfReducedMotion() {
    if (!prefersReducedMotion) return;
    document.querySelectorAll(".flora").forEach(function (svg) {
      if (typeof svg.pauseAnimations === "function") svg.pauseAnimations();
    });
  }

  /* ── API pública del módulo ─────────────────────────────────── */

  function init() {
    initScrollReveal();
    initTopNavAppearance();
    initBackgroundBirds();
    initFloatingPetals();
    pauseFloraWindIfReducedMotion();
  }

  return { init: init };
})();
