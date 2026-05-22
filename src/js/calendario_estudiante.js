let scheduledClasses = [];

const formatCOP = (value = 0) => `$${Number(value || 0).toLocaleString("es-CO")} COP`;

function getInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join("") || "TM";
}

function getClassDateParts(dateValue, durationMinutes = 60) {
    const start = new Date(dateValue);
    const end = new Date(start.getTime() + Number(durationMinutes || 60) * 60000);
    const day = new Intl.DateTimeFormat("es-CO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: "America/Bogota",
    }).format(start);
    const startTime = new Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
    }).format(start);
    const endTime = new Intl.DateTimeFormat("es-CO", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/Bogota",
    }).format(end);
    const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());
    const classDay = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(start);

    return {
        day: day.charAt(0).toUpperCase() + day.slice(1),
        range: `${startTime} - ${endTime}`,
        isToday: today === classDay,
    };
}

function normalizeAppointment(appointment) {
    const tutorName = `${appointment.tutor?.user?.firstName || "Tutor"} ${appointment.tutor?.user?.lastName || ""}`.trim();
    const subject = (appointment.tutor?.subjects || "Tutoria").split(",")[0].trim();
    return {
        id: appointment.id,
        tutorName,
        subject,
        mode: appointment.locationNotes || "Virtual",
        date: appointment.date,
        durationMinutes: appointment.durationMinutes || 60,
        totalPrice: appointment.totalPrice || 0,
        status: appointment.status || "PENDING",
        image: appointment.tutor?.user?.profileImage || "",
    };
}

function renderClassCard(item) {
    const date = getClassDateParts(item.date, item.durationMinutes);
    const initials = getInitials(item.tutorName);
    const avatar = item.image
        ? `<img src="${item.image}" alt="${item.tutorName}" class="h-full w-full object-cover" />`
        : `<span class="text-3xl font-black text-white/95">${initials}</span>`;

    return `
      <article class="rounded-2xl bg-slate-800 text-white border border-slate-700 shadow-xl p-6 md:p-7">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4 min-w-0">
            <div class="h-20 w-20 rounded-full bg-slate-400 ring-2 ring-white/80 overflow-hidden flex items-center justify-center shrink-0">
              ${avatar}
            </div>
            <div class="min-w-0">
              <h2 class="text-2xl font-black truncate">${item.tutorName}</h2>
              <p class="text-slate-300 text-lg truncate">${item.subject} • ${item.mode}</p>
            </div>
          </div>
          ${date.isToday ? '<span class="rounded-md bg-sky-600 px-3 py-2 text-sm font-black text-sky-100 shrink-0">Hoy</span>' : ''}
        </div>
        <div class="my-6 h-px bg-slate-700"></div>
        <div class="flex items-center gap-3 text-slate-300 text-lg">
          <span class="material-symbols-outlined text-slate-400">calendar_month</span>
          <span>${date.day} • ${date.range}</span>
        </div>
        <button onclick="openDetails('${item.id}')" class="mt-6 w-full rounded-md bg-slate-600/70 py-3 text-lg font-medium hover:bg-slate-500 transition-colors">
          Detalles
        </button>
      </article>
    `;
}

function renderClasses() {
    const grid = document.getElementById("classes-grid");
    if (!grid) return;
    if (!scheduledClasses.length) {
        grid.innerHTML = `
          <div class="md:col-span-2 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 text-center text-slate-500">
            No tienes clases agendadas.
          </div>
        `;
        return;
    }
    grid.innerHTML = scheduledClasses.map(renderClassCard).join("");
}

function openDetails(id) {
    const item = scheduledClasses.find(entry => entry.id === id);
    if (!item) return;
    const date = getClassDateParts(item.date, item.durationMinutes);
    document.getElementById("details-subject").textContent = item.subject;
    document.getElementById("details-title").textContent = "Detalles de clase";
    document.getElementById("details-tutor").textContent = item.tutorName;
    document.getElementById("details-date").textContent = `${date.day}, ${date.range}`;
    document.getElementById("details-duration").textContent = `${item.durationMinutes} minutos`;
    document.getElementById("details-status").textContent = item.status;
    document.getElementById("details-price").textContent = formatCOP(item.totalPrice);
    const modal = document.getElementById("details-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeDetails() {
    const modal = document.getElementById("details-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

async function loadStudentClasses() {
    const token = localStorage.getItem("token");
    const user = getStoredUser();
    const headerName = document.getElementById("header-user-name");
    const headerImage = document.getElementById("header-user-image");
    if (headerName) headerName.textContent = getUserDisplayName(user);
    if (headerImage) headerImage.src = getUserProfileImage(user);

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
        if (!res.ok) throw new Error("No se pudieron cargar las clases");
        const data = await res.json();
        scheduledClasses = (Array.isArray(data) ? data : [])
            .filter(item => item.status !== "CANCELLED")
            .map(normalizeAppointment)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        renderClasses();
    } catch (error) {
        console.error(error);
        const grid = document.getElementById("classes-grid");
        if (grid) {
            grid.innerHTML = `
              <div class="md:col-span-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                No se pudieron cargar tus clases.
              </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadStudentClasses();
    document.getElementById("details-modal")?.addEventListener("click", function (event) {
        if (event.target === this) closeDetails();
    });
});
