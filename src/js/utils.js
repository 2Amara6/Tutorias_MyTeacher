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
