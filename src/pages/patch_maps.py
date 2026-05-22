import re

with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\maps.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update logo link
old_logo = """<div class="flex items-center gap-2 text-primary">"""
new_logo = """<div class="flex items-center gap-2 text-primary cursor-pointer" onclick="window.location.href='tutor_home.html'">"""
content = content.replace(old_logo, new_logo)

# 2. Update navigation
old_nav = """<nav class="hidden lg:flex items-center gap-6">
            <a
              class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
              href="#"
              >Explorar</a
            >
            <a
              class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
              href="#"
              >Mis Clases</a
            >
            <a
              class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors"
              href="#"
              >Perfil</a
            >
          </nav>"""
new_nav = """<nav class="hidden lg:flex items-center gap-6">
            <a href="tutor_home.html" class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors">Explorar</a>
            <a href="clases.html" class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors">Mis Clases</a>
            <a href="perfil_estudiante.html" class="text-slate-600 dark:text-slate-300 text-sm font-medium hover:text-primary transition-colors">Perfil</a>
          </nav>"""
content = content.replace(old_nav, new_nav)

# 3. Materias Toggle
# In maps.html, the buttons are hardcoded. We can write a JS function and add onclick.
# Let's add the JS function just before </body>
js_materia = """
    <script>
      function toggleMateria(btn) {
        if (btn.classList.contains('bg-primary')) {
          btn.classList.remove('bg-primary', 'text-white');
          btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        } else {
          btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
          btn.classList.add('bg-primary', 'text-white');
        }
      }
    </script>
"""
if "<script>" not in content[content.rfind('</body>') - 200:]:
    content = content.replace("</body>", js_materia + "</body>")

# Let's replace all materia buttons with onclick.
# We will match the button class signatures
# Primary button
content = content.replace('class="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium"', 'class="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-medium transition-colors" onclick="toggleMateria(this)"')
# Default buttons
content = content.replace('class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-primary/10 transition-colors"', 'class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-primary/10 transition-colors" onclick="toggleMateria(this)"')

# 4. Rango de precio: inputs instead of slider
old_price = """<div class="px-2">
              <div
                class="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative"
              >
                <div
                  class="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"
                ></div>
                <div
                  class="absolute left-1/4 -top-1.5 h-4 w-4 bg-white border-2 border-primary rounded-full shadow-sm"
                ></div>
                <div
                  class="absolute right-1/4 -top-1.5 h-4 w-4 bg-white border-2 border-primary rounded-full shadow-sm"
                ></div>
              </div>
              <div
                class="flex justify-between mt-4 text-[10px] font-medium text-slate-500"
              >
                <span>$20.000</span>
                <span class="text-primary font-bold text-xs"
                  >$40.000 - $80.000</span
                >
                <span>$150.000+</span>
              </div>
            </div>"""

new_price = """<div class="px-2 flex gap-2 items-center">
              <div class="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
                <span class="text-slate-400 text-xs">$</span>
                <input type="number" class="w-full bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 focus:ring-0 px-1 py-1.5" placeholder="Min" value="40000" />
              </div>
              <span class="text-slate-400 text-xs font-medium">-</span>
              <div class="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2">
                <span class="text-slate-400 text-xs">$</span>
                <input type="number" class="w-full bg-transparent border-none text-xs text-slate-700 dark:text-slate-300 focus:ring-0 px-1 py-1.5" placeholder="Max" value="80000" />
              </div>
            </div>"""

content = content.replace(old_price, new_price)

# 5. Message button in card
old_msg_btn = """<button
                  class="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-symbols-outlined">chat</span>
                </button>"""
new_msg_btn = """<button
                  onclick="window.location.href='mensajes.html'"
                  class="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <span class="material-symbols-outlined">chat</span>
                </button>"""
content = content.replace(old_msg_btn, new_msg_btn)

with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\maps.html", "w", encoding="utf-8") as f:
    f.write(content)
