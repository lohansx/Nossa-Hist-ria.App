/**
 * NOSSA HISTÓRIA ❤️
 * Controlador Principal do Aplicativo (app.js)
 */

class StoryApp {
  constructor() {
    this.currentView = "home";
    this.experiences = [];
    this.settings = {};
    this.filterStatus = "todas"; // 'todas' | 'pendente' | 'planejada' | 'concluida'
    this.searchTerm = "";
    this.activeExperienceId = null;
    this.tempModalPhotos = [];
  }

  async init() {
    console.log("Iniciando Nossa História ❤️...");

    // 1. Inicializar Banco de Dados
    await window.storyDB.init();
    this.settings = await window.storyDB.getSettings();
    this.experiences = await window.storyDB.getAllExperiences();

    // 2. Inicializar Módulos Subjacentes
    await window.coupleCalendar.init();
    await window.memoryGallery.init();
    await window.romanticRoulette.init();
    await window.storyTimeline.init();

    // 3. Vincular Eventos de Navegação e Controles
    this.bindNavigation();
    this.bindFilterAndSearch();
    this.bindModalEvents();
    this.bindSettingsEvents();

    // 4. Renderizar Tela Inicial e Dados
    this.applySettingsToUI();
    this.updateStatsAndProgress();
    this.renderExperiencesList();
    this.renderHomeHighlights();

    // Inicializar Canvas de Confetes
    this.initConfettiCanvas();

    console.log("Nossa História pronta!");
  }

  /* ------------------- NAVEGAÇÃO SPA ------------------- */
  bindNavigation() {
    // Links de navegação desktop e mobile
    const navButtons = document.querySelectorAll("[data-nav]");
    navButtons.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const targetView = btn.getAttribute("data-nav");
        this.navigate(targetView);
      });
    });

    // Tratar hash na URL (ex: #calendario)
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && ["home", "experiences", "calendar", "memories", "roulette", "timeline"].includes(hash)) {
        this.navigate(hash, false);
      }
    });

    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      if (["home", "experiences", "calendar", "memories", "roulette", "timeline"].includes(hash)) {
        this.navigate(hash, false);
      }
    }
  }

  navigate(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Alternar visibilidade das telas
    const views = document.querySelectorAll(".app-view");
    views.forEach(v => {
      if (v.id === `view-${viewName}`) {
        v.style.display = "block";
        v.classList.add("fade-in");
      } else {
        v.style.display = "none";
        v.classList.remove("fade-in");
      }
    });

    // Atualizar links ativos
    document.querySelectorAll("[data-nav]").forEach(btn => {
      if (btn.getAttribute("data-nav") === viewName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Rolar para o topo suavemente
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Atualizar dados da tela correspondente
    if (viewName === "calendar") window.coupleCalendar.refresh();
    if (viewName === "memories") window.memoryGallery.refresh();
    if (viewName === "timeline") window.storyTimeline.refresh();
    if (viewName === "experiences") this.renderExperiencesList();
    if (viewName === "home") this.renderHomeHighlights();
  }

  /* ------------------- CONFIGURAÇÕES E PERFIL DO CASAL ------------------- */
  applySettingsToUI() {
    const coupleNames = this.settings.coupleNames || "Nós Dois";
    const bannerTitle = document.getElementById("hero-couple-title");
    const coupleBadge = document.getElementById("hero-couple-badge");
    const quoteEl = document.getElementById("hero-banner-quote");
    const footerQuote = document.getElementById("footer-romantic-quote");

    if (bannerTitle) bannerTitle.textContent = "Nossa História ❤️";
    if (coupleBadge) {
      let anniversaryText = "";
      if (this.settings.anniversaryDate) {
        const days = this.calculateDaysTogether(this.settings.anniversaryDate);
        anniversaryText = ` • Juntos há ${days} dias`;
      }
      coupleBadge.innerHTML = `<span>💑</span> <span>${coupleNames}${anniversaryText}</span> <span>✏️</span>`;
    }

    const defaultQuote = "Não queremos apenas passar o tempo juntos. Queremos ter histórias para contar sobre ele.";
    const activeQuote = this.settings.quote || defaultQuote;
    if (quoteEl) quoteEl.textContent = `"${activeQuote}"`;
    if (footerQuote) footerQuote.textContent = `"${activeQuote}"`;
  }

  calculateDaysTogether(startDateStr) {
    if (!startDateStr) return 0;
    const start = new Date(startDateStr);
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  }

  bindSettingsEvents() {
    const openSettingsBtn = document.getElementById("open-settings-btn");
    const coupleBadge = document.getElementById("hero-couple-badge");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const exportBtn = document.getElementById("export-backup-btn");
    const importInput = document.getElementById("import-backup-file");
    const resetBtn = document.getElementById("reset-progress-btn");

    if (openSettingsBtn) {
      openSettingsBtn.addEventListener("click", () => this.openSettingsModal());
    }
    if (coupleBadge) {
      coupleBadge.addEventListener("click", () => this.openSettingsModal());
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", async () => {
        const namesInput = document.getElementById("settings-names-input");
        const dateInput = document.getElementById("settings-date-input");
        const quoteInput = document.getElementById("settings-quote-input");

        this.settings.coupleNames = namesInput.value.trim() || "Nós Dois";
        this.settings.anniversaryDate = dateInput.value || "";
        this.settings.quote = quoteInput.value.trim() || DEFAULT_SETTINGS.quote;

        await window.storyDB.saveSettings(this.settings);
        this.applySettingsToUI();
        this.closeModal("settings-modal");
        this.showToast("Configurações salvas com carinho! ❤️", "check");
      });
    }

    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        await window.storyDB.exportBackup();
        this.showToast("Backup baixado com sucesso! Guarde com carinho 💾", "download");
      });
    }

    if (importInput) {
      importInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            await window.storyDB.importBackup(event.target.result);
            this.showToast("Backup restaurado com sucesso! 🎉", "sparkles");
            this.closeModal("settings-modal");
            await this.refreshAll();
          } catch (err) {
            alert("Erro ao ler o arquivo de backup. Verifique se é um arquivo JSON válido.");
          }
        };
        reader.readAsText(file);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.confirmAction(
          "Tem certeza que deseja reiniciar o progresso?",
          "Todas as atividades voltarão para o status 'Pendente' e as fotos serão limpas. Esta ação não poderá ser desfeita.",
          async () => {
            await window.storyDB.resetAllProgress();
            this.closeModal("settings-modal");
            this.showToast("Progresso reiniciado. Um novo capítulo começa agora! ❤️", "sparkles");
            await this.refreshAll();
          }
        );
      });
    }
  }

  openSettingsModal() {
    const namesInput = document.getElementById("settings-names-input");
    const dateInput = document.getElementById("settings-date-input");
    const quoteInput = document.getElementById("settings-quote-input");

    if (namesInput) namesInput.value = this.settings.coupleNames || "";
    if (dateInput) dateInput.value = this.settings.anniversaryDate || "";
    if (quoteInput) quoteInput.value = this.settings.quote || "";

    this.openModal("settings-modal");
  }

  /* ------------------- ESTATÍSTICAS E BARRA DE PROGRESSO ------------------- */
  updateStatsAndProgress() {
    const total = 25;
    const completed = this.experiences.filter(e => e.status === "concluida").length;
    const pending = total - completed;
    const percentage = Math.round((completed / total) * 100);

    // Contadores da Home
    const totalEl = document.getElementById("stat-total-val");
    const completedEl = document.getElementById("stat-completed-val");
    const pendingEl = document.getElementById("stat-pending-val");

    if (totalEl) totalEl.textContent = total;
    if (completedEl) completedEl.textContent = String(completed).padStart(2, "0");
    if (pendingEl) pendingEl.textContent = String(pending).padStart(2, "0");

    // Barra de Progresso
    const barFill = document.getElementById("home-progress-fill");
    const percentEl = document.getElementById("home-progress-percent");
    const progressCaption = document.getElementById("home-progress-caption");

    if (barFill) barFill.style.width = `${percentage}%`;
    if (percentEl) percentEl.textContent = `${percentage}%`;
    if (progressCaption) {
      if (completed === 0) {
        progressCaption.innerHTML = `<span>Nossa jornada está apenas começando...</span> <span>25 esperando</span>`;
      } else if (completed === total) {
        progressCaption.innerHTML = `<span>Parabéns! Todas as 25 histórias foram vividas! ❤️</span> <span>Completo!</span>`;
      } else {
        progressCaption.innerHTML = `<span>${completed} de 25 experiências vividas juntos</span> <span>Faltam ${pending}</span>`;
      }
    }
  }

  renderHomeHighlights() {
    // 1. Próximo encontro agendado
    const nextPlannedContainer = document.getElementById("home-next-planned-card");
    if (nextPlannedContainer) {
      const planned = this.experiences.filter(e => e.status === "planejada" && e.scheduledDate);
      // Ordenar por data mais próxima
      planned.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

      if (planned.length > 0) {
        const next = planned[0];
        const dateFormatted = this.formatDate(next.scheduledDate);
        nextPlannedContainer.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--wine-700); text-transform:uppercase;">Próximo Encontro</span>
            <span class="exp-status-badge planejada">Planejado</span>
          </div>
          <h4 style="font-size:1.1rem; color:var(--wine-900); margin-bottom:0.3rem;">#${next.id} - ${next.title}</h4>
          <p style="font-size:0.84rem; color:var(--gray-600); margin-bottom:0.5rem;">
            📅 <strong>${dateFormatted}</strong> ${next.scheduledTime ? `às <strong>${next.scheduledTime}</strong>` : ""} ${next.scheduledLocation ? `• 📍 ${next.scheduledLocation}` : ""}
          </p>
          <div style="display:flex; gap:0.5rem;">
            <button class="btn-primary" style="padding:0.4rem 0.85rem; font-size:0.82rem;" onclick="window.app.quickMarkCompleted(${next.id})">
              Marcar como Concluída ❤️
            </button>
            <button class="btn-subtle" style="padding:0.4rem 0.85rem; font-size:0.82rem;" onclick="window.app.openExperienceModal(${next.id})">
              Ver Detalhes
            </button>
          </div>
        `;
      } else {
        nextPlannedContainer.innerHTML = `
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <div>
              <h4 style="font-size:1.05rem; color:var(--wine-900); margin-bottom:0.25rem;">Nenhum date agendado no momento</h4>
              <p style="font-size:0.85rem; color:var(--gray-600);">Que tal escolher uma atividade ou usar a "Surpresa do Dia"?</p>
            </div>
            <button class="btn-primary" onclick="window.app.navigate('roulette')" style="padding:0.5rem 1rem; font-size:0.84rem; white-space:nowrap;">
              Sortear Date 🎲
            </button>
          </div>
        `;
      }
    }
  }

  /* ------------------- AGENDA DAS 25 EXPERIÊNCIAS ------------------- */
  bindFilterAndSearch() {
    const searchInput = document.getElementById("exp-search-input");
    const filterPills = document.querySelectorAll(".filter-pill");

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchTerm = e.target.value.toLowerCase().trim();
        this.renderExperiencesList();
      });
    }

    filterPills.forEach(pill => {
      pill.addEventListener("click", () => {
        filterPills.forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.filterStatus = pill.getAttribute("data-filter");
        this.renderExperiencesList();
      });
    });
  }

  renderExperiencesList() {
    const grid = document.getElementById("experiences-grid");
    if (!grid) return;

    // Filtrar e Buscar
    let list = this.experiences.filter(exp => {
      // Filtro de Status
      if (this.filterStatus !== "todas" && exp.status !== this.filterStatus) {
        return false;
      }
      // Busca por texto
      if (this.searchTerm) {
        const titleMatch = exp.title.toLowerCase().includes(this.searchTerm);
        const descMatch = exp.description.toLowerCase().includes(this.searchTerm);
        const catMatch = exp.category.toLowerCase().includes(this.searchTerm);
        const numMatch = String(exp.id).includes(this.searchTerm);
        return titleMatch || descMatch || catMatch || numMatch;
      }
      return true;
    });

    grid.innerHTML = "";

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="empty-state-title">Nenhuma experiência encontrada</h3>
          <p class="empty-state-text">Tente alterar o filtro de status ou pesquisar com outras palavras-chave.</p>
        </div>
      `;
      return;
    }

    list.forEach(exp => {
      const card = document.createElement("div");
      card.className = `exp-card status-${exp.status}`;

      const isDone = exp.status === "concluida";
      const isPlanned = exp.status === "planejada";

      let statusBadgeText = "Pendente";
      if (isDone) statusBadgeText = "Concluída ❤️";
      else if (isPlanned) statusBadgeText = "Planejada ⏳";

      let dateChip = "";
      if (isDone && exp.completedDate) {
        dateChip = `
          <div class="exp-date-indicator">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Vivido em ${this.formatDate(exp.completedDate)}
          </div>
        `;
      } else if (isPlanned && exp.scheduledDate) {
        dateChip = `
          <div class="exp-date-indicator" style="background:var(--status-planned-bg); color:var(--status-planned-text);">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Agendado para ${this.formatDate(exp.scheduledDate)}
          </div>
        `;
      }

      // Fotos no card
      let photoStripHtml = "";
      if (exp.photos && exp.photos.length > 0) {
        photoStripHtml = `<div class="exp-photo-strip">`;
        exp.photos.slice(0, 4).forEach(p => {
          const src = typeof p === "string" ? p : p.dataUrl;
          photoStripHtml += `<img src="${src}" class="exp-photo-thumb" onclick="window.memoryGallery.openLightbox('${src}', '${exp.title}')" alt="Foto">`;
        });
        if (exp.photos.length > 4) {
          photoStripHtml += `<span style="font-size:0.75rem; color:var(--wine-700); font-weight:700; align-self:center;">+${exp.photos.length - 4}</span>`;
        }
        photoStripHtml += `</div>`;
      }

      card.innerHTML = `
        <div class="exp-card-header">
          <span class="exp-number-tag">#${String(exp.id).padStart(2, "0")} • ${exp.category}</span>
          <span class="exp-status-badge ${exp.status}">${statusBadgeText}</span>
        </div>

        <div class="exp-card-body">
          <h3 class="exp-title">${exp.title}</h3>
          <p class="exp-desc">${exp.description}</p>

          ${dateChip}
          ${photoStripHtml}

          <div class="exp-tip-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
            <span><strong>Dica:</strong> ${exp.romanticTip}</span>
          </div>
        </div>

        <div class="exp-card-footer">
          <button class="btn-card-action btn-card-complete ${isDone ? "is-done" : ""}" onclick="window.app.toggleExperienceStatus(${exp.id})" title="${isDone ? "Desmarcar conclusão" : "Marcar como realizada"}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            ${isDone ? "Concluída" : "Concluir"}
          </button>

          <div style="display:flex; gap:0.4rem;">
            <button class="btn-icon" onclick="window.app.openScheduleModal(${exp.id})" title="Adicionar ao Calendário">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </button>

            <button class="btn-icon" onclick="window.app.openExperienceModal(${exp.id})" title="Editar / Adicionar fotos e observações">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  async toggleExperienceStatus(id) {
    const exp = await window.storyDB.getExperience(id);
    if (!exp) return;

    if (exp.status === "concluida") {
      exp.status = "pendente";
      exp.completedDate = null;
      await window.storyDB.saveExperience(exp);
      this.showToast(`Experiência #${exp.id} voltou para Pendente.`, "info");
    } else {
      exp.status = "concluida";
      if (!exp.completedDate) {
        exp.completedDate = new Date().toISOString().split("T")[0];
      }
      await window.storyDB.saveExperience(exp);
      this.triggerHeartConfetti();
      this.showToast(`Experiência #${exp.id} concluída com amor! ❤️`, "heart");
    }

    await this.refreshAll();
  }

  async quickMarkCompleted(id) {
    await this.toggleExperienceStatus(id);
  }

  /* ------------------- MODAL DE DETALHES / FOTOS / OBSERVAÇÕES ------------------- */
  bindModalEvents() {
    // Fechar modais ao clicar no X ou fora
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop || e.target.classList.contains("close-modal-btn")) {
          this.closeModal(backdrop.id);
        }
      });
    });

    // Salvar no Modal de Experiência
    const saveExpBtn = document.getElementById("save-experience-modal-btn");
    if (saveExpBtn) {
      saveExpBtn.addEventListener("click", () => this.saveActiveExperienceModal());
    }

    // Salvar no Modal de Agendamento
    const saveScheduleBtn = document.getElementById("save-schedule-modal-btn");
    if (saveScheduleBtn) {
      saveScheduleBtn.addEventListener("click", () => this.saveScheduleModal());
    }

    // Upload de Fotos no Modal da Experiência
    const fileInput = document.getElementById("exp-modal-photo-file");
    const previewContainer = document.getElementById("exp-modal-photos-preview");

    if (fileInput && previewContainer) {
      fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        for (const file of files) {
          try {
            const compressed = await window.memoryGallery.compressImage(file);
            this.tempModalPhotos.push(compressed);
            this.renderModalPhotoThumbs(previewContainer);
          } catch (err) {
            console.error("Erro na compressão de foto:", err);
            this.showToast("Erro ao processar imagem.", "alert");
          }
        }
      });
    }
  }

  renderModalPhotoThumbs(container) {
    container.innerHTML = "";
    this.tempModalPhotos.forEach((photoUrl, index) => {
      const wrap = document.createElement("div");
      wrap.style.position = "relative";
      wrap.style.display = "inline-block";
      wrap.innerHTML = `
        <img src="${photoUrl}" style="width:70px; height:70px; border-radius:8px; object-fit:cover; border:1px solid #ddd;">
        <span style="position:absolute; top:-5px; right:-5px; background:#DC2626; color:#fff; border-radius:50%; width:20px; height:20px; display:flex; align-items:center; justify-content:center; font-size:12px; cursor:pointer;" onclick="window.app.removeModalPhoto(${index})">×</span>
      `;
      container.appendChild(wrap);
    });
  }

  removeModalPhoto(index) {
    this.tempModalPhotos.splice(index, 1);
    const container = document.getElementById("exp-modal-photos-preview");
    if (container) this.renderModalPhotoThumbs(container);
  }

  async openExperienceModal(id) {
    this.activeExperienceId = id;
    const exp = await window.storyDB.getExperience(id);
    if (!exp) return;

    const titleEl = document.getElementById("exp-modal-title");
    const numEl = document.getElementById("exp-modal-number");
    const statusSelect = document.getElementById("exp-modal-status-select");
    const compDateInput = document.getElementById("exp-modal-completed-date");
    const notesInput = document.getElementById("exp-modal-notes");
    const funnyInput = document.getElementById("exp-modal-funny");
    const previewContainer = document.getElementById("exp-modal-photos-preview");
    const fileInput = document.getElementById("exp-modal-photo-file");

    if (titleEl) titleEl.textContent = exp.title;
    if (numEl) numEl.textContent = `#${String(exp.id).padStart(2, "0")} • ${exp.category}`;
    if (statusSelect) statusSelect.value = exp.status;
    if (compDateInput) compDateInput.value = exp.completedDate || "";
    if (notesInput) notesInput.value = exp.notes || "";
    if (funnyInput) funnyInput.value = exp.funnyMoments || "";
    if (fileInput) fileInput.value = "";

    // Carregar fotos existentes
    this.tempModalPhotos = (exp.photos || []).map(p => typeof p === "string" ? p : p.dataUrl);
    if (previewContainer) this.renderModalPhotoThumbs(previewContainer);

    this.openModal("experience-details-modal");
  }

  async saveActiveExperienceModal() {
    if (!this.activeExperienceId) return;
    const exp = await window.storyDB.getExperience(this.activeExperienceId);
    if (!exp) return;

    const statusSelect = document.getElementById("exp-modal-status-select");
    const compDateInput = document.getElementById("exp-modal-completed-date");
    const notesInput = document.getElementById("exp-modal-notes");
    const funnyInput = document.getElementById("exp-modal-funny");

    const prevStatus = exp.status;
    exp.status = statusSelect.value;
    exp.notes = notesInput.value.trim();
    exp.funnyMoments = funnyInput.value.trim();
    exp.photos = this.tempModalPhotos;

    if (exp.status === "concluida") {
      exp.completedDate = compDateInput.value || new Date().toISOString().split("T")[0];
    } else {
      exp.completedDate = compDateInput.value || null;
    }

    await window.storyDB.saveExperience(exp);

    if (prevStatus !== "concluida" && exp.status === "concluida") {
      this.triggerHeartConfetti();
    }

    this.closeModal("experience-details-modal");
    this.showToast(`Experiência #${exp.id} salva com sucesso! ❤️`, "check");
    await this.refreshAll();
  }

  /* ------------------- MODAL DE AGENDAMENTO ------------------- */
  openScheduleModal(experienceId = null, prefilledDate = "") {
    const selectEl = document.getElementById("schedule-experience-select");
    const dateInput = document.getElementById("schedule-date-input");
    const timeInput = document.getElementById("schedule-time-input");
    const locationInput = document.getElementById("schedule-location-input");
    const notesInput = document.getElementById("schedule-notes-input");

    if (selectEl) {
      selectEl.innerHTML = "";
      this.experiences.forEach(exp => {
        const isSelected = experienceId === exp.id ? "selected" : "";
        selectEl.innerHTML += `<option value="${exp.id}" ${isSelected}>#${exp.id} - ${exp.title}</option>`;
      });
      if (experienceId) selectEl.value = experienceId;
    }

    if (dateInput) {
      dateInput.value = prefilledDate || new Date().toISOString().split("T")[0];
    }
    if (timeInput) timeInput.value = "19:00";
    if (locationInput) locationInput.value = "";
    if (notesInput) notesInput.value = "";

    this.openModal("schedule-modal");
  }

  async saveScheduleModal() {
    const selectEl = document.getElementById("schedule-experience-select");
    const dateInput = document.getElementById("schedule-date-input");
    const timeInput = document.getElementById("schedule-time-input");
    const locationInput = document.getElementById("schedule-location-input");
    const notesInput = document.getElementById("schedule-notes-input");

    const expId = Number(selectEl.value);
    const date = dateInput.value;
    if (!date) {
      alert("Por favor, selecione uma data para o encontro.");
      return;
    }

    const exp = await window.storyDB.getExperience(expId);
    if (!exp) return;

    exp.status = "planejada";
    exp.scheduledDate = date;
    exp.scheduledTime = timeInput.value || null;
    exp.scheduledLocation = locationInput.value.trim() || "";
    if (notesInput.value.trim()) {
      exp.notes = (exp.notes ? exp.notes + "\n" : "") + notesInput.value.trim();
    }

    await window.storyDB.saveExperience(exp);

    this.closeModal("schedule-modal");
    this.showToast(`Date #${exp.id} agendado para ${this.formatDate(date)}! 📅`, "calendar");
    await this.refreshAll();
  }

  /* ------------------- CONFIRMAÇÃO DE AÇÃO ------------------- */
  confirmAction(title, message, onConfirmCallback) {
    const modal = document.getElementById("confirm-action-modal");
    const titleEl = document.getElementById("confirm-modal-title");
    const msgEl = document.getElementById("confirm-modal-message");
    const yesBtn = document.getElementById("confirm-modal-yes-btn");

    if (!modal) return;

    titleEl.textContent = title;
    msgEl.textContent = message;

    yesBtn.onclick = async () => {
      this.closeModal("confirm-action-modal");
      if (onConfirmCallback) await onConfirmCallback();
    };

    this.openModal("confirm-action-modal");
  }

  /* ------------------- HELPERS DE MODAL ------------------- */
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  /* ------------------- TOAST NOTIFICATIONS ------------------- */
  showToast(message, type = "heart") {
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast";

    let iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
    if (type === "calendar") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    } else if (type === "check") {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3600);
  }

  /* ------------------- EFEITO DE CORAÇÕES / CONFETES ------------------- */
  initConfettiCanvas() {
    this.canvas = document.getElementById("confetti-canvas");
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "confetti-canvas";
      this.canvas.className = "confetti-canvas";
      document.body.appendChild(this.canvas);
    }
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  triggerHeartConfetti() {
    if (!this.canvas || !this.ctx) return;
    this.resizeCanvas();

    const particles = [];
    const colors = ["#7A1A2E", "#99223B", "#B52B47", "#E99EAE", "#F4CAD3", "#C5A059", "#FFFFFF"];

    for (let i = 0; i < 48; i++) {
      particles.push({
        x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 300,
        y: window.innerHeight * 0.65 + (Math.random() - 0.5) * 100,
        size: Math.random() * 16 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 9,
        vy: -Math.random() * 12 - 5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1
      });
    }

    const drawHeart = (ctx, x, y, size, color, alpha, rotation) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = color;
      ctx.beginPath();
      const topCurveHeight = size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      // Top left curve
      ctx.bezierCurveTo(-size / 2, -topCurveHeight, -size, topCurveHeight / 2, 0, size);
      // Top right curve
      ctx.bezierCurveTo(size, topCurveHeight / 2, size / 2, -topCurveHeight, 0, topCurveHeight);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let animationFrame;
    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravidade
        p.rotation += p.vRot;
        p.alpha -= 0.015;

        if (p.alpha > 0) {
          alive = true;
          drawHeart(this.ctx, p.x, p.y, p.size, p.color, p.alpha, p.rotation);
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    };

    animate();
  }

  /* ------------------- ATUALIZAÇÃO GERAL ------------------- */
  async refreshAll() {
    this.experiences = await window.storyDB.getAllExperiences();
    this.settings = await window.storyDB.getSettings();
    this.updateStatsAndProgress();
    this.renderExperiencesList();
    this.renderHomeHighlights();
    await window.coupleCalendar.refresh();
    await window.memoryGallery.refresh();
    await window.storyTimeline.refresh();
    await window.romanticRoulette.refresh();
  }

  formatDate(isoString) {
    if (!isoString) return "";
    const parts = isoString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoString;
  }
}

// Instanciar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  window.app = new StoryApp();
  window.app.init();
});
