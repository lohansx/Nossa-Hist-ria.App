/**
 * NOSSA HISTÓRIA ❤️
 * Calendário do Casal (calendar.js)
 */

class CoupleCalendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = new Date();
    this.experiences = [];
    this.monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
  }

  async init() {
    await this.refresh();
    this.bindEvents();
  }

  async refresh() {
    this.experiences = await window.storyDB.getAllExperiences();
    this.render();
  }

  bindEvents() {
    const prevBtn = document.getElementById("cal-prev-month");
    const nextBtn = document.getElementById("cal-next-month");
    const todayBtn = document.getElementById("cal-today-btn");

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.render();
      });
    }
  }

  render() {
    const monthTitle = document.getElementById("cal-month-title");
    const daysGrid = document.getElementById("cal-days-grid");
    if (!monthTitle || !daysGrid) return;

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    monthTitle.textContent = `${this.monthNames[month]} de ${year}`;
    daysGrid.innerHTML = "";

    // Primeiro dia do mês e total de dias
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Dias do mês anterior para preencher a primeira semana
    const prevMonthDays = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

    // 1. Células do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell other-month";
      cell.innerHTML = `<span class="day-number">${dayNum}</span>`;
      daysGrid.appendChild(cell);
    }

    // 2. Células do mês atual
    for (let day = 1; day <= totalDays; day++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day-cell";

      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      if (isCurrentMonth && today.getDate() === day) {
        cell.classList.add("is-today");
      }

      // Buscar experiências agendadas ou concluídas nesta data
      const dayEvents = this.experiences.filter(exp => {
        return (exp.status === "planejada" && exp.scheduledDate === dateStr) ||
               (exp.status === "concluida" && exp.completedDate === dateStr);
      });

      let indicatorsHtml = "";
      if (dayEvents.length > 0) {
        indicatorsHtml = `<div class="day-events-indicators">`;
        dayEvents.slice(0, 2).forEach(ev => {
          const isDone = ev.status === "concluida";
          const icon = isDone ? "❤️" : "⏳";
          const cls = isDone ? "done" : "planned";
          indicatorsHtml += `
            <div class="calendar-event-pill ${cls}" title="#${ev.id} - ${ev.title}">
              <span>${icon}</span>
              <span>#${ev.id} ${ev.title.substring(0, 14)}...</span>
            </div>
          `;
        });
        if (dayEvents.length > 2) {
          indicatorsHtml += `<span style="font-size:0.65rem; color:var(--wine-700); font-weight:700;">+${dayEvents.length - 2} mais</span>`;
        }
        indicatorsHtml += `</div>`;
      }

      cell.innerHTML = `
        <span class="day-number">${day}</span>
        ${indicatorsHtml}
      `;

      cell.addEventListener("click", () => {
        this.openDayModal(dateStr, dayEvents, day, this.monthNames[month], year);
      });

      daysGrid.appendChild(cell);
    }
  }

  openDayModal(dateStr, dayEvents, day, monthName, year) {
    const modal = document.getElementById("day-details-modal");
    const titleEl = document.getElementById("day-modal-title");
    const contentEl = document.getElementById("day-modal-events-list");
    const scheduleBtn = document.getElementById("day-modal-schedule-btn");

    if (!modal) return;

    titleEl.textContent = `${day} de ${monthName} de ${year}`;
    contentEl.innerHTML = "";

    if (dayEvents.length === 0) {
      contentEl.innerHTML = `
        <div class="empty-state" style="padding:1.5rem 1rem; border:none;">
          <div class="empty-state-icon" style="width:48px; height:48px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18"/></svg>
          </div>
          <p style="font-weight:600; color:var(--wine-900); margin-top:0.3rem;">Nenhum encontro marcado neste dia.</p>
          <p style="font-size:0.84rem; color:var(--gray-600);">Que tal escolher uma das 25 experiências para viverem juntos nesta data?</p>
        </div>
      `;
    } else {
      dayEvents.forEach(ev => {
        const isDone = ev.status === "concluida";
        const item = document.createElement("div");
        item.className = "panel-card";
        item.style.padding = "0.9rem";
        item.style.marginBottom = "0.75rem";
        item.style.borderLeft = isDone ? "4px solid var(--wine-700)" : "4px solid var(--gold-500)";

        item.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.3rem;">
            <span style="font-size:0.75rem; font-weight:700; color:var(--wine-700);">#${ev.id} - ${ev.category}</span>
            <span class="exp-status-badge ${ev.status}">${ev.status}</span>
          </div>
          <h4 style="font-size:1.02rem; color:var(--wine-900); margin-bottom:0.3rem;">${ev.title}</h4>
          ${ev.scheduledTime ? `<p style="font-size:0.82rem; color:var(--gray-600);">⏰ Horário: <strong>${ev.scheduledTime}</strong></p>` : ""}
          ${ev.scheduledLocation ? `<p style="font-size:0.82rem; color:var(--gray-600);">📍 Local: <strong>${ev.scheduledLocation}</strong></p>` : ""}
          ${ev.notes ? `<p style="font-size:0.82rem; color:var(--dark-700); margin-top:0.3rem; font-style:italic;">"${ev.notes}"</p>` : ""}
          <div style="display:flex; gap:0.5rem; margin-top:0.6rem;">
            <button class="btn-subtle" onclick="window.app.openExperienceModal(${ev.id})">
              Ver Detalhes / Fotos
            </button>
            ${!isDone ? `
              <button class="btn-primary" style="padding:0.4rem 0.8rem; font-size:0.82rem;" onclick="window.app.quickMarkCompleted(${ev.id})">
                Marcar como Concluída ❤️
              </button>
            ` : ""}
          </div>
        `;
        contentEl.appendChild(item);
      });
    }

    scheduleBtn.onclick = () => {
      window.app.closeModal("day-details-modal");
      window.app.openScheduleModal(null, dateStr);
    };

    window.app.openModal("day-details-modal");
  }

  // Exportar evento para iCalendar (.ics) para adicionar na agenda do celular
  exportToIcs(exp) {
    if (!exp.scheduledDate) return;
    const dateFormatted = exp.scheduledDate.replace(/-/g, "");
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nossa Historia//Agenda de Casal//PT
BEGIN:VEVENT
SUMMARY:Date: ${exp.title}
DESCRIPTION:Experiência #${exp.id} - Nossa História: ${exp.description}\\n${exp.notes || ""}
DTSTART;VALUE=DATE:${dateFormatted}
DTEND;VALUE=DATE:${dateFormatted}
LOCATION:${exp.scheduledLocation || "Com meu amor"}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `date-${exp.id}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

window.coupleCalendar = new CoupleCalendar();
