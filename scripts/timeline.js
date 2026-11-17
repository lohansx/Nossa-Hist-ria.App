/**
 * NOSSA HISTÓRIA ❤️
 * Linha do Tempo Cronológica (timeline.js)
 */

class StoryTimeline {
  constructor() {
    this.experiences = [];
  }

  async init() {
    await this.refresh();
  }

  async refresh() {
    this.experiences = await window.storyDB.getAllExperiences();
    this.render();
  }

  render() {
    const stream = document.getElementById("timeline-stream");
    const countBadge = document.getElementById("timeline-count-badge");
    if (!stream) return;

    // Filtrar apenas as CONCLUÍDAS que possuem data de conclusão ou atualização
    const completed = this.experiences.filter(exp => exp.status === "concluida");

    // Ordenar por completedDate (mais recente primeiro)
    completed.sort((a, b) => {
      const dateA = new Date(a.completedDate || a.updatedAt || 0);
      const dateB = new Date(b.completedDate || b.updatedAt || 0);
      return dateB - dateA;
    });

    if (countBadge) {
      countBadge.textContent = `${completed.length} ${completed.length === 1 ? "momento vivido" : "momentos vividos"}`;
    }

    stream.innerHTML = "";

    if (completed.length === 0) {
      stream.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
          </div>
          <h3 class="empty-state-title">Nossa linha do tempo está em branco</h3>
          <p class="empty-state-text">Quando vocês marcarem a primeira experiência como concluída, ela aparecerá aqui em ordem cronológica com fotos e memórias.</p>
          <button class="btn-primary" onclick="window.app.navigate('experiences')" style="margin-top:0.5rem;">
            Ver Lista de Experiências ❤️
          </button>
        </div>
      `;
      return;
    }

    completed.forEach(exp => {
      const item = document.createElement("div");
      item.className = "timeline-item";

      const dateStr = exp.completedDate ? this.formatFullDate(exp.completedDate) : "Data não informada";
      const timeAgo = exp.completedDate ? this.getTimeAgo(exp.completedDate) : "";

      const firstPhoto = (exp.photos && exp.photos.length > 0)
        ? (typeof exp.photos[0] === "string" ? exp.photos[0] : exp.photos[0].dataUrl)
        : "";

      item.innerHTML = `
        <div class="timeline-dot"></div>
        <div class="timeline-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
            <span style="font-size:0.75rem; font-weight:800; color:var(--wine-700); text-transform:uppercase;">
              Experiência #${exp.id} • ${exp.category}
            </span>
            <span style="font-size:0.75rem; color:var(--gray-600); font-weight:600;">${timeAgo}</span>
          </div>

          <h3 style="font-size:1.2rem; color:var(--wine-900); margin-bottom:0.35rem;">${exp.title}</h3>

          <div style="display:inline-flex; align-items:center; gap:0.4rem; font-size:0.8rem; color:var(--wine-800); background:var(--blush-100); padding:2px 8px; border-radius:12px; margin-bottom:0.6rem;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${dateStr}
          </div>

          ${firstPhoto ? `
            <div style="margin:0.6rem 0; border-radius:12px; overflow:hidden; max-height:260px;">
              <img src="${firstPhoto}" style="width:100%; height:100%; object-fit:cover; cursor:pointer;" onclick="window.memoryGallery.openLightbox('${firstPhoto}', '${exp.title}')">
            </div>
          ` : ""}

          ${exp.notes ? `
            <p style="font-size:0.9rem; color:var(--dark-700); line-height:1.55; margin-top:0.4rem; font-style:italic;">
              "${exp.notes}"
            </p>
          ` : ""}

          ${exp.funnyMoments ? `
            <div class="exp-tip-box" style="margin-top:0.5rem; font-size:0.82rem;">
              <strong style="color:var(--wine-800);">Momento especial:</strong> ${exp.funnyMoments}
            </div>
          ` : ""}

          <div style="margin-top:0.8rem; display:flex; justify-content:flex-end;">
            <button class="btn-subtle" onclick="window.app.openExperienceModal(${exp.id})" style="font-size:0.78rem; padding:0.3rem 0.75rem;">
              Editar Relato / Adicionar Fotos
            </button>
          </div>
        </div>
      `;

      stream.appendChild(item);
    });
  }

  formatFullDate(isoString) {
    if (!isoString) return "";
    const parts = isoString.split("-");
    if (parts.length === 3) {
      const year = parts[0];
      const month = Number(parts[1]) - 1;
      const day = parts[2];
      const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
      ];
      return `${day} de ${months[month]} de ${year}`;
    }
    return isoString;
  }

  getTimeAgo(isoString) {
    const then = new Date(isoString);
    const now = new Date();
    const diffMs = now - then;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return "Hoje ❤️";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `Há ${weeks} ${weeks === 1 ? "semana" : "semanas"}`;
    }
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Há ${months} ${months === 1 ? "mês" : "meses"}`;
    }
    const years = Math.floor(diffDays / 365);
    return `Há ${years} ${years === 1 ? "ano" : "anos"}`;
  }
}

window.storyTimeline = new StoryTimeline();
