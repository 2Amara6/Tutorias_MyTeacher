const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';

// Middleware de Autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// =======================
// AUTH ENDPOINTS
// =======================
app.post('/api/auth/register', async (req, res) => {
  const { email, password, firstName, lastName, role, hourlyRate, subjects, bio, profileImage } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        firstName,
        lastName,
        profileImage: profileImage || null,
        role: role === 'TUTOR' ? 'TUTOR' : 'STUDENT',
        // Si es tutor, crear su perfil vinculado
        ...(role === 'TUTOR' && {
          tutorProfile: {
            create: {
              hourlyRate: Number(hourlyRate) || 0,
              subjects: subjects || '',
              bio: bio || '',
              balance: 0
            }
          }
        })
      },
      include: { tutorProfile: true }
    });

    const token = jwt.sign({ id: user.id, role: user.role, tutorId: user.tutorProfile?.id }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        tutorProfileId: user.tutorProfile?.id
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Error al registrar el usuario, tal vez el correo ya existe.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email }, include: { tutorProfile: true } });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: user.id, role: user.role, tutorId: user.tutorProfile?.id }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        tutorProfileId: user.tutorProfile?.id
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// =======================
// TUTORES ENDPOINTS
// =======================
app.get('/api/tutores', async (req, res) => {
  try {
    const tutores = await prisma.tutorProfile.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, profileImage: true }
        },
        reviews: true
      }
    });
    res.json(tutores);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tutores' });
  }
});

app.get('/api/tutores/me', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'TUTOR') return res.status(403).json({ error: 'Solo para tutores' });
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id: req.user.tutorId },
      include: { 
        user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true } },
        reviews: { include: { student: { select: { firstName: true, lastName: true, profileImage: true } } } }
      }
    });
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo perfil de tutor' });
  }
});

app.get('/api/tutores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true } },
        reviews: { include: { student: { select: { firstName: true, lastName: true, profileImage: true } } } }
      }
    });
    if (!tutor) return res.status(404).json({ error: 'Tutor no encontrado' });
    res.json(tutor);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo tutor' });
  }
});

// =======================
// APPOINTMENTS & FINANCES
// =======================
app.post('/api/appointments', authenticate, async (req, res) => {
  const { tutorId, date, durationMinutes } = req.body;
  try {
    if (req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Solo los estudiantes pueden agendar' });
    }

    const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    if (!tutor) return res.status(404).json({ error: 'Tutor no encontrado' });

    // Calcular precio
    const hours = durationMinutes / 60;
    const totalPrice = tutor.hourlyRate * hours;

    const appointment = await prisma.appointment.create({
      data: {
        studentId: req.user.id,
        tutorId,
        date: new Date(date),
        durationMinutes,
        totalPrice,
        status: 'PENDING'
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la cita' });
  }
});

app.get('/api/appointments', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'STUDENT') {
      const apps = await prisma.appointment.findMany({
        where: { studentId: req.user.id },
        include: { tutorProfile: { include: { user: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true } } } } },
        orderBy: { date: 'asc' }
      });
      return res.json(apps.map(app => ({
        ...app,
        tutor: app.tutorProfile
      })));
    } else if (req.user.role === 'TUTOR') {
      const apps = await prisma.appointment.findMany({
        where: { tutorId: req.user.tutorId },
        include: { student: { select: { id: true, firstName: true, lastName: true, email: true, profileImage: true } } },
        orderBy: { date: 'asc' }
      });
      return res.json(apps);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo citas' });
  }
});

// Endpoint para que el tutor complete la cita y gane el dinero
app.post('/api/appointments/:id/complete', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'TUTOR') return res.status(403).json({ error: 'No autorizado' });

    const appointment = await prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.tutorId !== req.user.tutorId) {
      return res.status(404).json({ error: 'Cita no encontrada o no te pertenece' });
    }

    if (appointment.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Esta cita ya fue completada' });
    }

    // Usar transacción para completar la cita y sumar saldo al tutor
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' }
      }),
      prisma.tutorProfile.update({
        where: { id: req.user.tutorId },
        data: { balance: { increment: appointment.totalPrice } }
      })
    ]);

    res.json({ message: 'Cita completada y fondos añadidos a tu billetera' });
  } catch (error) {
    res.status(500).json({ error: 'Error al completar la cita' });
  }
});

// =======================
// MESSAGES ENDPOINTS
// =======================
app.post('/api/messages', authenticate, async (req, res) => {
  const { receiverId, content } = req.body;
  try {
    if (!receiverId || !content) return res.status(400).json({ error: 'Faltan datos' });
    
    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId,
        content
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } }
      }
    });
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

app.get('/api/messages', authenticate, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, email: true, role: true, profileImage: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

// =======================
// SERVER START
// =======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
