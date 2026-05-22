/**
 * utils.js - Funciones compartidas (Modo oscuro, Toasts, etc.)
 */

// --- MODO OSCURO ---
function toggleDarkMode() {
    const html = document.documentElement;
    const icon = document.getElementById("dark-icon");
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        if (icon) icon.textContent = 'dark_mode';
        localStorage.setItem('theme', 'light');
    } else {
        html.classList.add('dark');
        if (icon) icon.textContent = 'light_mode';
        localStorage.setItem('theme', 'dark');
    }
}

// Inicializar el modo oscuro al cargar
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem("theme") === "dark") {
        document.documentElement.classList.add("dark");
        const icon = document.getElementById("dark-icon");
        if (icon) icon.textContent = "light_mode";
    }
});

// --- TOAST NOTIFICATIONS ---
let toastTimer;
function showToast(msg, icon = "check_circle") {
    clearTimeout(toastTimer);
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    const msgEl = document.getElementById("toast-msg");
    const iconEl = document.getElementById("toast-icon");
    
    if (msgEl) msgEl.textContent = msg;
    if (iconEl) iconEl.textContent = icon;
    
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

// --- SESSION HELPERS ---
const DEFAULT_PROFILE_IMAGE = "https://ui-avatars.com/api/?name=TutorMaster&background=137fec&color=fff";

function getStoredUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "{}");
    } catch (error) {
        return {};
    }
}

function getUserDisplayName(user = getStoredUser()) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email || "Usuario";
}

function getUserInitials(user = getStoredUser()) {
    const source = getUserDisplayName(user);
    return source
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join("") || "TM";
}

function getUserProfileImage(user = getStoredUser()) {
    const name = encodeURIComponent(getUserDisplayName(user));
    return user.profileImage || `https://ui-avatars.com/api/?name=${name}&background=137fec&color=fff`;
}

function getUserHome(user = getStoredUser()) {
    return user.role === "TUTOR" ? "tutor_management_availability.html" : "perfil_estudiante.html";
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "tutor_home.html";
}

function escapeHTML(value = "") {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
