/**
 * countdown.js — Lógica exclusiva de la cuenta regresiva.
 * Responsabilidad única: calcular el tiempo restante hasta la boda
 * y pintar los valores en el DOM. No conoce nada de efectos visuales.
 *
 * Se expone bajo el espacio de nombres WeddingApp para no dejar
 * variables globales sueltas (los scripts se cargan como clásicos
 * para funcionar también al abrir el archivo directamente).
 */
window.WeddingApp = window.WeddingApp || {};

window.WeddingApp.countdown = (function () {
  "use strict";

  /** 12 de septiembre de 2026, 2:00 p. m., hora de Colombia (UTC-5). */
  const WEDDING_DATE = new Date("2026-09-12T14:00:00-05:00");

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  let intervalId = null;

  /** Descompone los milisegundos restantes en unidades legibles. */
  function calculateTimeRemaining(now) {
    const remainingMs = Math.max(0, WEDDING_DATE.getTime() - now.getTime());

    return {
      total: remainingMs,
      days: Math.floor(remainingMs / MS_PER_DAY),
      hours: Math.floor((remainingMs % MS_PER_DAY) / MS_PER_HOUR),
      minutes: Math.floor((remainingMs % MS_PER_HOUR) / MS_PER_MINUTE),
      seconds: Math.floor((remainingMs % MS_PER_MINUTE) / MS_PER_SECOND),
    };
  }

  /** Rellena con cero a la izquierda: 7 → "07". */
  function formatUnitValue(value) {
    return String(value).padStart(2, "0");
  }

  /**
   * Escribe cada unidad en su elemento y marca con una clase el
   * cambio de valor para que CSS anime el "tic" del dígito.
   */
  function renderTimeRemaining(unitElements, timeRemaining) {
    unitElements.forEach(function (element) {
      const unitName = element.dataset.countdownUnit;
      const newValue = formatUnitValue(timeRemaining[unitName]);

      if (element.textContent !== newValue) {
        element.textContent = newValue;
        element.classList.remove("is-ticking");
        // Reinicia la animación CSS forzando un reflow puntual.
        void element.offsetWidth;
        element.classList.add("is-ticking");
      }
    });
  }

  /** Cambia la vista cuando la cuenta llega a cero. */
  function showFinishedState(gridElement, finishedElement) {
    if (gridElement) gridElement.setAttribute("aria-hidden", "true");
    if (finishedElement) finishedElement.hidden = false;
  }

  /**
   * Punto de entrada del módulo. Busca los elementos, arranca el
   * temporizador y se detiene solo cuando la fecha se alcanza.
   */
  function init() {
    const unitElements = Array.from(
      document.querySelectorAll("[data-countdown-unit]")
    );

    if (unitElements.length === 0) return;

    const gridElement = document.getElementById("countdownGrid");
    const finishedElement = document.getElementById("countdownFinished");

    function tick() {
      const timeRemaining = calculateTimeRemaining(new Date());
      renderTimeRemaining(unitElements, timeRemaining);

      if (timeRemaining.total <= 0 && intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
        showFinishedState(gridElement, finishedElement);
      }
    }

    tick();
    intervalId = setInterval(tick, MS_PER_SECOND);
  }

  return { init: init };
})();
