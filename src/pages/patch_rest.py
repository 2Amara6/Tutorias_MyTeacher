import re

# --- Patch tutor_management_availability.html ---
file_tutor = "c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\tutor_management_availability.html"
with open(file_tutor, "r", encoding="utf-8") as f:
    content_tutor = f.read()

old_controls = """<button
                  onclick="duplicateWeek()"
                  class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg"
                    >content_copy</span
                  >
                  Duplicar Semana Anterior
                </button>"""
new_controls = """<div class="flex items-center gap-2 border-r border-slate-200 dark:border-slate-700 pr-4">
                  <span class="material-symbols-outlined text-lg text-slate-500">schedule</span>
                  <select id="work-hours-select" onchange="updateWorkHours()" class="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary px-2 py-1 outline-none text-slate-700 dark:text-slate-300">
                    <option value="8-15">08:00 AM - 03:00 PM</option>
                    <option value="7-17">07:00 AM - 05:00 PM</option>
                    <option value="9-13">09:00 AM - 01:00 PM</option>
                  </select>
                </div>
                <button
                  onclick="duplicateWeek()"
                  class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-primary transition-colors"
                >
                  <span class="material-symbols-outlined text-lg"
                    >content_copy</span
                  >
                  Duplicar Semana Anterior
                </button>"""
content_tutor = content_tutor.replace(old_controls, new_controls)
with open(file_tutor, "w", encoding="utf-8") as f:
    f.write(content_tutor)

# --- Patch tutor_management_availability.js ---
file_js = "c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\js\\tutor_management_availability.js"
with open(file_js, "r", encoding="utf-8") as f:
    content_js = f.read()

content_js = content_js.replace("const times = ['08:00 AM',", "let times = ['08:00 AM',")
new_js_logic = """
        function updateWorkHours() {
            const val = document.getElementById('work-hours-select').value;
            if (val === '8-15') {
                times = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];
            } else if (val === '7-17') {
                times = ['07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];
            } else if (val === '9-13') {
                times = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM'];
            }
            renderCalendar();
            showToast('Jornada laboral actualizada', 'schedule');
        }

        function getWeekDates() {"""
content_js = content_js.replace("function getWeekDates() {", new_js_logic)
with open(file_js, "w", encoding="utf-8") as f:
    f.write(content_js)

# --- Patch mensajes.html ---
file_msgs = "c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\mensajes.html"
with open(file_msgs, "r", encoding="utf-8") as f:
    content_msgs = f.read()

old_logo_msgs = """<div class="flex items-center gap-3 text-primary">"""
new_logo_msgs = """<div class="flex items-center gap-3 text-primary cursor-pointer" onclick="window.location.href='tutor_home.html'">"""
content_msgs = content_msgs.replace(old_logo_msgs, new_logo_msgs)

with open(file_msgs, "w", encoding="utf-8") as f:
    f.write(content_msgs)
