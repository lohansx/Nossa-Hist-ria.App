/**
 * NOSSA HISTÓRIA ❤️
 * Mural de Memórias e Álbum de Fotos (gallery.js)
 */

class MemoryGallery {
  constructor() {
    this.memories = [];
    this.experiences = [];
    this.currentLightboxImages = [];
    this.currentLightboxIndex = 0;
  }

  async init() {
    await this.refresh();
    this.bindEvents();
  }

  async refresh() {
    this.memories = await window.storyDB.getAllMemories();
    this.experiences = await window.storyDB.getAllExperiences();
    this.render();
  }

  bindEvents() {
    const addMemoryBtn = document.getElementById("open-add-memory-btn");
    if (addMemoryBtn) {
      addMemoryBtn.addEventListener("click", () => {
        this.openAddMemoryModal();
      });
    }

    // Lightbox fechar ao clicar fora ou na tecla ESC
    const lightbox = document.getElementById("lightbox-modal");
    if (lightbox) {
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-close")) {
          this.closeLightbox();
        }
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeLightbox();
      }
    });
  }

  render() {
    const grid = document.getElementById("memories-grid");
    const countBadge = document.getElementById("memories-count-badge");
    if (!grid) return;

    // Reunir memórias avulsas e fotos das experiências concluídas
    const allCards = [];

    // 1. Memórias cadastradas no mural
    this.memories.forEach(mem => {
      allCards.push({
        type: "memory",
        id: mem.id,
        title: mem.title,
        date: mem.date,
        description: mem.description,
        funnyMoments: mem.funnyMoments,
        rating: mem.rating || 5,
        photos: mem.photos || [],
        experienceId: mem.experienceId,
        rawDate: new Date(mem.date || 0)
      });
    });

    // 2. Experiências concluídas com fotos
    this.experiences.forEach(exp => {
      if (exp.photos && exp.photos.length > 0) {
        allCards.push({
          type: "experience",
          id: exp.id,
          title: `#${exp.id} - ${exp.title}`,
          date: exp.completedDate || exp.scheduledDate,
          description: exp.notes || exp.description,
          funnyMoments: exp.funnyMoments,
          rating: exp.rating || 5,
          photos: exp.photos.map(p => typeof p === "string" ? p : p.dataUrl),
          experienceId: exp.id,
          rawDate: new Date(exp.completedDate || exp.scheduledDate || 0)
        });
      }
    });

    // Ordenar das mais recentes para as mais antigas
    allCards.sort((a, b) => b.rawDate - a.rawDate);

    if (countBadge) {
      countBadge.textContent = `${allCards.length} ${allCards.length === 1 ? "registro" : "registros"}`;
    }

    grid.innerHTML = "";

    if (allCards.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
          <h3 class="empty-state-title">Nosso álbum está esperando a primeira foto</h3>
          <p class="empty-state-text">Conclua uma das 25 experiências ou adicione uma memória especial para começar a preencher nosso mural de momentos.</p>
          <button class="btn-primary" onclick="window.memoryGallery.openAddMemoryModal()" style="margin-top:0.5rem;">
            Adicionar Primeira Memória ❤️
          </button>
        </div>
      `;
      return;
    }

    allCards.forEach(item => {
      const card = document.createElement("div");
      card.className = "memory-polaroid-card";

      const firstPhoto = item.photos[0] || "";
      const dateFormatted = item.date ? this.formatDate(item.date) : "Data especial";

      // Corações de nota
      let heartsHtml = "";
      for (let i = 1; i <= 5; i++) {
        heartsHtml += `<span style="color:${i <= item.rating ? "var(--wine-600)" : "var(--gray-200)"}; font-size:0.95rem;">❤️</span>`;
      }

      card.innerHTML = `
        ${firstPhoto ? `
          <div class="memory-image-container">
            <img src="${firstPhoto}" class="memory-image" alt="${item.title}" onclick="window.memoryGallery.openLightbox('${firstPhoto}', '${item.title}')">
            <span class="memory-date-tag">${dateFormatted}</span>
            ${item.photos.length > 1 ? `<span style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.65); color:#fff; font-size:0.7rem; padding:2px 6px; border-radius:10px; font-weight:700;">+${item.photos.length - 1} fotos</span>` : ""}
          </div>
        ` : `
          <div style="background:var(--blush-100); border-radius:var(--radius-md); padding:1rem; text-align:center;">
            <span style="font-size:2rem;">💌</span>
            <div style="font-size:0.75rem; color:var(--wine-700); font-weight:700; margin-top:0.3rem;">${dateFormatted}</div>
          </div>
        `}

        <div class="memory-info">
          <div style="display:flex; justify-content:space-between; align-items:flex-start;">
            <h4 class="memory-title">${item.title}</h4>
            <div style="display:flex;">${heartsHtml}</div>
          </div>

          ${item.description ? `<p class="memory-story">${item.description}</p>` : ""}

          ${item.funnyMoments ? `
            <div class="memory-funny-quote">
              <strong style="color:var(--wine-800);">Momento marcante:</strong> "${item.funnyMoments}"
            </div>
          ` : ""}

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.4rem; padding-top:0.6rem; border-top:1px solid var(--gray-100);">
            ${item.experienceId ? `
              <span class="memory-linked-badge" onclick="window.app.openExperienceModal(${item.experienceId})" style="cursor:pointer;" title="Ver desafio #${item.experienceId}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                Experiência #${item.experienceId}
              </span>
            ` : `<span></span>`}

            ${item.type === "memory" ? `
              <button class="btn-icon" style="width:28px; height:28px; color:#DC2626;" onclick="window.memoryGallery.confirmDeleteMemory('${item.id}')" title="Excluir memória">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            ` : `
              <button class="btn-subtle" style="padding:0.25rem 0.6rem; font-size:0.75rem;" onclick="window.app.openExperienceModal(${item.id})">
                Ver na Agenda
              </button>
            `}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  openAddMemoryModal() {
    const modal = document.getElementById("add-memory-modal");
    const expSelect = document.getElementById("mem-experience-select");
    const titleInput = document.getElementById("mem-title-input");
    const dateInput = document.getElementById("mem-date-input");
    const descInput = document.getElementById("mem-desc-input");
    const funnyInput = document.getElementById("mem-funny-input");
    const photoContainer = document.getElementById("mem-photo-preview-container");
    const fileInput = document.getElementById("mem-file-input");

    if (!modal) return;

    // Preencher select com as 25 experiências
    if (expSelect) {
      expSelect.innerHTML = `<option value="">Nenhuma (Momento Livre)</option>`;
      this.experiences.forEach(exp => {
        expSelect.innerHTML += `<option value="${exp.id}">#${exp.id} - ${exp.title}</option>`;
      });
    }

    // Resetar campos
    if (titleInput) titleInput.value = "";
    if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
    if (descInput) descInput.value = "";
    if (funnyInput) funnyInput.value = "";
    if (photoContainer) photoContainer.innerHTML = "";
    if (fileInput) fileInput.value = "";

    this.tempPhotos = [];

    // Configurar upload
    this.setupPhotoUploadListener(fileInput, photoContainer);

    window.app.openModal("add-memory-modal");
  }

  setupPhotoUploadListener(fileInput, container) {
    if (!fileInput) return;

    fileInput.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      for (const file of files) {
        try {
          const compressedDataUrl = await this.compressImage(file);
          this.tempPhotos.push(compressedDataUrl);

          const thumb = document.createElement("div");
          thumb.style.position = "relative";
          thumb.style.display = "inline-block";
          thumb.innerHTML = `
            <img src="${compressedDataUrl}" style="width:65px; height:65px; border-radius:8px; object-fit:cover; border:1px solid #ddd;">
            <span style="position:absolute; top:-5px; right:-5px; background:#DC2626; color:#fff; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; font-size:11px; cursor:pointer;" onclick="this.parentElement.remove(); window.memoryGallery.removeTempPhoto('${compressedDataUrl}')">×</span>
          `;
          container.appendChild(thumb);
        } catch (err) {
          console.error("Erro ao processar imagem:", err);
          window.app.showToast("Erro ao processar foto.", "alert");
        }
      }
    };
  }

  removeTempPhoto(dataUrl) {
    this.tempPhotos = this.tempPhotos.filter(p => p !== dataUrl);
  }

  async saveNewMemory() {
    const expSelect = document.getElementById("mem-experience-select");
    const titleInput = document.getElementById("mem-title-input");
    const dateInput = document.getElementById("mem-date-input");
    const descInput = document.getElementById("mem-desc-input");
    const funnyInput = document.getElementById("mem-funny-input");

    const title = titleInput.value.trim() || "Nosso Momento Especial";
    const date = dateInput.value || new Date().toISOString().split("T")[0];
    const experienceId = expSelect.value ? Number(expSelect.value) : null;
    const description = descInput.value.trim();
    const funnyMoments = funnyInput.value.trim();

    const newMemory = {
      title,
      date,
      experienceId,
      description,
      funnyMoments,
      rating: 5,
      photos: this.tempPhotos || []
    };

    await window.storyDB.saveMemory(newMemory);

    // Se estiver vinculada a uma experiência que ainda não foi concluída, perguntar ou atualizar
    if (experienceId) {
      const exp = await window.storyDB.getExperience(experienceId);
      if (exp && exp.status !== "concluida") {
        exp.status = "concluida";
        exp.completedDate = date;
        if (description) exp.notes = (exp.notes ? exp.notes + "\n" : "") + description;
        if (this.tempPhotos && this.tempPhotos.length > 0) {
          exp.photos = [...(exp.photos || []), ...this.tempPhotos];
        }
        await window.storyDB.saveExperience(exp);
      }
    }

    window.app.closeModal("add-memory-modal");
    window.app.showToast("Memória guardada com amor! ❤️", "heart");
    await this.refresh();
    await window.app.refreshAll();
  }

  async confirmDeleteMemory(id) {
    window.app.confirmAction(
      "Deseja excluir esta memória?",
      "Esta foto e relato serão removidos do mural.",
      async () => {
        await window.storyDB.deleteMemory(id);
        window.app.showToast("Memória excluída.", "trash");
        await this.refresh();
      }
    );
  }

  /* ------------------- COMPRESSÃO CLIENT-SIDE DE IMAGENS ------------------- */
  compressImage(file, maxDimension = 1400, quality = 0.82) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /* ------------------- LIGHTBOX ------------------- */
  openLightbox(imgSrc, title = "") {
    const lightbox = document.getElementById("lightbox-modal");
    const imgEl = document.getElementById("lightbox-img");
    const captionEl = document.getElementById("lightbox-caption");

    if (!lightbox || !imgEl) return;

    imgEl.src = imgSrc;
    if (captionEl) captionEl.textContent = title;
    lightbox.classList.add("active");
  }

  closeLightbox() {
    const lightbox = document.getElementById("lightbox-modal");
    if (lightbox) {
      lightbox.classList.remove("active");
    }
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

window.memoryGallery = new MemoryGallery();
