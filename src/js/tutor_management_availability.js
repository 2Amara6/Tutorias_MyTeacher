// Funciones de modo oscuro y toast movidas a utils.js

        const formatCOP = (value = 0) => `$${Number(value || 0).toLocaleString()} COP`;
        let tutorAppointments = [];
        let tutorReviewCount = 0;
        let tutorHoursTaught = 0;
        let tutorCurrentBalance = 0;

        function openSettings() {
            const user = getStoredUser();
            document.getElementById('settings-user-name').textContent = getUserDisplayName(user);
            document.getElementById('settings-user-email').textContent = user.email || 'Cuenta activa';
            document.getElementById('settings-user-image').src = getUserProfileImage(user);
            document.getElementById('settings-modal').classList.add('active');
        }

        function closeSettings() {
            document.getElementById('settings-modal').classList.remove('active');
        }

        document.addEventListener('DOMContentLoaded', () => {
            const settingsModal = document.getElementById('settings-modal');
            if (settingsModal) {
                settingsModal.addEventListener('click', (e) => {
                    if (e.target === settingsModal) closeSettings();
                });
            }
            updateReputation([]);
            updateTeachingStats([]);
        });

        // Navigation tabs
        function setNav(active) {
            ['management', 'students', 'materials'].forEach(n => {
                const el = document.getElementById('nav-' + n);
                if (!el) return;
                if (n === active) el.className = 'text-sm font-semibold border-b-2 border-primary text-primary py-1 cursor-pointer';
                else el.className = 'text-sm font-medium text-slate-500 hover:text-primary transition-colors py-1 cursor-pointer';
                
                const view = document.getElementById('view-' + n);
                if (view) {
                    if (n === active) view.classList.remove('hidden');
                    else view.classList.add('hidden');
                }
            });
            if (active === 'students') renderStudents();
            if (active === 'materials') renderMaterials();
        }

        // Search
        function handleSearch(e) {
            if (e.key === 'Enter') {
                const q = e.target.value.trim();
                if (q) showToast(`Buscando sesiones de "${q}"...`, 'search');
            }
        }

        // Notifications
        function toggleNotifications() {
            const dot = document.getElementById('notif-dot');
            if (dot) dot.style.display = 'none';
            showToast('Sin nuevas notificaciones', 'notifications');
        }

        function showCurrentBalance() {
            showToast(`Saldo total: ${formatCOP(tutorCurrentBalance)}`, 'trending_up');
        }

        function showHoursTaught() {
            showToast(`${tutorHoursTaught.toFixed(tutorHoursTaught % 1 ? 1 : 0)} horas enseñadas`, 'schedule');
        }

        function showReviewCount() {
            showToast(`${tutorReviewCount} reseña${tutorReviewCount === 1 ? '' : 's'} cargada${tutorReviewCount === 1 ? '' : 's'}`, 'star');
        }

        // View toggle
        function setView(v) {
            currentViewMode = v;
            ['week', 'month', 'recurring'].forEach(vv => {
                const btn = document.getElementById('view-' + vv);
                if (!btn) return;
                if (vv === v) btn.className = 'px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-lg';
                else btn.className = 'px-4 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg';
            });
            renderCalendar();
        }

        // Calendar
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let viewDate = new Date();
        let currentViewMode = 'week';
        // availability state: key = "dayIndex-timeIndex", value: 'available'|'booked'|'empty'
        const initialState = {};
        let availability = { ...initialState };

        let times = ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM'];

        
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

        function getWeekDates() {
            const now = viewDate;
            const dayOfWeek = now.getDay(); // 0=Sun
            const monday = new Date(now);
            monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            return Array.from({ length: 7 }, (_, i) => {
                const d = new Date(monday);
                d.setDate(monday.getDate() + i);
                return d;
            });
        }

        function renderCalendar() {
            const header = document.getElementById('cal-header');
            const body = document.getElementById('cal-body');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const today = new Date();

            if (currentViewMode === 'month') {
                const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
                const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
                const offset = firstDay === 0 ? 6 : firstDay - 1; // Lunes es 0

                document.getElementById('week-label').textContent = `${months[viewDate.getMonth()]} ${viewDate.getFullYear()}`;
                
                header.className = "grid grid-cols-7 border-b border-slate-100 dark:border-slate-800";
                header.innerHTML = days.map(d => `<div class="p-2 text-center text-[10px] font-bold text-slate-400 uppercase">${d}</div>`).join('');
                
                body.className = "grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800";
                let cellsHTML = '';
                for (let i = 0; i < offset; i++) cellsHTML += `<div class="p-2 min-h-[100px] bg-slate-50 dark:bg-slate-800/20"></div>`;
                for (let d = 1; d <= daysInMonth; d++) {
                    const isToday = d === today.getDate() && viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
                    cellsHTML += `<div class="p-2 min-h-[100px] hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${isToday ? 'bg-primary/5' : ''}">
                        <span class="text-sm font-bold ${isToday ? 'text-primary' : ''}">${d}</span>
                        <div class="mt-2 text-[10px] text-primary flex flex-col gap-1">
                            ${getAppointmentsForDay(d).length ? `<span class="bg-primary/10 px-1 rounded">${getAppointmentsForDay(d).length} Clase${getAppointmentsForDay(d).length > 1 ? 's' : ''}</span>` : ''}
                        </div>
                    </div>`;
                }
                body.innerHTML = cellsHTML;
            } else {
                const dates = getWeekDates();
                document.getElementById('week-label').textContent =
                    `${months[dates[0].getMonth()]} ${dates[0].getDate()} – ${months[dates[6].getMonth()]} ${dates[6].getDate()}, ${dates[6].getFullYear()}`;

                header.className = "grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] border-b border-slate-100 dark:border-slate-800";
                header.innerHTML = `<div class="p-4 bg-slate-50 dark:bg-slate-800/50"></div>` + days.map((d, i) => {
                    const date = dates[i];
                    const isToday = date.toDateString() === today.toDateString();
                    return `<div class="p-4 text-center border-l border-slate-100 dark:border-slate-800 ${isToday ? 'bg-primary/5' : ''}">
                    <p class="text-[10px] font-bold ${isToday ? 'text-primary' : 'text-slate-400'} uppercase">${d}</p>
                    <p class="text-lg font-bold ${isToday ? 'text-primary' : ''}">${date.getDate()}</p>
                </div>`;
                }).join('');

                body.className = "grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr_1fr_1fr] divide-y divide-slate-100 dark:divide-slate-800";
                body.innerHTML = times.map((t, ti) => {
                    const cells = days.map((_, di) => {
                        const key = `${di}-${ti}`;
                        const state = availability[key] || 'empty';
                        if (state === 'available') {
                            return `<div class="border-l border-slate-100 dark:border-slate-800 cell-available p-1" onclick="toggleCell('${key}')">
                            <div class="h-full w-full bg-primary rounded-lg shadow-sm flex flex-col justify-center items-center text-white p-1 min-h-[40px]">
                                <span class="text-[8px] font-bold uppercase">Disponible</span>
                            </div></div>`;
                        } else if (state === 'booked') {
                            return `<div class="border-l border-slate-100 dark:border-slate-800 cell-booked p-1">
                            <div class="h-full w-full bg-slate-800/80 dark:bg-slate-600 rounded-lg shadow-sm flex flex-col justify-center items-center text-white p-1 min-h-[40px]">
                                <span class="text-[8px] font-bold uppercase">Reservado</span>
                            </div></div>`;
                        } else {
                            return `<div class="border-l border-slate-100 dark:border-slate-800 cell-empty p-1 min-h-[40px] transition-colors" onclick="toggleCell('${key}')"></div>`;
                        }
                    }).join('');
                    return `<div class="contents">
                    <div class="py-4 px-2 text-[10px] font-bold text-slate-400 text-center uppercase">${t}</div>
                    ${cells}
                </div>`;
                }).join('');
            }
        }

        function toggleCell(key) {
            const current = availability[key] || 'empty';
            if (current === 'booked') { showToast('Este horario ya está reservado', 'block'); return; }
            availability[key] = current === 'available' ? 'empty' : 'available';
            renderCalendar();
            showToast(availability[key] === 'available' ? '¡Horario marcado como disponible!' : 'Horario eliminado', availability[key] === 'available' ? 'event_available' : 'event_busy');
        }

        function prevWeek() { 
            if (currentViewMode === 'month') viewDate.setMonth(viewDate.getMonth() - 1);
            else viewDate.setDate(viewDate.getDate() - 7); 
            renderCalendar(); 
        }
        function nextWeek() { 
            if (currentViewMode === 'month') viewDate.setMonth(viewDate.getMonth() + 1);
            else viewDate.setDate(viewDate.getDate() + 7); 
            renderCalendar(); 
        }

        renderCalendar();

        // Save changes
        function saveChanges() {
            const count = Object.values(availability).filter(v => v === 'available').length;
            showToast(`Availability saved! ${count} horarios disponibles.`, 'cloud_done');
        }

        // Duplicate week
        function duplicateWeek() {
            availability = { ...initialState };
            renderCalendar();
            showToast('¡Disponibilidad de semana anterior duplicada!', 'content_copy');
        }

        // Timezone
        const timezones = ['UTC-5 (EST)', 'UTC-6 (CST)', 'UTC-7 (MST)', 'UTC-8 (PST)', 'UTC+0 (GMT)', 'UTC+1 (CET)'];
        let tzIdx = 0;
        function changeTimezone() {
            tzIdx = (tzIdx + 1) % timezones.length;
            document.getElementById('tz-label').textContent = `Zona horaria: ${timezones[tzIdx]}`;
            showToast(`Zona horaria: ${timezones[tzIdx]}`, 'public');
        }

        // Payout Modal
        function openPayoutModal() { document.getElementById('payout-modal').classList.add('active'); }
        function closePayoutModal() { document.getElementById('payout-modal').classList.remove('active'); }
        document.getElementById('payout-modal').addEventListener('click', function (e) { if (e.target === this) closePayoutModal(); });
        function confirmPayout() { closePayoutModal(); showToast('Los métodos de pago estarán disponibles próximamente.', 'schedule'); }

        // Share Modal
        function openShareModal() { document.getElementById('share-modal').classList.add('active'); }
        function closeShareModal() { document.getElementById('share-modal').classList.remove('active'); }
        document.getElementById('share-modal').addEventListener('click', function (e) { if (e.target === this) closeShareModal(); });
        function copyShareUrl() {
            const user = getStoredUser();
            const shareUrl = `${window.location.origin}${window.location.pathname.replace(/\/src\/pages\/[^/]+$/, '/src/pages/tutor_profile.html')}?id=${encodeURIComponent(user.tutorProfileId || '')}`;
            navigator.clipboard.writeText(shareUrl).then(() => showToast('Enlace copiado al portapapeles', 'content_copy')).catch(() => showToast('Enlace copiado', 'content_copy'));
            closeShareModal();
        }
        function shareOn(platform) {
            closeShareModal();
            showToast(`Opening ${platform} to share your profile...`, 'share');
        }

        // Reviews render logic moved to loadProfileAndRequests

        let pendingRequests = [];

        async function loadProfileAndRequests() {
            const token = localStorage.getItem('token');
            const user = getStoredUser();
            if (!token) {
                window.location.href = 'tutor_home.html';
                return;
            }
            if (user.role !== 'TUTOR') {
                window.location.href = getUserHome(user);
                return;
            }

            try {
                // Get Tutor Profile
                const resProfile = await fetch('http://localhost:3000/api/tutores/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resProfile.ok) {
                    const profile = await resProfile.json();
                    
                    // Actualizar nombres en el header
                    const fullName = `${profile.user.firstName} ${profile.user.lastName}`;
                    document.getElementById('tutor-name-header').textContent = fullName;
                    document.getElementById('tutor-subjects-header').textContent = `Profesor de ${profile.subjects || 'Varias materias'}`;
                    const storedUser = { ...getStoredUser(), ...profile.user, role: 'TUTOR', tutorProfileId: profile.id, subjects: profile.subjects };
                    localStorage.setItem('user', JSON.stringify(storedUser));
                    const avatar = document.getElementById('tutor-avatar');
                    if (avatar) {
                        avatar.style.backgroundImage = `url("${getUserProfileImage(storedUser)}")`;
                        avatar.onclick = () => { window.location.href = `tutor_profile.html?id=${profile.id}`; };
                    }
                    const shareInput = document.getElementById('share-url');
                    if (shareInput) {
                        shareInput.value = `${window.location.origin}${window.location.pathname.replace(/\/src\/pages\/[^/]+$/, '/src/pages/tutor_profile.html')}?id=${encodeURIComponent(profile.id)}`;
                    }

                    // Actualizar saldo
                    tutorCurrentBalance = Number(profile.balance || 0);
                    const formattedBalance = formatCOP(profile.balance);
                    document.getElementById('total-balance').textContent = formattedBalance;
                    document.getElementById('available-balance').textContent = formattedBalance;
                    document.getElementById('payout-balance').textContent = formattedBalance;
                    const payoutLabel = document.getElementById('payout-request-label');
                    if (payoutLabel) payoutLabel.textContent = 'Próximamente';

                    // Actualizar reseñas
                    tutorReviewCount = (profile.reviews || []).length;
                    updateReputation(profile.reviews || []);
                    if (profile.reviews && profile.reviews.length > 0) {
                        document.getElementById('reviews-list').innerHTML = profile.reviews.map(r => `
                        <div class="space-y-2">
                            <div class="flex items-center gap-2">
                                <div class="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">${r.student?.firstName?.[0] || 'U'}</div>
                                <span class="text-xs font-bold">${r.student?.firstName || 'Usuario'} ${r.student?.lastName || ''}</span>
                                <div class="flex text-amber-400 scale-75 origin-left">${'<span class="material-symbols-outlined text-xs fill-1">star</span>'.repeat(r.rating)}</div>
                            </div>
                            <p class="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">"${r.comment}"</p>
                        </div>
                        `).join('<hr class="border-slate-100 dark:border-slate-800"/>');
                    } else {
                        document.getElementById('reviews-list').innerHTML = '<p class="text-xs text-slate-500">Aún no hay reseñas.</p>';
                    }
                }

                // Get Appointments
                const resApps = await fetch('http://localhost:3000/api/appointments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (resApps.ok) {
                    const allApps = await resApps.json();
                    tutorAppointments = allApps;
                    pendingRequests = allApps.filter(a => a.status === 'PENDING');
                    updateTeachingStats(allApps);
                    renderRequests();
                    renderCalendar();
                }
            } catch (err) {
                console.error("Error loading dashboard data:", err);
            }
        }

        function renderRequests() {
            const list = document.getElementById('requests-list');
            const count = document.getElementById('req-count');
            if (!list || !count) return;
            count.textContent = `${pendingRequests.length} NEW`;
            if (pendingRequests.length === 0) {
                list.innerHTML = `<div class="text-center py-8 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2 block">inbox</span><p class="text-xs">Sin sesiones pendientes</p></div>`;
                return;
            }
            list.innerHTML = pendingRequests.map((req, i) => `
            <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3" id="req-${req.id}">
                <div class="flex items-start gap-3">
                    <div class="size-10 rounded-lg bg-cover bg-center bg-slate-200 flex items-center justify-center text-primary font-bold">
                        ${req.student?.firstName?.[0] || 'E'}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold truncate">${req.student?.firstName || 'Estudiante'} ${req.student?.lastName || ''}</p>
                        <p class="text-[10px] text-primary font-bold">Sesión Agendada</p>
                        <p class="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-xs">calendar_today</span>
                            ${new Date(req.date).toLocaleString()}
                        </p>
                        <p class="text-[10px] font-bold text-green-600 mt-1">$${req.totalPrice.toLocaleString()} COP</p>
                    </div>
                </div>
                <div class="grid grid-cols-1 gap-2 mt-2">
                    <button onclick="completeSession('${req.id}')" class="py-1.5 text-[10px] font-bold bg-primary text-white rounded-lg hover:brightness-110 shadow-sm transition-all">Completar Sesión</button>
                </div>
            </div>
        `).join('');
        }

        function getAppointmentsForDay(day) {
            return tutorAppointments.filter(app => {
                const date = new Date(app.date);
                return date.getFullYear() === viewDate.getFullYear()
                    && date.getMonth() === viewDate.getMonth()
                    && date.getDate() === day;
            });
        }

        function updateReputation(reviews) {
            const count = reviews.length;
            const average = count ? reviews.reduce((sum, review) => sum + review.rating, 0) / count : 0;
            document.getElementById('rep-score').textContent = average ? average.toFixed(1) : '0.0';
            document.getElementById('rep-reviews-count').textContent = `Basado en ${count} reseña${count === 1 ? '' : 's'}`;
            [5, 4, 3].forEach(rating => {
                const ratingCount = reviews.filter(review => review.rating === rating).length;
                const percent = count ? Math.round((ratingCount / count) * 100) : 0;
                document.getElementById(`rep-bar-${rating}`).style.width = `${percent}%`;
                document.getElementById(`rep-percent-${rating}`).textContent = `${percent}%`;
            });
        }

        function updateTeachingStats(appointments) {
            const completed = appointments.filter(app => app.status === 'COMPLETED');
            const hours = completed.reduce((sum, app) => sum + (Number(app.durationMinutes || 60) / 60), 0);
            tutorHoursTaught = hours;
            document.getElementById('hours-taught').textContent = `${hours.toFixed(hours % 1 ? 1 : 0)} hrs`;
        }

        async function completeSession(id) {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await fetch(`http://localhost:3000/api/appointments/${id}/complete`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    showToast('Sesión completada y pago añadido!', 'check_circle');
                    loadProfileAndRequests();
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Error al completar', 'error');
                }
            } catch (err) {
                showToast('Error de conexión', 'error');
            }
        }

        document.addEventListener('DOMContentLoaded', loadProfileAndRequests);

        // --- Estudiantes Logic ---
        function renderStudents() {
            const tbody = document.getElementById('students-tbody');
            if (!tbody) return;
            const studentsById = new Map();
            tutorAppointments.forEach(app => {
                if (!app.studentId || !app.student) return;
                studentsById.set(app.studentId, {
                    id: app.studentId,
                    name: `${app.student.firstName || 'Estudiante'} ${app.student.lastName || ''}`.trim(),
                    subject: app.subject || getStoredUser().subjects || 'Tutoría'
                });
            });
            const studentsData = Array.from(studentsById.values());
            tbody.innerHTML = studentsData.map(s => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="p-4 font-bold">${s.name}</td>
                    <td class="p-4 text-slate-500">${s.subject}</td>
                    <td class="p-4 text-right">
                        <button onclick="viewStudent('${s.id}')" class="text-primary hover:underline text-sm font-bold mr-2">Ver</button>
                    </td>
                </tr>
            `).join('');
            if(studentsData.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" class="p-8 text-center text-slate-500">No hay estudiantes.</td></tr>';
            }
        }
        
        function viewStudent(id) {
            showToast('Mostrando info del estudiante ' + id, 'person');
        }
        
        // --- Materiales Logic ---
        let materialsData = JSON.parse(localStorage.getItem('tutorMaterials') || '[]');

        function renderMaterials() {
            const grid = document.getElementById('materials-grid');
            if (!grid) return;
            if (materialsData.length === 0) {
                grid.innerHTML = '<div class="md:col-span-2 lg:col-span-3 p-8 text-center text-slate-500 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No hay materiales creados todavía.</div>';
                return;
            }
            grid.innerHTML = materialsData.map(m => `
                <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
                    <div>
                        <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <span class="material-symbols-outlined">${m.type === 'PDF' ? 'picture_as_pdf' : 'description'}</span>
                        </div>
                        <h3 class="font-bold mb-1">${m.title}</h3>
                        <p class="text-xs text-slate-500 mb-4">${m.type}</p>
                    </div>
                    <div class="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <button onclick="editMaterial(${m.id})" class="flex-1 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200">Editar</button>
                        <button onclick="deleteMaterial(${m.id})" class="flex-1 py-1.5 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100">Eliminar</button>
                    </div>
                </div>
            `).join('');
        }

        function addMaterial() {
            materialsData.push({ id: Date.now(), title: 'Nuevo Material', type: 'PDF' });
            localStorage.setItem('tutorMaterials', JSON.stringify(materialsData));
            renderMaterials();
            showToast('Material añadido', 'add_circle');
        }

        function editMaterial(id) {
            showToast('Editando material ' + id, 'edit');
        }

        function deleteMaterial(id) {
            const idx = materialsData.findIndex(m => m.id === id);
            if(idx > -1) {
                materialsData.splice(idx, 1);
                localStorage.setItem('tutorMaterials', JSON.stringify(materialsData));
                renderMaterials();
                showToast('Material eliminado', 'delete');
            }
        }
