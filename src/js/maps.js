document.addEventListener('DOMContentLoaded', async () => {
    const mapLayer = document.getElementById('map-layer');
    const tutorPopup = document.getElementById('tutor-popup');
    const searchInput = document.getElementById('map-search');
    let zoom = 1;
    let activeSubject = '';
    let tutorPins = [];

    const stableNumber = (value, min, max) => {
        const text = String(value || 'TutorMaster');
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
        }
        return min + (hash % (max - min + 1));
    };

    const getPinPosition = (tutor) => {
        if (typeof tutor.latitude === 'number' && typeof tutor.longitude === 'number') {
            const top = Math.min(88, Math.max(12, Math.abs(tutor.latitude % 1) * 100));
            const left = Math.min(88, Math.max(12, Math.abs(tutor.longitude % 1) * 100));
            return { top, left };
        }
        const seed = `${tutor.id}-${tutor.user?.email || tutor.userId || tutor.subjects}`;
        return {
            top: stableNumber(`${seed}-top`, 18, 76),
            left: stableNumber(`${seed}-left`, 18, 78)
        };
    };

    const initialsFor = (name) => name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'TM';

    const applyMapTransform = () => {
        if (mapLayer) mapLayer.style.transform = `scale(${zoom})`;
    };

    const filterPins = () => {
        const query = (searchInput?.value || '').trim().toLowerCase();
        tutorPins.forEach(({ pin, data }) => {
            const matchesText = !query
                || data.name.toLowerCase().includes(query)
                || data.title.toLowerCase().includes(query)
                || data.bio.toLowerCase().includes(query);
            const matchesSubject = !activeSubject
                || data.title.toLowerCase().split(',').map(s => s.trim()).includes(activeSubject.toLowerCase());
            pin.classList.toggle('hidden', !(matchesText && matchesSubject));
        });
        if (tutorPopup) tutorPopup.classList.add('hidden');
    };

    window.toggleMateria = (btn) => {
        document.querySelectorAll('#materia-filters button').forEach(item => {
            item.classList.remove('bg-primary', 'text-white');
            item.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
        });

        const subject = btn.dataset.subject || '';
        activeSubject = activeSubject === subject ? '' : subject;
        if (activeSubject) {
            btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
            btn.classList.add('bg-primary', 'text-white');
        }
        filterPins();
    };

    const showTutorPopup = (tutor) => {
        if (!tutorPopup) return;
        tutorPopup.innerHTML = `
          <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col gap-4">
            <div class="flex gap-4 items-start">
              <div class="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative border border-slate-200 dark:border-slate-700 shrink-0">
                <img alt="${tutor.name}" class="w-full h-full object-cover" src="${tutor.img}" />
                <div class="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5 gap-3">
                  <h4 class="text-slate-900 dark:text-white font-bold text-lg truncate">${tutor.name}</h4>
                  <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                    <span class="material-symbols-outlined text-[12px] fill-1">star</span>${tutor.rating.toFixed(1)}
                  </span>
                </div>
                <p class="text-primary text-sm font-medium mb-1">${tutor.title.split(',')[0] || 'Tutor'}</p>
                <p class="text-xs font-bold text-slate-700 dark:text-slate-200">$${Number(tutor.price || 0).toLocaleString('es-CO')} COP/hr</p>
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${tutor.bio}</p>
            <div class="flex gap-2">
              <button onclick="window.location.href='tutor_profile.html?id=${tutor.id}'" class="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 transition-all">
                SOLICITAR TUTORIA YA
              </button>
              <button onclick="window.location.href='mensajes.html'" class="w-12 h-12 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span class="material-symbols-outlined">chat</span>
              </button>
            </div>
          </div>
        `;
        tutorPopup.classList.remove('hidden');
    };

    const renderMateriaFilters = (tutores) => {
        const container = document.getElementById('materia-filters');
        if (!container) return;
        const subjects = [...new Set(tutores.flatMap(t => (t.subjects || '').split(',').map(s => s.trim()).filter(Boolean)))];
        container.innerHTML = subjects.length
            ? subjects.map(subject => `
                <button
                  data-subject="${subject}"
                  onclick="toggleMateria(this)"
                  class="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-primary/10 text-xs font-medium transition-colors"
                >
                  ${subject}
                </button>
              `).join('')
            : '<p class="text-xs text-slate-500">No hay materias registradas.</p>';
    };

    const renderStudentPin = () => {
        const storedUser = getStoredUser();
        const name = getUserDisplayName(storedUser);
        const seed = storedUser.id || storedUser.email || name;
        const pin = document.createElement('div');
        pin.className = 'absolute z-10 flex flex-col items-center';
        pin.style.top = `${stableNumber(`${seed}-student-top`, 44, 58)}%`;
        pin.style.left = `${stableNumber(`${seed}-student-left`, 42, 56)}%`;
        pin.innerHTML = `
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-xl ring-4 ring-white dark:ring-slate-900 text-sm font-black">
            ${initialsFor(name)}
          </div>
          <span class="mt-2 rounded bg-slate-950 px-2 py-1 text-[10px] font-bold text-white shadow">Tu ubicacion</span>
        `;
        mapLayer?.appendChild(pin);
    };

    const renderTutorPins = (apiTutores) => {
        apiTutores.forEach((tutor, index) => {
            const position = getPinPosition(tutor);
            const ratingStr = tutor.reviews && tutor.reviews.length > 0
                ? (tutor.reviews.reduce((acc, r) => acc + r.rating, 0) / tutor.reviews.length).toFixed(1)
                : '0.0';
            const tutorData = {
                id: tutor.id,
                name: `${tutor.user.firstName} ${tutor.user.lastName}`,
                img: tutor.user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(`${tutor.user.firstName} ${tutor.user.lastName}`)}&background=137fec&color=fff`,
                title: tutor.subjects || 'Tutor',
                price: tutor.hourlyRate,
                rating: parseFloat(ratingStr),
                bio: tutor.bio || 'Tutor profesional en la plataforma TutorMaster.'
            };

            const pin = document.createElement('div');
            pin.className = 'absolute group cursor-pointer';
            pin.style.top = `${position.top}%`;
            pin.style.left = `${position.left}%`;
            const colorClass = index % 2 === 0 ? 'bg-primary' : 'bg-emerald-500';
            pin.innerHTML = `
              <div class="relative flex flex-col items-center">
                <div class="${colorClass} text-white p-2 rounded-full shadow-xl">
                  <span class="material-symbols-outlined">school</span>
                </div>
                <div class="absolute -bottom-1 w-2 h-2 ${colorClass} rotate-45"></div>
                <div class="mt-2 bg-white dark:bg-slate-900 px-2 py-1 rounded text-[10px] font-bold shadow-md border border-slate-100 dark:border-slate-800">
                  ${tutorData.name.split(' ')[0]}
                </div>
              </div>
            `;
            pin.addEventListener('click', () => showTutorPopup(tutorData));
            mapLayer?.appendChild(pin);
            tutorPins.push({ pin, data: tutorData });
        });
    };

    try {
        const storedUser = getStoredUser();
        const headerImage = document.getElementById('header-user-image');
        const headerAvatar = document.getElementById('header-user-avatar');
        if (headerImage) headerImage.src = getUserProfileImage(storedUser);
        if (headerAvatar) headerAvatar.onclick = () => {
            window.location.href = localStorage.getItem('token') ? getUserHome(storedUser) : 'tutor_home.html';
        };

        const response = await fetch('http://localhost:3000/api/tutores');
        const apiTutores = await response.json();
        renderMateriaFilters(apiTutores);
        renderStudentPin();
        renderTutorPins(apiTutores);

        searchInput?.addEventListener('input', filterPins);
        document.getElementById('btn-zoom-in')?.addEventListener('click', () => {
            zoom = Math.min(1.8, Number((zoom + 0.2).toFixed(1)));
            applyMapTransform();
        });
        document.getElementById('btn-zoom-out')?.addEventListener('click', () => {
            zoom = Math.max(0.8, Number((zoom - 0.2).toFixed(1)));
            applyMapTransform();
        });
        document.getElementById('btn-center-map')?.addEventListener('click', () => {
            zoom = 1;
            applyMapTransform();
            tutorPopup?.classList.add('hidden');
            showToast('Mapa centrado en tu ubicacion', 'my_location');
        });
    } catch (error) {
        console.error('Error cargando mapa:', error);
        showToast('Error cargando mapa', 'error');
    }
});
