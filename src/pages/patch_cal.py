import re

with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\calendario_estudiante.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update logo link
content = content.replace('''onclick="window.location.href='index.html'"''', '''onclick="window.location.href='tutor_home.html'"''')

# 2. Update Header links
old_nav = """<div class="hidden md:flex items-center gap-4">
            <a href="#" class="text-sm font-semibold border-b-2 border-primary text-primary py-1 cursor-pointer">Reservar Tutoría</a>
            <a href="perfil_estudiante.html" class="text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer">Mis Clases</a>
            <a href="mensajes.html" class="text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer">Mensajes</a>
          </div>"""
new_nav = """<div class="hidden md:flex items-center gap-4">
            <a href="tutor_home.html" class="text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer">Explorar</a>
            <a href="clases.html" class="text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer">Mis Clases</a>
            <a href="perfil_estudiante.html" class="text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer">Perfil</a>
          </div>"""
content = content.replace(old_nav, new_nav)

# 3. Add "Mis Clases" tab
old_tabs = """<div class="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button id="btn-week" class="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg" onclick="setView('week')">Semana</button>
                <button id="btn-month" class="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg" onclick="setView('month')">Mes</button>
              </div>"""
new_tabs = """<div class="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button id="btn-week" class="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg transition-colors" onclick="setView('week')">Semana</button>
                <button id="btn-month" class="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onclick="setView('month')">Mes</button>
                <button id="btn-mis-clases" class="px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors" onclick="setView('mis-clases')">Mis Clases</button>
              </div>"""
content = content.replace(old_tabs, new_tabs)

# 4. Generate Time Column (7AM to 5PM)
times = ["7 AM", "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"]
time_col_html = """<div class="w-16 border-r border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col shrink-0">
                <div class="h-10 border-b border-slate-100 dark:border-slate-800"></div>\n"""
for t in times:
    time_col_html += f'                <div class="h-12 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-medium">{t}</div>\n'
time_col_html += "              </div>"

old_time_col_start = content.find('<!-- Time Column -->')
old_time_col_end = content.find('<!-- Days Columns -->')
content = content[:old_time_col_start] + "<!-- Time Column -->\n              " + time_col_html + "\n\n              " + content[old_time_col_end:]

# 5. Generate Days Columns (11 rows each)
patterns = [
    [1, 1, 0, 2, 0, 0, 1, 0, 0, 0, 1], # Day 1
    [0, 1, 1, 1, 0, 0, 0, 1, 0, 2, 0], # Day 2
    [0, 0, 1, 1, 2, 0, 0, 1, 0, 0, 0], # Day 3
    [1, 1, 0, 2, 2, 0, 0, 1, 1, 0, 0], # Day 4
    [0, 0, 0, 2, 1, 1, 0, 0, 0, 1, 0], # Day 5
]
day_names = ["Lun", "Mar", "Mié", "Jue", "Vie"]
days_html = ""
for d, (p_arr, d_name) in enumerate(zip(patterns, day_names)):
    days_html += f'                <!-- Day {d+1} -->\n'
    days_html += f'                <div class="flex flex-col">\n'
    days_html += f'                  <div id="day-header-{d}" class="day-header h-10 text-center py-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer rounded-t-lg transition-colors" onclick="selectDay(this)">\n'
    days_html += f'                    <div class="day-name text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{d_name}</div>\n'
    days_html += f'                    <div class="day-number text-xs font-medium text-slate-900 dark:text-slate-100">{23+d}</div>\n'
    days_html += f'                  </div>\n'
    for val in p_arr:
        if val == 0:
            days_html += '                  <div class="h-12 border-b border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/20"></div>\n'
        elif val == 1:
            days_html += '                  <div class="h-12 border-b border-slate-100 dark:border-slate-800 p-1 cursor-pointer transition-all" onclick="toggleSelection(this)">\n'
            days_html += '                    <div class="available-btn w-full h-full rounded-lg bg-[#0f84fa] hover:bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center uppercase tracking-wide shadow-sm transition-colors" data-state="available">Disponible</div>\n'
            days_html += '                  </div>\n'
        elif val == 2:
            days_html += '                  <div class="h-12 border-b border-slate-100 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/30 p-1 relative overflow-hidden">\n'
            days_html += '                     <div class="w-full h-full rounded-lg bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold opacity-75 cursor-not-allowed">Ocupado</div>\n'
            days_html += '                  </div>\n'
    days_html += '                </div>\n'

old_days_col_start = content.find('<!-- Day 1 -->')
old_days_col_end = content.find('</div>\n            </div>\n\n            <!-- Legend -->')
content = content[:old_days_col_start] + days_html + content[old_days_col_end:]

# 6. Wrap calendar with #view-calendar and add #view-mis-clases container
calendar_start = content.find('<!-- Week Navigation -->')
calendar_end = content.find('</section>')

calendar_content = content[calendar_start:calendar_end]
month_grid = """
            <!-- Month View Container -->
            <div id="view-month-container" class="hidden">
              <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-4">
                <div class="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Dom</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Lun</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Mar</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Mié</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Jue</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Vie</div>
                  <div class="bg-slate-50 dark:bg-slate-900 p-2 text-center text-xs font-bold text-slate-500">Sáb</div>
                  <!-- First row -->
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">1</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">2</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">3 <div class="mt-1 bg-primary/20 text-primary text-[10px] rounded px-1">1 Clase</div></div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">4</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">5</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">6</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">7</div>
                  <!-- Next week -->
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">8</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">9</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold bg-primary/5 ring-1 ring-primary">10 <div class="mt-1 bg-primary text-white text-[10px] rounded px-1">Hoy</div></div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">11</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">12</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">13</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">14</div>
                  <!-- Remaining just empty numbers for brevity -->
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">15</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">16</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">17</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">18</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">19</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">20</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">21</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">22</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">23</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">24</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">25</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">26</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">27</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">28</div>
                  <div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">29</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">30</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-900 dark:text-slate-100 font-bold">31</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">1</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">2</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">3</div><div class="bg-white dark:bg-slate-800/50 p-2 min-h-[80px] text-slate-400">4</div>
                </div>
              </div>
            </div>
"""
mis_clases_html = """
            <!-- Mis Clases Container -->
            <div id="view-mis-clases-container" class="hidden">
              <h2 class="text-xl font-bold mb-4">Mis Próximas Clases</h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Card 1 -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFM9uJFRzShDrkztGDRdisHG_YsaFa0AOkVbGMa9MymUdBtb472xdhjltkpBZa856il_VfCKh-US3Z6VJhFSlZHh1BxI2YonUrYFgcW-uo_D9unh4SHb7PPGcC2di_VAWzL8-otj35HSFtnTioVdBjA5Jsz9W7iBYUwj7M6qCMkmhIq-pjzy4jevmBNYnCnXfu5La7UMQSXtg8NPtOUun9WjlVBqYZXsHDNvZBQRfgXgPXNdWPrM6gJXD4DWRW-gJHrVp0syIfUFg" class="w-16 h-16 rounded-lg object-cover" alt="Sarah Jenkins">
                  <div class="flex-1">
                    <p class="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Matemáticas</p>
                    <h4 class="text-lg font-bold">Dra. Sarah Jenkins</h4>
                    <div class="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>Hoy, 10:00 AM - 11:00 AM</span>
                    </div>
                    <div class="mt-3">
                      <span class="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold rounded flex items-center gap-1 w-max">
                        <span class="material-symbols-outlined text-[14px]">videocam</span> Virtual
                      </span>
                    </div>
                  </div>
                </div>
                <!-- Card 2 -->
                <div class="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex gap-4 items-start">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAuSiQdZ8oWY6jYFrlHjzij_vDv9WH6r-JIn7MLHl4HLmURBu6jUaYOHv0XtWh0Eyii8d8xPZWpb215Ugd5GL5J_2JjPCCtpuKUNQaNLFKQxLN7Rti1I2xV3FfCkXbbc3DVdlODQJFOh4MegzU5lOBv1dwWEWFh7mLWiuCZ9wuOpxSDXhzIXffr49h3q6HGnZyUsXPgyt3vH30sd6yzhAlxw09A6VCY0UC9AUkuK_saob5_1bPYk8Q2Yt0GHxrIp6-hw" class="w-16 h-16 rounded-lg object-cover" alt="Michael Chen">
                  <div class="flex-1">
                    <p class="text-xs font-bold text-orange-500 uppercase tracking-wider mb-0.5">Física</p>
                    <h4 class="text-lg font-bold">Dr. Michael Chen</h4>
                    <div class="flex items-center gap-2 text-slate-500 text-sm mt-1">
                      <span class="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>Mañana, 2:30 PM - 4:00 PM</span>
                    </div>
                    <div class="mt-3">
                      <span class="px-2 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-600 text-xs font-bold rounded flex items-center gap-1 w-max">
                        <span class="material-symbols-outlined text-[14px]">location_on</span> Presencial
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
"""

new_content_section = f'<div id="view-week-container">\n{calendar_content}\n</div>\n{month_grid}\n{mis_clases_html}\n'
content = content[:calendar_start] + new_content_section + content[calendar_end:]

# 7. Update JS logic for views
old_js_start = content.find("function setView(view) {")
old_js_end = content.find("function navigate(dir) {")
new_js_set_view = """function setView(view) {
        currentView = view;
        const btnWeek = document.getElementById('btn-week');
        const btnMonth = document.getElementById('btn-month');
        const btnMisClases = document.getElementById('btn-mis-clases');
        
        btnWeek.className = "px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors";
        btnMonth.className = "px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors";
        if (btnMisClases) btnMisClases.className = "px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors";
        
        document.getElementById('view-week-container').classList.add('hidden');
        document.getElementById('view-month-container').classList.add('hidden');
        document.getElementById('view-mis-clases-container').classList.add('hidden');

        if (view === 'week') {
          btnWeek.className = "px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg transition-colors";
          document.getElementById('view-week-container').classList.remove('hidden');
          updateCalendar();
        } else if (view === 'month') {
          btnMonth.className = "px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg transition-colors";
          document.getElementById('view-month-container').classList.remove('hidden');
        } else if (view === 'mis-clases') {
          if(btnMisClases) btnMisClases.className = "px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg transition-colors";
          document.getElementById('view-mis-clases-container').classList.remove('hidden');
        }
      }
"""
content = content[:old_js_start] + new_js_set_view + content[old_js_end:]

# 8. Update state management JS functions
toggle_old = """function toggleSelection(el) {
        const btn = el.querySelector('.available-btn');
        if (!btn) return;

        const isSelected = btn.classList.contains('bg-slate-800');
        if (isSelected) {
          btn.classList.remove('bg-slate-800', 'dark:bg-slate-900', 'ring-2', 'ring-primary', 'ring-offset-1', 'dark:ring-offset-slate-900');
          btn.classList.add('bg-[#0f84fa]');
          btn.innerHTML = 'Disponible';
          selectedBlocks--;
        } else {
          btn.classList.remove('bg-[#0f84fa]');
          btn.classList.add('bg-slate-800', 'dark:bg-slate-900', 'ring-2', 'ring-primary', 'ring-offset-1', 'dark:ring-offset-slate-900');
          btn.innerHTML = '<span class="material-symbols-outlined text-white text-lg font-bold">check</span>';
          selectedBlocks++;
        }
        updateSidebar();
      }"""
toggle_new = """function toggleSelection(el) {
        const btn = el.querySelector('.available-btn');
        if (!btn) return;

        const isSelected = btn.classList.contains('bg-slate-800');
        if (isSelected) {
          btn.classList.remove('bg-slate-800', 'dark:bg-slate-900', 'ring-2', 'ring-primary', 'ring-offset-1', 'dark:ring-offset-slate-900');
          btn.classList.add('bg-[#0f84fa]');
          btn.innerHTML = 'Disponible';
          btn.dataset.state = 'available';
          selectedBlocks--;
        } else {
          btn.classList.remove('bg-[#0f84fa]');
          btn.classList.add('bg-slate-800', 'dark:bg-slate-900', 'ring-2', 'ring-primary', 'ring-offset-1', 'dark:ring-offset-slate-900');
          btn.innerHTML = 'Seleccionado';
          btn.dataset.state = 'selected';
          selectedBlocks++;
        }
        updateSidebar();
      }"""
content = content.replace(toggle_old, toggle_new)

confirm_old = """function confirmBooking() {
        document.getElementById('book-modal').classList.add('hidden');
        document.getElementById('book-modal').classList.remove('flex');
        const toast = document.getElementById('toast');
        toast.classList.remove('hidden', 'translate-y-12', 'opacity-0');
        setTimeout(() => {
          toast.classList.add('translate-y-12', 'opacity-0');
          setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
      }"""
confirm_new = """function confirmBooking() {
        document.getElementById('book-modal').classList.add('hidden');
        document.getElementById('book-modal').classList.remove('flex');
        const toast = document.getElementById('toast');
        toast.classList.remove('hidden', 'translate-y-12', 'opacity-0');

        const selectedBtns = document.querySelectorAll('.available-btn[data-state="selected"]');
        selectedBtns.forEach(btn => {
          const parent = btn.parentElement;
          parent.onclick = null;
          parent.classList.remove('cursor-pointer', 'p-1', 'transition-all');
          parent.classList.add('bg-slate-100', 'dark:bg-slate-800/30', 'p-1', 'relative', 'overflow-hidden');
          parent.innerHTML = '<div class="w-full h-full rounded-lg bg-slate-200 dark:bg-slate-700/50 flex items-center justify-center text-[10px] text-slate-500 dark:text-slate-400 font-bold opacity-75 cursor-not-allowed">Ocupado</div>';
        });

        selectedBlocks = 0;
        updateSidebar();

        setTimeout(() => {
          toast.classList.add('translate-y-12', 'opacity-0');
          setTimeout(() => toast.classList.add('hidden'), 300);
        }, 3000);
      }"""
content = content.replace(confirm_old, confirm_new)


with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\calendario_estudiante.html", "w", encoding="utf-8") as f:
    f.write(content)
