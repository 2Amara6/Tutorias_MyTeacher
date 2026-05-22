import re

with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\perfil_estudiante.html", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Logo link
content = content.replace("onclick=\"window.location.href = 'tutor_platform_home_search.html'\"", "onclick=\"window.location.href = 'tutor_home.html'\"")

# 2. Mis Clases link
content = content.replace('href="clases.html"', 'href="calendario_estudiante.html"')

# 3. Join call
content = content.replace('onclick="joinCall()"', 'onclick="window.open(\'https://meet.google.com/landing\', \'_blank\')"')

# 4. View directions
content = content.replace('onclick="viewDirections()"', 'onclick="window.location.href=\'maps.html\'"')

# 5. Remove red dot for notifications
old_notif = """<span
                    class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white"
                    >1</span
                  >"""
content = content.replace(old_notif, "")

# 6. Check main search/header for 'Explorar', etc. In perfil_estudiante there isn't a traditional 'Explorar' button, it's 'Book a Session' pointing to tutor_platform_home_search.html. Let's fix that.
content = content.replace("window.location.href = 'tutor_platform_home_search.html'", "window.location.href = 'tutor_home.html'")

with open("c:\\Users\\amara\\Documents\\proyecto_Pagina_Tutorias\\src\\pages\\perfil_estudiante.html", "w", encoding="utf-8") as f:
    f.write(content)
