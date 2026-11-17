/**
 * NOSSA HISTÓRIA ❤️
 * Surpresa do Dia - Escolha nosso próximo momento (roulette.js)
 */

class RomanticRoulette {
  constructor() {
    this.experiences = [];
    this.currentExperience = null;
    this.isSpinning = false;
  }

  async init() {
    await this.refresh();
    this.bindEvents();
  }

  async refresh() {
    this.experiences = await window.storyDB.getAllExperiences();
  }

  bindEvents() {
    const spinBtn = document.getElementById("roulette-spin-btn");
    const scheduleBtn = document.getElementById("roulette-schedule-btn");
    const completeBtn = document.getElementById("roulette-complete-btn");

    if (spinBtn) {
      spinBtn.addEventListener("click", () => {
        this.spin();
      });
    }

    if (scheduleBtn) {
      scheduleBtn.addEventListener("click", () => {
        if (this.currentExperience) {
          window.app.openScheduleModal(this.currentExperience.id);
        }
      });
    }

    if (completeBtn) {
      completeBtn.addEventListener("click", () => {
        if (this.currentExperience) {
          window.app.openExperienceModal(this.currentExperience.id);
        }
      });
    }
  }

  async spin() {
    if (this.isSpinning) return;
    await this.refresh();

    // Filtrar apenas as NÃO CONCLUÍDAS
    const available = this.experiences.filter(exp => exp.status !== "concluida");

    const container = document.getElementById("roulette-card-box");
    const numberEl = document.getElementById("roulette-number-badge");
    const titleEl = document.getElementById("roulette-title");
    const descEl = document.getElementById("roulette-desc");
    const tipEl = document.getElementById("roulette-tip");
    const actionBtns = document.getElementById("roulette-actions-row");

    if (!container) return;

    // Se todas as 25 estiverem concluídas
    if (available.length === 0) {
      numberEl.textContent = "🏆 25 / 25";
      titleEl.textContent = "Todas as 25 experiências foram vividas!";
      descEl.textContent = "Vocês completaram todos os desafios românticos da lista. Que linda história vocês construíram juntos! Que tal revisitar o mural de memórias ou a linha do tempo?";
      tipEl.innerHTML = `<strong>Dica eterna:</strong> O amor se renova todos os dias. Continuem criando suas próprias tradições!`;
      if (actionBtns) actionBtns.style.display = "none";
      window.app.triggerHeartConfetti();
      return;
    }

    if (actionBtns) actionBtns.style.display = "none";
    this.isSpinning = true;
    container.classList.add("spinning");

    // Efeito de roleta girando / alternando títulos
    let counter = 0;
    const interval = setInterval(() => {
      const tempExp = available[Math.floor(Math.random() * available.length)];
      numberEl.textContent = `#${String(tempExp.id).padStart(2, "0")}`;
      titleEl.textContent = tempExp.title;
      descEl.textContent = "Sorteando o momento perfeito para vocês...";
      tipEl.textContent = "";
      counter++;

      if (counter > 15) {
        clearInterval(interval);
        this.finishSpin(available, container, numberEl, titleEl, descEl, tipEl, actionBtns);
      }
    }, 70);
  }

  finishSpin(available, container, numberEl, titleEl, descEl, tipEl, actionBtns) {
    container.classList.remove("spinning");
    this.isSpinning = false;

    // Selecionar o item definitivo aleatório
    const chosen = available[Math.floor(Math.random() * available.length)];
    this.currentExperience = chosen;

    numberEl.textContent = `#${String(chosen.id).padStart(2, "0")} • ${chosen.category}`;
    titleEl.textContent = chosen.title;
    descEl.textContent = chosen.description;
    tipEl.innerHTML = `
      <div class="exp-tip-box" style="margin-top:0.75rem; text-align:left;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
        <div>
          <strong style="color:var(--wine-900);">Ideia carinhosa:</strong>
          <span>${chosen.romanticTip}</span>
        </div>
      </div>
    `;

    if (actionBtns) {
      actionBtns.style.display = "flex";
    }

    // Leve vibração háptica no celular
    if (navigator.vibrate) {
      navigator.vibrate([40, 60, 100]);
    }

    window.app.triggerHeartConfetti();
  }
}

window.romanticRoulette = new RomanticRoulette();
