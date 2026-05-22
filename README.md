# TutorMaster 🎓

TutorMaster es una plataforma web moderna e interactiva diseñada para conectar a estudiantes con tutores expertos en diversas materias. Resuelve el problema de encontrar apoyo académico confiable, seguro y adaptado al nivel de cada estudiante, proporcionando un entorno donde los usuarios pueden buscar tutores, revisar sus credenciales, ver sus horarios y reservar sesiones (tanto virtuales como presenciales).

---

## 🏗 Arquitectura de Archivos

El proyecto sigue una estructura limpia utilizando Vanilla JS, HTML semántico y CSS modular. A continuación, se detalla la función de los archivos principales:

### Raíz (`/`)

- **`index.html`**: Punto de entrada principal (redirige o sirve como landing page general).
- **`README.md`**: Documentación central del proyecto.

### Directorio `src/pages/`

Contiene todas las vistas HTML de la aplicación.

- **`tutor_home.html`**: Página principal/Landing page. Contiene el buscador avanzado, listado de tutores destacados y el flujo de cómo funciona la plataforma.
- **`tutor_profile.html`**: Vista de perfil público de un tutor. Muestra su biografía (dinámica), precio, reseñas, áreas de especialidad y la interfaz para agendar sesiones.
- **`perfil_estudiante.html`**: Panel de control del estudiante donde puede ver sus tutorías agendadas y progreso.
- **`calendario_estudiante.html`**: Vista interactiva del calendario para gestionar y revisar horarios de clases.
- **`tutor_management_availability.html`**: Panel del tutor para gestionar sus franjas horarias y disponibilidad.
- **`mensajes.html`**: Interfaz de chat y notificaciones entre tutores y estudiantes.
- **`maps.html`**: Mapa interactivo para localizar tutorías o ubicaciones presenciales.

### Directorio `src/js/`

Lógica de la aplicación modularizada por vistas.

- **`tutor_home.js`**: Maneja el modal de login, modo oscuro, notificaciones toast y la lógica principal del buscador dinámico de tutores.
- **`tutor_profile.js`**: Se encarga de hacer _fetch_ de los datos en `tutores.json` según el ID de la URL y renderizar el perfil dinámicamente, evitando "flickers" o datos incorrectos.
- **`perfil_estudiante.js`**, **`calendario_estudiante.js`**, **`tutor_management_availability.js`**: Lógica de los respectivos dashboards y CRUDs de horarios.
- **`tailwind.config.js`**: Configuración de los temas, colores primarios (Primary) y configuraciones de TailwindCSS.

### Directorio `src/styles/`

Estilos específicos complementarios a TailwindCSS.

- Contiene **`tutor_home.css`**, **`tutor_profile.css`**, etc. Manejan animaciones, customizaciones de la barra de desplazamiento y ajustes específicos que Tailwind por sí solo no cubre mediante clases.

### Directorio `.env`

- **`.rnv`**: Funciona como la base de datos para la información de los tutores y estudiantes, garantizando la consistencia de datos e imágenes en todas las vistas.

---

## 🛠 Tecnologías Utilizadas

Este proyecto está construido con un stack frontend puro y ligero, optimizado para rendimiento y SEO:

- **HTML5**: Estructura semántica avanzada.
- **CSS3**: Variables CSS nativas, Media Queries y animaciones personalizadas.
- **TailwindCSS (v3 vía CDN)**: Framework principal para el estilizado rápido, diseño responsive y soporte nativo de Modo Oscuro (`dark mode`).
- **Vanilla JavaScript (ES6+)**: Toda la interactividad, DOM manipulation y consumo de JSON se realiza mediante JS puro, sin frameworks pesados, garantizando tiempos de carga ultrarrápidos.
- **Material Symbols Outlined**: Sistema de iconografía de Google.
- **Google Fonts (Lexend)**: Tipografía moderna y altamente legible.

---

## 🧠 Flujo Lógico (JavaScript)

El flujo de la aplicación se basa en la manipulación directa del DOM y renderizado del lado del cliente:

1. **Inicialización y Temas (`toggleDarkMode`)**: Al cargar la página, JS verifica el `localStorage` para establecer el tema preferido (Claro/Oscuro) en la etiqueta `<html>`.
2. **Carga Dinámica (`tutor_profile.js`)**: Cuando un usuario navega al perfil de un tutor, la URL lleva un parámetro (ej. `?id=david`). El script captura el evento `DOMContentLoaded`, lee el parámetro y realiza un `fetch()` al archivo `tutores.json`.
3. **Estado de Carga y Renderizado**: Mientras los datos se obtienen, se muestra un _Spinner_ (Loading State). Una vez recuperados, JS inyecta dinámicamente los datos (texto, imágenes, precio) en los IDs correspondientes (`#tutor-name`, `#tutor-about`) y revela el contenido principal ocultando el spinner.
4. **Buscador (Search)**: La lógica intercepta el evento de entrada y filtra localmente el array de tutores (mostrando solo las coincidencias basadas en etiquetas, materia o nombre) y re-renderiza las tarjetas (cards) instantáneamente.
5. **Componentes Globales**: Las notificaciones (`showToast`) y modales (`openModal`) se manejan mediante utilidades globales en JS que añaden y quitan clases CSS (como `active` o `show`) de manera secuencial utilizando `setTimeout`.

---

## 🚀 Guía de Uso / Ejecución

Como el proyecto utiliza Vanilla JS y TailwindCSS cargado por CDN, no requiere complejos procesos de construcción (build steps) ni instalación de Node Modules.

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd proyecto_Pagina_Tutorias
```

### 2. Ejecutar el proyecto

Debido a que el proyecto realiza peticiones `fetch()` a archivos locales (`tutores.json`), debes servir los archivos mediante un servidor web local para evitar errores de CORS en el navegador. No abras los archivos HTML con doble clic (file://).

Puedes usar cualquiera de estas opciones:

**Opción A: Usando Python (Recomendado)**
Si tienes Python instalado, abre una terminal en la raíz del proyecto y ejecuta:

```bash
python -m http.server 8000
```

Luego ve a tu navegador y entra a: `http://localhost:8000/src/pages/tutor_home.html`

**Opción B: Usando Live Server (VS Code)**

1. Abre el proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre `src/pages/tutor_home.html` y selecciona **"Open margin-with Live Server"**.

**Opción C: Usando Node.js / NPX**

```bash
npx serve .
```

### 3. Edición de Estilos (TailwindCSS)

Si deseas modificar los colores principales o las directivas de Tailwind, debes actualizar el objeto de configuración en `src/js/tailwind.config.js`. Estos cambios se compilarán al vuelo (JIT) gracias al script del CDN.
