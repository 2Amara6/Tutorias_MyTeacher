function getColombiaGreeting() {
  const hour = Number(new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    hour12: false,
    timeZone: "America/Bogota",
  }).format(new Date()));
  if (hour < 12) return "Buenos dias";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

let currentAppointments = [];
let currentRescheduleAppointment = null;

function isTodayInColombia(dateValue) {
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" });
  return formatter.format(new Date(dateValue)) === formatter.format(new Date());
}

function renderStudentSession() {
  const user = getStoredUser();
  const displayName = getUserDisplayName(user);

  const greeting = document.getElementById("greeting");
  const sidebarName = document.getElementById("sidebar-user-name");
  const sidebarRole = document.getElementById("sidebar-user-role");
  const sidebarImage = document.getElementById("sidebar-user-image");
  const nameInput = document.getElementById("settings-full-name");
  const emailInput = document.getElementById("settings-email");
  const goalLabel = document.getElementById("goal-label");
  const goalBar = document.getElementById("goal-bar");

  if (greeting) greeting.textContent = `${getColombiaGreeting()}, ${displayName}`;
  if (sidebarName) sidebarName.textContent = displayName;
  if (sidebarRole) sidebarRole.textContent = user.role === "STUDENT" ? "Estudiante" : "Usuario";
  if (sidebarImage) sidebarImage.src = getUserProfileImage(user);
  if (nameInput) nameInput.value = displayName;
  if (emailInput) emailInput.value = user.email || "";
  if (goalLabel) goalLabel.textContent = "0 / 20 hrs";
  if (goalBar) goalBar.style.width = "0%";
}

function toggleNotifications() {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  panel.classList.toggle("open");
  const dot = document.getElementById("notif-dot");
  if (dot) dot.style.display = "none";
}

function markAllRead() {
  const panel = document.getElementById("notif-panel");
  if (panel) panel.classList.remove("open");
  const dot = document.getElementById("notif-dot");
  if (dot) dot.style.display = "none";
  showToast("Todas las notificaciones marcadas como leidas", "done_all");
}

document.addEventListener("click", function (e) {
  const panel = document.getElementById("notif-panel");
  if (!panel) return;
  if (
    !e.target.closest("#notif-panel") &&
    !e.target.closest('button[onclick="toggleNotifications()"]')
  ) {
    panel.classList.remove("open");
  }
});

const navItems = ["dashboard", "find", "lessons", "messages", "payments"];
function navigate(item) {
  if (item === "find") {
    window.location.href = "tutor_home.html";
    return;
  }
  if (item === "messages") {
    window.location.href = "mensajes.html?mode=student";
    return;
  }
  navItems.forEach((n) => {
    const el = document.getElementById("nav-" + n);
    if (!el) return;
    if (n === item) {
      el.className =
        "flex items-center gap-3 px-3 py-2.5 rounded-lg sidebar-item-active transition-colors cursor-pointer";
    } else {
      el.className =
        "flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400 cursor-pointer";
    }
  });
  if (item === "payments") showToast("Pagos: $0 COP pendientes", "payments");
  if (item === "lessons") showToast("Abriendo tus clases", "book_4");
  if (item === "dashboard") showToast("Bienvenido a tu panel", "dashboard");
}

function focusSearch() {
  document.getElementById("main-search")?.focus();
}

function handleMainSearch(e) {
  const q = e.target.value.toLowerCase();
  const matches = document.getElementById("smart-matches");
  if (!matches) return;
  const cards = matches.querySelectorAll(".group");
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? "flex" : "none";
  });
}

function joinCall() {
  showToast("Conectando a la videollamada...", "video_call");
  setTimeout(() => showToast("Sesion de videollamada iniciada", "videocam"), 2000);
}

function openReschedule(appointmentId) {
  currentRescheduleAppointment = currentAppointments.find(app => app.id === appointmentId) || null;
  const title = document.getElementById("reschedule-session-title");
  const current = document.getElementById("reschedule-session-current");
  if (currentRescheduleAppointment) {
    const tutorName = `${currentRescheduleAppointment.tutor?.user?.firstName || "Tutor"} ${currentRescheduleAppointment.tutor?.user?.lastName || ""}`.trim();
    const subject = currentRescheduleAppointment.tutor?.subjects || "Tutoria";
    if (title) title.textContent = `${subject} con ${tutorName}`;
    if (current) current.textContent = `Actual: ${formatAppointmentDate(currentRescheduleAppointment.date)}`;
  } else {
    if (title) title.textContent = "Sesion seleccionada";
    if (current) current.textContent = "Selecciona una nueva fecha y hora.";
  }
  document.getElementById("reschedule-modal")?.classList.add("active");
}

function closeReschedule() {
  document.getElementById("reschedule-modal")?.classList.remove("active");
}

function confirmReschedule() {
  const date = document.getElementById("reschedule-date")?.value;
  const time = document.getElementById("reschedule-time")?.value;
  if (!date) {
    showToast("Por favor, selecciona una nueva fecha", "calendar_today");
    return;
  }
  closeReschedule();
  showToast(`Sesion reprogramada para ${date} a las ${time}`, "event_available");
}

function viewDirections() {
  window.open("https://maps.google.com?q=Barranquilla", "_blank");
  showToast("Abriendo Google Maps...", "directions");
}

function messageDoctor() {
  window.location.href = "mensajes.html?mode=student";
}

function openSettings() {
  renderStudentSession();
  document.getElementById("settings-modal")?.classList.add("active");
}

function closeSettings() {
  document.getElementById("settings-modal")?.classList.remove("active");
}

function saveSettings() {
  closeSettings();
  showToast("Configuracion guardada", "check_circle");
}

function toggleNotifPref() {
  showToast("Preferencia de notificacion actualizada", "notifications");
}

function formatAppointmentDate(dateValue) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(dateValue));
}

async function loadAppointments() {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  renderStudentSession();
  if (!token) {
    window.location.href = "tutor_home.html";
    return;
  }
  if (user.role !== "STUDENT") {
    window.location.href = getUserHome(user);
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/appointments", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const appointments = await res.json();
    currentAppointments = Array.isArray(appointments) ? appointments : [];
    const list = document.getElementById("appointments-list");
    if (!list) return;

    const pendingApps = currentAppointments.filter(a => a.status === "PENDING" || a.status === "CONFIRMED");
    const todayCount = pendingApps.filter(a => isTodayInColombia(a.date)).length;
    const todayEl = document.getElementById("today-sessions-count");
    if (todayEl) todayEl.textContent = `${todayCount} sesion${todayCount === 1 ? "" : "es"}`;
    const totalLessons = document.getElementById("total-lessons");
    if (totalLessons) totalLessons.textContent = String(currentAppointments.length);

    if (!pendingApps.length) {
      list.innerHTML = `
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold">Proximas Sesiones</h3>
        </div>
        <p class="text-slate-500">No tienes citas programadas.</p>`;
      return;
    }

    list.innerHTML = `
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold">Proximas Sesiones (${pendingApps.length})</h3>
      </div>
      ${pendingApps.map(a => {
        const tutorName = `${a.tutor?.user?.firstName || "Tutor"} ${a.tutor?.user?.lastName || ""}`.trim();
        const subject = a.tutor?.subjects || "Tutoria";
        return `
          <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
            <div class="flex-1 space-y-4">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <div class="size-14 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-bold text-primary uppercase">
                    ${tutorName.split(/\s+/).slice(0, 2).map(part => part[0]).join("")}
                  </div>
                  <div>
                    <p class="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">${subject}</p>
                    <h4 class="text-lg font-bold">${tutorName}</h4>
                    <div class="flex items-center gap-2 text-slate-500 text-sm">
                      <span class="material-symbols-outlined text-[18px]">calendar_today</span>
                      <span>${formatAppointmentDate(a.date)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="flex gap-3">
                <button onclick="window.open('https://meet.google.com/landing', '_blank')" class="flex-1 md:flex-none bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                  <span class="material-symbols-outlined text-[20px]">video_call</span> Unirse
                </button>
                <button onclick="openReschedule('${a.id}')" class="flex-1 md:flex-none px-6 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Reprogramar
                </button>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    `;
  } catch (err) {
    console.error(err);
    showToast("Error cargando tus sesiones", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderStudentSession();
  loadAppointments();
  document.getElementById("settings-modal")?.addEventListener("click", function (e) {
    if (e.target === this) closeSettings();
  });
  document.getElementById("reschedule-modal")?.addEventListener("click", function (e) {
    if (e.target === this) closeReschedule();
  });
});
