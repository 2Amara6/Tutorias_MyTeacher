let allMessages = [];
let contacts = [];
let selectedContactId = null;

function openSettings() {
    const user = getStoredUser();
    document.getElementById('settings-user-name').textContent = getUserDisplayName(user);
    document.getElementById('settings-user-email').textContent = user.email || 'Cuenta activa';
    document.getElementById('settings-user-image').src = getUserProfileImage(user);
    const modal = document.getElementById('settings-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

function getOtherUserFromMessage(message, currentUserId) {
    return message.senderId === currentUserId ? message.receiver : message.sender;
}

function contactFromAppointment(appointment, userRole) {
    if (userRole === 'TUTOR') {
        const student = appointment.student;
        if (!student?.id) return null;
        return {
            id: student.id,
            name: `${student.firstName || 'Estudiante'} ${student.lastName || ''}`.trim(),
            email: student.email || '',
            roleLabel: 'Estudiante',
            subject: appointment.subject || 'Tutoria',
            profileImage: student.profileImage || ''
        };
    }

    const tutor = appointment.tutor || appointment.tutorProfile;
    const tutorUser = tutor?.user;
    if (!tutorUser?.id) return null;
    return {
        id: tutorUser.id,
        name: `${tutorUser.firstName || 'Tutor'} ${tutorUser.lastName || ''}`.trim(),
        email: tutorUser.email || '',
        roleLabel: 'Tutor',
        subject: tutor.subjects || 'Tutoria',
        profileImage: tutorUser.profileImage || ''
    };
}

function buildContacts(appointments, messages, user) {
    const byId = new Map();
    appointments
        .filter(item => item.status !== 'CANCELLED')
        .map(item => contactFromAppointment(item, user.role))
        .filter(Boolean)
        .forEach(contact => byId.set(contact.id, contact));

    messages.forEach(message => {
        const other = getOtherUserFromMessage(message, user.id);
        if (!other?.id || !byId.has(other.id)) return;
        const existing = byId.get(other.id);
        byId.set(other.id, {
            ...existing,
            profileImage: existing.profileImage || other.profileImage || '',
            email: existing.email || other.email || ''
        });
    });

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function renderContactAvatar(contact, sizeClass = 'size-10') {
    const safeName = escapeHTML(contact.name);
    const image = contact.profileImage || getUserProfileImage({
        firstName: contact.name,
        lastName: '',
        email: contact.email,
        profileImage: ''
    });
    return `<img src="${escapeHTML(image)}" alt="${safeName}" class="${sizeClass} rounded-full object-cover" />`;
}

function renderChatList() {
    const chatList = document.getElementById('chat-list');
    if (!chatList) return;

    if (!contacts.length) {
        chatList.innerHTML = '<p class="text-slate-500 p-4 text-center text-sm">No tienes conversaciones disponibles.</p>';
        selectedContactId = null;
        renderConversation();
        return;
    }

    chatList.innerHTML = contacts.map(contact => {
        const lastMessage = [...allMessages].reverse().find(message => {
            const other = getOtherUserFromMessage(message, getStoredUser().id);
            return other?.id === contact.id;
        });
        const active = contact.id === selectedContactId;
        return `
            <button onclick="selectConversation('${contact.id}')" data-contact-name="${escapeHTML(contact.name.toLowerCase())}" class="w-full text-left flex items-center gap-4 px-4 py-4 cursor-pointer border-l-4 ${active ? 'bg-primary/5 border-primary' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'}">
              ${renderContactAvatar(contact)}
              <span class="flex-1 min-w-0">
                <span class="block text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">${escapeHTML(contact.name)}</span>
                <span class="block text-xs text-slate-500 truncate">${escapeHTML(lastMessage?.content || contact.subject || contact.roleLabel)}</span>
              </span>
            </button>
        `;
    }).join('');
}

function selectConversation(contactId) {
    selectedContactId = contactId;
    renderChatList();
    renderConversation();
}

function renderConversation() {
    const user = getStoredUser();
    const contact = contacts.find(item => item.id === selectedContactId);
    const title = document.getElementById('conversation-title');
    const status = document.getElementById('conversation-status');
    const avatar = document.getElementById('conversation-avatar');
    const messagesEl = document.getElementById('chat-messages');
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('btn-send-message');

    if (!contact) {
        if (title) title.textContent = 'Selecciona una conversacion';
        if (status) status.textContent = 'Sin conversacion activa';
        if (avatar) avatar.innerHTML = 'TM';
        if (messagesEl) messagesEl.innerHTML = '<p class="text-slate-500 text-sm text-center mt-10">No hay un chat abierto.</p>';
        if (input) input.disabled = true;
        if (sendButton) sendButton.disabled = true;
        return;
    }

    if (title) title.textContent = contact.name;
    if (status) status.textContent = `${contact.roleLabel}${contact.subject ? ` - ${contact.subject}` : ''}`;
    if (avatar) avatar.innerHTML = renderContactAvatar(contact, 'h-full w-full');
    if (input) input.disabled = false;
    if (sendButton) sendButton.disabled = false;

    const thread = allMessages.filter(message =>
        (message.senderId === user.id && message.receiverId === contact.id)
        || (message.senderId === contact.id && message.receiverId === user.id)
    );

    if (!thread.length) {
        messagesEl.innerHTML = '<p class="text-slate-500 text-sm text-center mt-10">Aun no hay mensajes en esta conversacion.</p>';
        return;
    }

    messagesEl.innerHTML = thread.map(message => {
        const isMe = message.senderId === user.id;
        const time = new Date(message.createdAt).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
        return `
            <div class="flex items-end gap-3 max-w-2xl ${isMe ? 'ml-auto flex-row-reverse' : ''}">
              <div class="flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}">
                <div class="px-5 py-3 ${isMe ? 'bg-primary text-white' : 'bg-white dark:bg-slate-800'} rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                  <p class="text-sm">${escapeHTML(message.content)}</p>
                </div>
                <span class="text-[10px] text-slate-400 font-medium">${time}</span>
              </div>
            </div>
        `;
    }).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

async function sendSelectedMessage() {
    const token = localStorage.getItem('token');
    const inputMsg = document.getElementById('message-input');
    const text = inputMsg?.value.trim();
    if (!text || !selectedContactId) return;

    try {
        const res = await fetch('http://localhost:3000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ receiverId: selectedContactId, content: text })
        });
        const message = await res.json();
        if (!res.ok) {
            showToast(message.error || 'No se pudo enviar el mensaje', 'error');
            return;
        }
        allMessages.push(message);
        inputMsg.value = '';
        renderConversation();
        renderChatList();
        showToast('Mensaje enviado', 'send');
    } catch (error) {
        showToast('Error enviando mensaje', 'error');
    }
}

function filterContacts(query) {
    document.querySelectorAll('#chat-list [data-contact-name]').forEach(item => {
        item.classList.toggle('hidden', !item.dataset.contactName.includes(query));
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = getStoredUser();

    if (!token || !user.id) {
        window.location.href = 'tutor_home.html';
        return;
    }

    const requestedMode = new URLSearchParams(window.location.search).get('mode');
    if ((requestedMode === 'tutor' && user.role !== 'TUTOR') || (requestedMode === 'student' && user.role !== 'STUDENT')) {
        window.location.href = `mensajes.html?mode=${user.role === 'TUTOR' ? 'tutor' : 'student'}`;
        return;
    }

    const headerImage = document.getElementById('header-user-image');
    if (headerImage) headerImage.src = getUserProfileImage(user);
    const profileShortcut = headerImage?.closest('div');
    if (profileShortcut) {
        profileShortcut.onclick = () => {
            window.location.href = getUserHome(user);
        };
    }

    document.getElementById('settings-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'settings-modal') closeSettings();
    });

    try {
        const [messagesRes, appointmentsRes] = await Promise.all([
            fetch('http://localhost:3000/api/messages', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('http://localhost:3000/api/appointments', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        const messagesData = messagesRes.ok ? await messagesRes.json() : [];
        allMessages = Array.isArray(messagesData) ? messagesData : [];
        const appointments = appointmentsRes.ok ? await appointmentsRes.json() : [];
        contacts = buildContacts(Array.isArray(appointments) ? appointments : [], allMessages, user);
        selectedContactId = contacts[0]?.id || null;
        renderChatList();
        renderConversation();
    } catch (e) {
        document.getElementById('chat-list').innerHTML = '<p class="text-red-500 p-4 text-center text-sm">No se pudieron cargar las conversaciones.</p>';
        document.getElementById('chat-messages').innerHTML = '<p class="text-slate-500 text-sm text-center mt-10">Intenta de nuevo mas tarde.</p>';
    }

    document.getElementById('btn-send-message')?.addEventListener('click', sendSelectedMessage);
    document.getElementById('message-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendSelectedMessage();
        }
    });
    document.getElementById('message-search')?.addEventListener('input', (e) => {
        filterContacts(e.target.value.trim().toLowerCase());
    });
});
