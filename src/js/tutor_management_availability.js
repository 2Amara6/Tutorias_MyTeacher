// Funciones de modo oscuro y toast movidas a utils.js

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
            document.getElementById('notif-dot').style.display = 'none';
            showToast('Sin nuevas notificaciones', 'notifications');
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
        const initialState = {
            '2-0': 'available', '0-1': 'available', '1-1': 'booked',
            '2-1': 'available', '3-1': 'available', '4-1': 'available',
        };
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
                            ${Math.random() > 0.7 ? '<span class="bg-primary/10 px-1 rounded">1 Clase</span>' : ''}
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
        function confirmPayout() { closePayoutModal(); showToast('¡Pago de \.250 solicitado! Listo en 1-3 días hábiles.', 'payments'); }

        // Share Modal
        function openShareModal() { document.getElementById('share-modal').classList.add('active'); }
        function closeShareModal() { document.getElementById('share-modal').classList.remove('active'); }
        document.getElementById('share-modal').addEventListener('click', function (e) { if (e.target === this) closeShareModal(); });
        function copyShareUrl() {
            navigator.clipboard.writeText('https://tutorhub.pro/andresCastilla').then(() => showToast('¡Enlace copiado al portapapeles!', 'content_copy')).catch(() => showToast('Enlace copiado: tutorhub.pro/andresCastilla', 'content_copy'));
            closeShareModal();
        }
        function shareOn(platform) {
            closeShareModal();
            showToast(`Opening ${platform} to share your profile...`, 'share');
        }

        // Reviews
        const reviews = [
            { name: 'Sarah M.', text: '"¡Excelente explicando conceptos de Cálculo. Lo recomiendo!"', rating: 5 },
            { name: 'Robert K.', text: '"Muy paciente y experto. ¡Mi nota mejoró notablemente!"', rating: 5 },
            { name: 'Amy L.', text: '"¡Gran tutor! Siempre puntual y bien preparado."', rating: 4 },
        ];

        document.getElementById('reviews-list').innerHTML = reviews.map(r => `
        <div class="space-y-2">
            <div class="flex items-center gap-2">
                <div class="size-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">${r.name[0]}</div>
                <span class="text-xs font-bold">${r.name}</span>
                <div class="flex text-amber-400 scale-75 origin-left">${'<span class="material-symbols-outlined text-xs fill-1">star</span>'.repeat(r.rating)}</div>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">${r.text}</p>
        </div>
    `).join('<hr class="border-slate-100 dark:border-slate-800"/>');

        // Requests
        const requests = [
            { name: 'Emily Rose', subject: 'Álgebra II', date: 'Oct 14, 09:00 AM', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdpkbVwNxv_zfK0tnU_54qBj4n10iGBjdN2of56BGzGx9_nDOsBVtUXvDNKMed5qvNwx1eDjRdJup4-MTK2Cjhd-UvevIHR6LGLgJtT6orOqn_CsHuesh6Fbu5X4O6vjt3GRvhA49kGvLe7CoSMjYV9eIY3qpO2bRDXbvGNdAK9WY9EFzvE51yraCPwsJ_yMDroBY625Zq26riT4QO9r8XcmRwdZOpavZ1WkTwcrojcsBuRwWq5A68D1tZrL4c4aYFnDtrkyBCNJA' },
            { name: 'Marcus Chen', subject: 'Álgebra Lineal', date: 'Oct 15, 03:30 PM', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaoK2t5OPQ_aJgeHzlP2bTIfx-v5bIZ_dJCb048A6IHNJSnSqv5qObrnfF5_YHJgUfnc8mzmWHIY-g9x2lkp2QVN4-x0r5ajmlTWOmodZ66aVVXw6vlcVW5s5sHTpV4oI4KMfn-ZuP0v4QXNQHfD1jG0VNkrD9hsq0BVLJcmv4zKlOchlDsYXmYiu6CW9hEjPmSPCnSLL7FAIs9aaWWzFHsGm_X0OHt0aR509G51n0jr1U6T3TXw1U0vthYB6iKC-AwsFnBxhOH54' },
            { name: 'Jamie Lin', subject: 'Fundamentos de Cálculo', date: 'Oct 16, 11:00 AM', img: null },
        ];
        let pendingRequests = [...requests];

        function renderRequests() {
            const list = document.getElementById('requests-list');
            const count = document.getElementById('req-count');
            count.textContent = `${pendingRequests.length} NEW`;
            if (pendingRequests.length === 0) {
                list.innerHTML = `<div class="text-center py-8 text-slate-400"><span class="material-symbols-outlined text-4xl mb-2 block">inbox</span><p class="text-xs">Sin solicitudes pendientes</p></div>`;
                return;
            }
            list.innerHTML = pendingRequests.map((req, i) => `
            <div class="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3" id="req-${i}">
                <div class="flex items-start gap-3">
                    <div class="size-10 rounded-lg bg-cover bg-center ${req.img ? '' : 'bg-slate-200 flex items-center justify-center'}" style="${req.img ? `background-image: url('${req.img}')` : ''}">
                        ${!req.img ? '<span class="material-symbols-outlined text-slate-500">person</span>' : ''}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold truncate">${req.name}</p>
                        <p class="text-[10px] text-primary font-bold">${req.subject}</p>
                        <p class="text-[10px] text-slate-500 flex items-center gap-1 mt-1">
                            <span class="material-symbols-outlined text-xs">calendar_today</span>
                            ${req.date}
                        </p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <button onclick="declineRequest(${i})" class="py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">Rechazar</button>
                    <button onclick="acceptRequest(${i})" class="py-1.5 text-[10px] font-bold bg-primary text-white rounded-lg hover:brightness-110 shadow-sm transition-all">Aceptar</button>
                </div>
            </div>
        `).join('');
        }

        function acceptRequest(i) {
            const req = pendingRequests[i];
            showToast(`Sesión aceptada con ${req.name} for ${req.subject}!`, 'check_circle');
            pendingRequests.splice(i, 1);
            renderRequests();
        }

        function declineRequest(i) {
            const req = pendingRequests[i];
            showToast(`Solicitud de ${req.name} rechazada.`, 'cancel');
            pendingRequests.splice(i, 1);
            renderRequests();
        }

        renderRequests();

        // --- Estudiantes Logic ---
        const studentsData = [
            { id: 1, name: 'Alice Smith', subject: 'Matemáticas' },
            { id: 2, name: 'Bob Jones', subject: 'Física' }
        ];
        
        function renderStudents() {
            const tbody = document.getElementById('students-tbody');
            if (!tbody) return;
            tbody.innerHTML = studentsData.map(s => `
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="p-4 font-bold">${s.name}</td>
                    <td class="p-4 text-slate-500">${s.subject}</td>
                    <td class="p-4 text-right">
                        <button onclick="viewStudent(${s.id})" class="text-primary hover:underline text-sm font-bold mr-2">Ver</button>
                        <button onclick="deleteStudent(${s.id})" class="text-red-500 hover:underline text-sm font-bold">Eliminar</button>
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
        
        function deleteStudent(id) {
            const idx = studentsData.findIndex(s => s.id === id);
            if(idx > -1) {
                studentsData.splice(idx, 1);
                renderStudents();
                showToast('Estudiante eliminado', 'delete');
            }
        }

        // --- Materiales Logic ---
        const materialsData = [
            { id: 1, title: 'Guía de Álgebra', type: 'PDF' },
            { id: 2, title: 'Ejercicios de Cálculo', type: 'DOCX' }
        ];

        function renderMaterials() {
            const grid = document.getElementById('materials-grid');
            if (!grid) return;
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
                renderMaterials();
                showToast('Material eliminado', 'delete');
            }
        }