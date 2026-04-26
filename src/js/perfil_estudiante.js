// Funciones de modo oscuro y toast movidas a utils.js

// Greeting
const hour = new Date().getHours();
const saludo =
  hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";
document.getElementById("greeting").textContent =
  `${saludo}, Andres Castilla! 👋`;

// Notifications
function toggleNotifications() {
  const panel = document.getElementById("notif-panel");
  panel.classList.toggle("open");
  document.getElementById("notif-dot").style.display = "none";
  document.getElementById("notif-dot").style.display = "none";
}
function markAllRead() {
  document.getElementById("notif-panel").classList.remove("open");
  document.getElementById("notif-dot").style.display = "none";
  showToast("Todas las notificaciones marcadas como leídas", "done_all");
}
document.addEventListener("click", function (e) {
  const panel = document.getElementById("notif-panel");
  if (
    !e.target.closest("#notif-panel") &&
    !e.target.closest('button[onclick="toggleNotifications()"]')
  ) {
    panel.classList.remove("open");
  }
});

// Navigation
const navItems = ["dashboard", "find", "lessons", "messages", "payments"];
function navigate(item) {
  if (item === "find") {
    window.location.href = "tutor_home.html";
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
  if (item === "messages") {
    document.getElementById("msg-badge").style.display = "none";
    showToast("¡Mensajes abiertos!", "chat");
  }
  if (item === "payments") showToast("Payments: $0 COP pending", "payments");
  if (item === "lessons")
    showToast("Mis clases: 18 sesiones completadas", "book_4");
  if (item === "dashboard") showToast("¡Bienvenido a tu panel!", "dashboard");
}

// Search
function focusSearch() {
  document.getElementById("main-search").focus();
}

function handleMainSearch(e) {
  const q = e.target.value.toLowerCase();
  const matches = document.getElementById("smart-matches");
  if (!matches) return;
  const cards = matches.querySelectorAll(".group");
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    if (text.includes(q)) {
      card.style.display = "flex";
    } else {
      card.style.display = "none";
    }
  });
}

// Join Call
function joinCall() {
  showToast("Conectando a la videollamada... Por favor espera.", "video_call");
  setTimeout(
    () => showToast("¡Sesión de videollamada iniciada!", "videocam"),
    2000,
  );
}

// Reschedule Modal
function openReschedule() {
  document.getElementById("reschedule-modal").classList.add("active");
}
function closeReschedule() {
  document.getElementById("reschedule-modal").classList.remove("active");
}
document
  .getElementById("reschedule-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeReschedule();
  });
function confirmReschedule() {
  const date = document.getElementById("reschedule-date").value;
  const time = document.getElementById("reschedule-time").value;
  if (!date) {
    showToast("Por favor, selecciona una nueva fecha", "calendar_today");
    return;
  }
  closeReschedule();
  showToast(`Sesión reprogramada para ${date} at ${time}!`, "event_available");
}

// Directions
function viewDirections() {
  window.open("https://maps.google.com?q=University+Campus+Library", "_blank");
  showToast("Abriendo Google Maps...", "directions");
}

// Message Dr. Chen
function messageDoctor() {
  showToast("Abriendo chat con el Dr. Michael Chen...", "chat");
}

// Settings Modal
function openSettings() {
  document.getElementById("settings-modal").classList.add("active");
}
function closeSettings() {
  document.getElementById("settings-modal").classList.remove("active");
}
document
  .getElementById("settings-modal")
  .addEventListener("click", function (e) {
    if (e.target === this) closeSettings();
  });
function saveSettings() {
  closeSettings();
  showToast("¡Configuración guardada con éxito!", "check_circle");
}
function toggleNotifPref(btn) {
  showToast("Preferencia de notificación actualizada", "notifications");
}
