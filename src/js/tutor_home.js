        /**
         * @fileoverview Script principal para la página de inicio de tutores (tutor_home.html).
         * Maneja el tema oscuro, notificaciones, modales y la lógica de búsqueda de tutores.
         */

// toggleDarkMode y showToast movidos a utils.js

        function renderSessionHeader() {
            const token = localStorage.getItem('token');
            const user = getStoredUser();
            const guestActions = document.getElementById('guest-actions');
            const sessionActions = document.getElementById('session-actions');
            if (!guestActions || !sessionActions) return;

            if (!token || !user.id) {
                guestActions.classList.remove('hidden');
                sessionActions.classList.add('hidden');
                sessionActions.classList.remove('flex');
                return;
            }

            guestActions.classList.add('hidden');
            sessionActions.classList.remove('hidden');
            sessionActions.classList.add('flex');
            document.getElementById('session-user-name').textContent = getUserDisplayName(user);
            document.getElementById('session-user-image').src = getUserProfileImage(user);
        }

        /**
         * Abre el modal de inicio de sesión.
         */
        function openModal() { document.getElementById('modal').classList.add('active'); }
        
        /**
         * Cierra el modal de inicio de sesión.
         */
        function closeModal() { document.getElementById('modal').classList.remove('active'); }

        function openStudentBlockModal() {
            const modal = document.getElementById('student-block-modal');
            if (!modal) return;
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }

        function closeStudentBlockModal() {
            const modal = document.getElementById('student-block-modal');
            if (!modal) return;
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }

        function handleBecomeTutorClick() {
            const token = localStorage.getItem('token');
            const user = getStoredUser();
            if (token && user.role === 'STUDENT') {
                openStudentBlockModal();
                return;
            }
            if (token && user.role === 'TUTOR') {
                window.location.href = 'tutor_management_availability.html';
                return;
            }
            openModal();
            toggleAuthTab('register');
            document.getElementById('reg-role').value = 'TUTOR';
            toggleTutorFields();
        }
        
        // Cierra el modal si se hace clic fuera del contenido
        document.getElementById('modal').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        /**
         * Maneja el evento de inicio de sesión conectando con el backend.
         * @param {Event} e - Evento de envío del formulario.
         */
        async function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            try {
                const res = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    renderSessionHeader();
                    closeModal();
                    showToast('¡Sesión iniciada! Bienvenido de nuevo.', 'check_circle');
                    
                    if (data.user.role === 'TUTOR') {
                        setTimeout(() => window.location.href = 'tutor_management_availability.html', 1500);
                    } else {
                        setTimeout(() => window.location.href = 'perfil_estudiante.html', 1500);
                    }
                } else {
                    showToast(data.error || 'Error al iniciar sesión', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Error de conexión', 'error');
            }
        }

        function toggleAuthTab(tab) {
            const loginBtn = document.getElementById('tab-btn-login');
            const regBtn = document.getElementById('tab-btn-register');
            const loginForm = document.getElementById('form-login');
            const regForm = document.getElementById('form-register');

            if (tab === 'login') {
                loginBtn.className = 'flex-1 py-2 text-sm font-bold border-b-2 border-primary text-primary';
                regBtn.className = 'flex-1 py-2 text-sm font-bold text-slate-500 hover:text-primary border-b-2 border-transparent';
                loginForm.className = 'block';
                regForm.className = 'hidden';
            } else {
                regBtn.className = 'flex-1 py-2 text-sm font-bold border-b-2 border-primary text-primary';
                loginBtn.className = 'flex-1 py-2 text-sm font-bold text-slate-500 hover:text-primary border-b-2 border-transparent';
                regForm.className = 'block';
                loginForm.className = 'hidden';
            }
        }

        function toggleTutorFields() {
            const role = document.getElementById('reg-role').value;
            const fields = document.getElementById('tutor-fields');
            if (role === 'TUTOR') {
                fields.classList.remove('hidden');
                document.getElementById('reg-rate').required = true;
                document.getElementById('reg-subjects').required = true;
            } else {
                fields.classList.add('hidden');
                document.getElementById('reg-rate').required = false;
                document.getElementById('reg-subjects').required = false;
            }
        }

        async function handleRegister(e) {
            e.preventDefault();
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const firstName = document.getElementById('reg-firstname').value;
            const lastName = document.getElementById('reg-lastname').value;
            const role = document.getElementById('reg-role').value;
            const rate = document.getElementById('reg-rate').value;
            const subjects = document.getElementById('reg-subjects').value;
            
            const payload = { email, password, firstName, lastName, role };
            if (role === 'TUTOR') {
                payload.hourlyRate = parseInt(rate);
                payload.subjects = subjects;
                payload.bio = 'Nuevo tutor en la plataforma.';
            }

            try {
                const res = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();
                
                if (res.ok) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    renderSessionHeader();
                    closeModal();
                    showToast('¡Registro exitoso! Bienvenido a TutorMaster.', 'check_circle');
                    
                    if (data.user.role === 'TUTOR') {
                        setTimeout(() => window.location.href = 'tutor_management_availability.html', 1500);
                    } else {
                        setTimeout(() => window.location.href = 'perfil_estudiante.html', 1500);
                    }
                } else {
                    showToast(data.error || 'Error al registrarse', 'error');
                }
            } catch (error) {
                console.error(error);
                showToast('Error de conexión', 'error');
            }
        }

        /**
         * Maneja el filtrado de tutores según la entrada de búsqueda y
         * renderiza los resultados en el DOM.
         */
        async function handleSearch() {
            const query = document.getElementById('search-input').value.trim().toLowerCase();
            const level = document.getElementById('level-select').value;
            const mode = document.getElementById('mode-select').value;

            try {
                const response = await fetch('http://localhost:3000/api/tutores');
                const apiTutores = await response.json();
                
                // Mapear los datos de la base de datos al formato del frontend
                const tutores = apiTutores.map(t => {
                    const ratingStr = t.reviews && t.reviews.length > 0 
                        ? (t.reviews.reduce((acc, r) => acc + r.rating, 0) / t.reviews.length).toFixed(1) 
                        : "0.0";
                    return {
                        id: t.id,
                        name: `${t.user.firstName} ${t.user.lastName}`,
                        img: t.user.profileImage || 'https://via.placeholder.com/150',
                        price: t.hourlyRate,
                        title: t.subjects,
                        rating: parseFloat(ratingStr),
                        reviewsCount: t.reviews ? t.reviews.length : 0,
                        badges: t.subjects ? t.subjects.split(',').map(s => s.trim()) : []
                    };
                });

                // Filtra los tutores basándose en el nombre, materia o etiquetas.
                const filtered = tutores.filter(t => {
                    if (!query) return true;
                    return (t.name && t.name.toLowerCase().includes(query)) || 
                           (t.title && t.title.toLowerCase().includes(query)) || 
                           (t.badges && t.badges.some(tag => tag.toLowerCase().includes(query)));
                });

                const section = document.getElementById('search-results');
                const grid = document.getElementById('results-grid');
                const title = document.getElementById('results-title');

                title.textContent = filtered.length > 0 ? `${filtered.length} tutor(es) encontrado(s) para "${query || 'All'}" — ${level} — ${mode}` : `No se encontraron tutores para "${query}"`;
                
                // Genera el HTML para cada tarjeta de resultado de búsqueda
                grid.innerHTML = filtered.map(t => `
                <div class="group rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-800/50 cursor-pointer min-w-0" onclick="viewProfile('${t.id}')">
                    <div class="mb-4 flex items-start justify-between">
                        <img src="${t.img}" class="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20"/>
                        <div class="text-right">
                            <div class="text-lg font-bold text-primary">$${t.price}<span class="text-xs font-normal text-slate-500">/hr</span></div>
                            <div class="flex items-center gap-1 text-amber-500 text-xs font-bold"><span class="material-symbols-outlined text-sm">star</span>${t.rating} (${t.reviewsCount || 0})</div>
                        </div>
                    </div>
                    <h3 class="mb-1 text-base font-bold break-words whitespace-normal">${t.name}</h3>
                    <p class="text-xs font-medium text-slate-500 uppercase tracking-wide mb-4 break-words whitespace-normal">${t.title ? t.title.split('•')[0].trim() : 'Tutor'}</p>
                    <button onclick="event.stopPropagation(); viewProfile('${t.id}')" class="w-full rounded-lg bg-primary/10 py-2 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all">Ver Perfil</button>
                </div>
            `).join('');

                section.classList.remove('hidden');
                section.scrollIntoView({ behavior: 'smooth' });
            } catch (error) {
                console.error("Error cargando tutores:", error);
                showToast("Error al realizar la búsqueda", "error");
            }
        }

        /**
         * Oculta la sección de resultados de búsqueda.
         */
        function closeSearchResults() {
            document.getElementById('search-results').classList.add('hidden');
        }

        /**
         * Redirige al perfil del tutor.
         * @param {string} tutor - Identificador del tutor.
         */
        function viewProfile(tutor) {
            window.location.href = `tutor_profile.html?id=${tutor}`;
        }

        /**
         * Carga los tutores al iniciar la página para la sección de tutores destacados.
         */
        async function loadTopTutors() {
            try {
                const response = await fetch('http://localhost:3000/api/tutores');
                const apiTutores = await response.json();
                
                const tutores = apiTutores.map(t => {
                    const ratingStr = t.reviews && t.reviews.length > 0 
                        ? (t.reviews.reduce((acc, r) => acc + r.rating, 0) / t.reviews.length).toFixed(1) 
                        : "0.0";
                    return {
                        id: t.id,
                        name: `${t.user.firstName} ${t.user.lastName}`,
                        img: t.user.profileImage || 'https://via.placeholder.com/150',
                        price: t.hourlyRate,
                        title: t.subjects,
                        rating: parseFloat(ratingStr),
                        reviewsCount: t.reviews ? t.reviews.length : 0,
                        badges: t.subjects ? t.subjects.split(',').map(s => s.trim()) : []
                    };
                });
                
                const grid = document.getElementById('tutor-grid');
                if (!grid) return;
                
                grid.innerHTML = tutores.map(t => `
                <div class="group relative rounded-2xl border border-slate-100 bg-white p-6 transition-all hover:shadow-xl hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-800/50 cursor-pointer min-w-0" onclick="viewProfile('${t.id}')">
                    <div class="mb-4 flex items-start justify-between">
                        <div class="relative">
                            <img alt="${t.name}" class="shrink-0 h-16 w-16 rounded-full object-cover ring-2 ring-primary/20" src="${t.img}" />
                            <div class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white text-[10px] border-2 border-white dark:border-slate-800">
                                <span class="material-symbols-outlined text-[14px]">verified</span>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-lg font-bold text-primary">$${t.price} <span class="text-xs font-normal text-slate-500">/hr</span></div>
                            <div class="flex items-center gap-1 text-amber-500">
                                <span class="material-symbols-outlined text-sm">star</span>
                                <span class="text-xs font-bold">${t.rating} (${t.reviewsCount || 0})</span>
                            </div>
                        </div>
                    </div>
                    <h3 class="mb-1 text-lg font-bold text-slate-900 dark:text-white break-words whitespace-normal">${t.name}</h3>
                    <p class="mb-4 text-xs font-medium text-slate-500 uppercase tracking-wide break-words whitespace-normal">${t.title ? t.title.split('•')[0].trim() : 'Tutor'}</p>
                    <div class="mb-6 flex flex-wrap gap-2">
                        ${(t.badges || []).map(b => `<span class="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300 break-words whitespace-normal">${b.toUpperCase()}</span>`).join('')}
                    </div>
                    <button onclick="event.stopPropagation(); viewProfile('${t.id}');" class="w-full rounded-lg bg-primary/10 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-all">Ver Perfil</button>
                </div>
                `).join('');
            } catch (error) {
                console.error("Error al cargar los tutores destacados:", error);
            }
        }

        document.addEventListener('DOMContentLoaded', loadTopTutors);
        document.addEventListener('DOMContentLoaded', renderSessionHeader);


        /**
         * Limpia la entrada de búsqueda y muestra todos los tutores disponibles.
         */
        function verTodosTutores() {
            document.getElementById('search-input').value = '';
            handleSearch();
        }

        // Permite presionar 'Enter' en el input de búsqueda para dispararla
        document.getElementById('search-input').addEventListener('keydown', function (e) {
            if (e.key === 'Enter') handleSearch();
        });
