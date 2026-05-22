// Funciones de modo oscuro y toast movidas a utils.js

        function renderViewerAuth() {
            const token = localStorage.getItem('token');
            const user = getStoredUser();
            const loginBtn = document.getElementById('nav-login-btn');
            const profileLink = document.getElementById('nav-profile-link');
            const profileImage = document.getElementById('nav-profile-image');
            if (!loginBtn || !profileLink || !profileImage) return;
            if (!token || !user.id) {
                loginBtn.classList.remove('hidden');
                profileLink.classList.add('hidden');
                return;
            }
            loginBtn.classList.add('hidden');
            profileLink.classList.remove('hidden');
            profileImage.src = getUserProfileImage(user);
        }

        // Tabs
        function switchTab(name) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active-tab');
                btn.classList.add('text-slate-500');
            });
            document.getElementById('tab-' + name).classList.add('active');
            const activeBtn = document.querySelector(`[data-tab="${name}"]`);
            activeBtn.classList.add('active-tab');
            activeBtn.classList.remove('text-slate-500');
            if (name === 'reviews') renderReviews();
        }

        // Save / Favorite
        let saved = false;
        let currentTutorUserId = null;
        let currentTutorName = 'Tutor';
        function toggleSave(btn) {
            saved = !saved;
            document.getElementById('save-icon').textContent = saved ? 'favorite' : 'favorite_border';
            document.getElementById('save-label').textContent = saved ? 'Guardado' : 'Guardar';
            btn.className = saved
                ? 'px-4 py-2 bg-red-50 text-red-500 rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors'
                : 'px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-red-50 hover:text-red-500 transition-colors';
            showToast(saved ? 'Tutor guardado en favoritos' : 'Eliminado de favoritos', saved ? 'favorite' : 'favorite_border');
        }

        // Message Modal
        function openMsgModal() {
            const input = document.getElementById('msg-text');
            if (input) input.placeholder = `Hola ${currentTutorName}, me gustaria hablar sobre...`;
            document.getElementById('msg-modal').classList.add('active');
        }
        function closeMsgModal() { document.getElementById('msg-modal').classList.remove('active'); }
        document.getElementById('msg-modal').addEventListener('click', function (e) { if (e.target === this) closeMsgModal(); });
        async function sendMessage() {
            const text = document.getElementById('msg-text').value.trim();
            if (!text) { showToast('Por favor, escribe un mensaje primero', 'error'); return; }
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Por favor inicia sesion para enviar mensajes.', 'error');
                return;
            }
            if (!currentTutorUserId) {
                showToast('No se pudo identificar el tutor para enviar el mensaje.', 'error');
                return;
            }

            try {
                const res = await fetch('http://localhost:3000/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ receiverId: currentTutorUserId, content: text })
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    showToast(data.error || 'No se pudo enviar el mensaje', 'error');
                    return;
                }
                closeMsgModal();
                document.getElementById('msg-text').value = '';
                showToast(`Mensaje enviado a ${currentTutorName}`, 'send');
            } catch (error) {
                showToast('Error de conexion', 'error');
            }
        }

        // Session Type
        let sessionType = 'Virtual';
        function setSessionType(type) {
            sessionType = type;
            document.getElementById('btn-virtual').className = type === 'Virtual'
                ? 'px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 rounded-md shadow-sm'
                : 'px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-md';
            document.getElementById('btn-inperson').className = type === 'In-Person'
                ? 'px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-700 rounded-md shadow-sm'
                : 'px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-md';
            showToast(`Session type: ${type}`, 'toggle_on');
        }

        // Calendar
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let currentDate = new Date();
        let viewYear = currentDate.getFullYear();
        let viewMonth = currentDate.getMonth();
        let selectedDay = null;
        let selectedTime = null;

        const timeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:00 PM', '04:30 PM', '07:00 PM'];
        const bookedSlot = '04:30 PM';

        function renderCalendar() {
            document.getElementById('month-label').textContent = `${monthNames[viewMonth].substring(0, 3)} ${viewYear}`;
            const grid = document.getElementById('calendar-grid');
            grid.innerHTML = '';
            const firstDay = new Date(viewYear, viewMonth, 1).getDay();
            const offset = firstDay === 0 ? 6 : firstDay - 1;
            const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
            const today = new Date();

            for (let i = 0; i < offset; i++) {
                grid.innerHTML += `<div></div>`;
            }
            for (let d = 1; d <= daysInMonth; d++) {
                const isPast = new Date(viewYear, viewMonth, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
                const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                const isSel = d === selectedDay && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                let cls = 'h-9 w-full flex items-center justify-center text-sm rounded-lg transition-all ';
                if (isPast) cls += 'text-slate-300 dark:text-slate-600 pointer-events-none cursor-default';
                else if (isSel) cls += 'bg-primary text-white font-bold shadow-md cursor-pointer';
                else if (isToday) cls += 'ring-2 ring-primary text-primary font-bold cursor-pointer hover:bg-primary hover:text-white';
                else cls += 'hover:bg-slate-100 dark:hover:bg-slate-800 font-medium cursor-pointer';
                grid.innerHTML += `<button class="${cls}" onclick="selectDay(${d})" ${isPast ? 'disabled' : ''}>${d}</button>`;
            }
        }

        function selectDay(d) {
            selectedDay = d;
            selectedTime = null;
            renderCalendar();
            const dateStr = `${monthNames[viewMonth]} ${d}, ${viewYear}`;
            document.getElementById('selected-date-label').textContent = dateStr;
            renderSlots();
        }

        function renderSlots() {
            const container = document.getElementById('time-slots');
            container.innerHTML = timeSlots.map(slot => {
                const isBooked = slot === bookedSlot;
                const isSel = slot === selectedTime;
                if (isBooked) return `<button disabled class="py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-400 cursor-not-allowed">${slot} âœ—</button>`;
                if (isSel) return `<button onclick="selectTime('${slot}')" class="py-2 bg-primary/10 border border-primary text-primary rounded-lg text-xs font-bold">${slot}</button>`;
                return `<button onclick="selectTime('${slot}')" class="py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold hover:border-primary hover:text-primary transition-colors">${slot}</button>`;
            }).join('');
        }

        function selectTime(t) { selectedTime = t; renderSlots(); }
        function prevMonth() { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } selectedDay = null; selectedTime = null; document.getElementById('selected-date-label').textContent = 'Select a date'; document.getElementById('time-slots').innerHTML = '<p class="col-span-3 text-xs text-slate-400 text-center py-2">Por favor, selecciona una fecha primero</p>'; renderCalendar(); }
        function nextMonth() { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } selectedDay = null; selectedTime = null; document.getElementById('selected-date-label').textContent = 'Select a date'; document.getElementById('time-slots').innerHTML = '<p class="col-span-3 text-xs text-slate-400 text-center py-2">Por favor, selecciona una fecha primero</p>'; renderCalendar(); }

        renderCalendar();

        // Booking Modal
        function openBookModal() {
            if (!selectedDay) { showToast('Por favor, selecciona una fecha primero', 'calendar_today'); return; }
            if (!selectedTime) { showToast('Por favor, selecciona un horario', 'schedule'); return; }
            document.getElementById('modal-date').textContent = `${monthNames[viewMonth]} ${selectedDay}, ${viewYear}`;
            document.getElementById('modal-time').textContent = selectedTime;
            document.getElementById('modal-type').textContent = sessionType;
            document.getElementById('book-modal').classList.add('active');
        }
        function closeBookModal() { document.getElementById('book-modal').classList.remove('active'); }
        document.getElementById('book-modal').addEventListener('click', function (e) { if (e.target === this) closeBookModal(); });
        async function confirmBooking() {
            const token = localStorage.getItem('token');
            if (!token) {
                showToast('Por favor inicia sesiÃ³n para agendar.', 'error');
                setTimeout(() => window.location.href = 'tutor_home.html', 2000);
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const tutorId = urlParams.get('id');

            if (!tutorId) return showToast('Error: Tutor no encontrado.', 'error');

            const payload = {
                tutorId,
                date: new Date(viewYear, viewMonth, selectedDay).toISOString(),
                durationMinutes: 60
            };

            try {
                const res = await fetch('http://localhost:3000/api/appointments', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    closeBookModal();
                    showToast('Â¡Reserva confirmada!', 'check_circle');
                    setTimeout(() => window.location.href = 'perfil_estudiante.html', 2000);
                } else {
                    const data = await res.json();
                    showToast(data.error || 'Error al agendar. Â¿Eres estudiante?', 'error');
                }
            } catch (err) {
                showToast('Error de conexiÃ³n', 'error');
            }
        }

        function quickBook() {
            selectedTime = timeSlots[0];
            selectedDay = new Date().getDate();
            openBookModal();
        }

        // Reviews
        let reviews = [];

        let showAll = false;

        function renderReviews(sort = 'recent') {
            let sorted = [...reviews];
            if (sort === 'highest') sorted.sort((a, b) => b.rating - a.rating);
            const list = document.getElementById('reviews-list');
            if (!reviews.length) {
                list.innerHTML = '<p class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-sm text-slate-500">Este tutor todavía no tiene reseñas.</p>';
                document.getElementById('load-more-btn').style.display = 'none';
                return;
            }
            const displayed = showAll ? sorted : sorted.slice(0, 2);
            list.innerHTML = displayed.map(r => `
            <div class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                            ${r.img ? `<img class="w-full h-full object-cover" src="${r.img}"/>` : `<span class="material-symbols-outlined text-slate-500">person</span>`}
                        </div>
                        <div>
                            <p class="font-bold text-sm">${r.name}</p>
                            <div class="flex text-amber-400 scale-75 -ml-2 origin-left">${'<span class="material-symbols-outlined fill-1">star</span>'.repeat(r.rating)}</div>
                        </div>
                    </div>
                    <span class="text-xs text-slate-400 font-medium">${r.date}</span>
                </div>
                <p class="text-slate-600 dark:text-slate-400 text-sm italic">${r.text}</p>
            </div>
        `).join('');
            document.getElementById('load-more-btn').style.display = showAll || reviews.length <= 2 ? 'none' : 'block';
        }

        function loadMoreReviews() { showAll = true; renderReviews(); }
        function sortReviews(val) { renderReviews(val); }

        // Dynamic Loading
        document.addEventListener('DOMContentLoaded', async () => {
            renderViewerAuth();
            const urlParams = new URLSearchParams(window.location.search);
            const tutorId = urlParams.get('id');
            if (tutorId) {
                try {
                    const response = await fetch(`http://localhost:3000/api/tutores/${tutorId}`);
                    if (!response.ok) throw new Error('Tutor no encontrado');
                    const apiTutor = await response.json();
                    
                    const ratingStr = apiTutor.reviews && apiTutor.reviews.length > 0 
                        ? (apiTutor.reviews.reduce((acc, r) => acc + r.rating, 0) / apiTutor.reviews.length).toFixed(1) 
                        : "0.0";
                        
                    const tutor = {
                        name: `${apiTutor.user.firstName} ${apiTutor.user.lastName}`,
                        userId: apiTutor.user.id,
                        title: apiTutor.subjects,
                        rating: parseFloat(ratingStr),
                        reviewsCount: apiTutor.reviews ? apiTutor.reviews.length : 0,
                        price: apiTutor.hourlyRate,
                        img: apiTutor.user.profileImage || 'https://via.placeholder.com/150',
                        about: apiTutor.bio,
                        badges: apiTutor.subjects ? apiTutor.subjects.split(',').map(s => s.trim()) : []
                    };
                    reviews = (apiTutor.reviews || []).map(r => ({
                        name: `${r.student?.firstName || 'Estudiante'} ${r.student?.lastName || ''}`.trim(),
                        rating: r.rating,
                        date: new Date(r.createdAt).toLocaleDateString(),
                        text: r.comment || 'Sin comentario escrito.',
                        img: r.student?.profileImage || null
                    }));
                    
                    if (tutor) {
                        currentTutorName = tutor.name;
                        currentTutorUserId = tutor.userId;
                        document.getElementById('tutor-name').textContent = tutor.name;
                        
                        const bookingNameEl = document.getElementById('modal-tutor-name-booking');
                        if (bookingNameEl) bookingNameEl.textContent = tutor.name;
                        const summaryNameEl = document.getElementById('modal-tutor-name-summary');
                        if (summaryNameEl) summaryNameEl.textContent = tutor.name;
                        const msgNameEl = document.getElementById('modal-tutor-name-msg');
                        if (msgNameEl) msgNameEl.textContent = `Mensaje para ${tutor.name}`;
                        const breadcrumbNameEl = document.getElementById('breadcrumb-tutor-name');
                        if (breadcrumbNameEl) breadcrumbNameEl.textContent = tutor.name;

                        const titleEl = document.getElementById('tutor-title');
                        if (titleEl) titleEl.textContent = tutor.title;
                        const ratingEl = document.getElementById('tutor-rating');
                        if (ratingEl) ratingEl.textContent = tutor.rating.toFixed(1);
                        const reviewsEl = document.getElementById('tutor-reviews-count');
                        if (reviewsEl) reviewsEl.textContent = `(${tutor.reviewsCount} ReseÃ±as)`;
                        const reviewsTabLabel = document.getElementById('reviews-tab-label');
                        if (reviewsTabLabel) reviewsTabLabel.textContent = `Reviews (${tutor.reviewsCount})`;
                        const priceEl = document.getElementById('tutor-price');
                        if (priceEl) priceEl.textContent = tutor.price;
                        const imgEl = document.getElementById('tutor-image');
                        if (imgEl && tutor.img) {
                            imgEl.src = tutor.img;
                            imgEl.alt = tutor.name;
                        }
                        
                        const starsEl = document.getElementById('tutor-stars');
                        if (starsEl) starsEl.innerHTML = '<span class="material-symbols-outlined fill-1">star</span>'.repeat(Math.floor(tutor.rating));
                        
                        const aboutEl = document.getElementById('tutor-about');
                        if (aboutEl) {
                            if (tutor.about) {
                                aboutEl.innerHTML = `<p class="text-slate-600 dark:text-slate-400 leading-relaxed">${tutor.about}</p>`;
                            } else {
                                aboutEl.innerHTML = `<p class="text-slate-600 dark:text-slate-400 leading-relaxed italic">Este tutor no ha agregado una descripciÃ³n aÃºn.</p>`;
                            }
                        }
                        
                        // Update badges
                        const badgesEl = document.getElementById('tutor-badges');
                        if (badgesEl && tutor.badges) {
                            badgesEl.innerHTML = tutor.badges.map(b => `<span class="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full flex items-center gap-1">${b}</span>`).join('');
                        }
                        const subjectsList = document.getElementById('subjects-list');
                        if (subjectsList) {
                            subjectsList.innerHTML = tutor.badges.length
                                ? tutor.badges.map(subject => `<span class="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">${subject}</span>`).join('')
                                : '<p class="text-sm text-slate-500">Este tutor todavía no registró materias.</p>';
                        }
                        const educationList = document.getElementById('education-list');
                        if (educationList) {
                            educationList.innerHTML = '<p class="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm text-slate-500">Este tutor todavía no registró educación o credenciales.</p>';
                        }
                        renderReviews();

                        // Hide loading and show content
                        const loadingEl = document.getElementById('tutor-loading');
                        if (loadingEl) loadingEl.classList.add('hidden');
                        const contentEl = document.getElementById('tutor-content');
                        if (contentEl) {
                            contentEl.classList.remove('hidden');
                            contentEl.classList.add('flex');
                        }
                    } else {
                        showTutorNotFound();
                    }
                } catch (error) {
                    console.error('Error fetching tutor data:', error);
                    showTutorNotFound();
                }
            } else {
                showTutorNotFound();
            }
        });

        function showTutorNotFound() {
            const loading = document.getElementById('tutor-loading');
            if (loading) loading.classList.add('hidden');
            const content = document.getElementById('tutor-content');
            if (content) content.classList.add('hidden');
            const notFound = document.getElementById('tutor-not-found');
            if (notFound) notFound.classList.remove('hidden');
        }

