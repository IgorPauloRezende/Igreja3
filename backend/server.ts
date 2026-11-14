import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import { generateId, readDb, writeDb } from './db.ts';
import type {
  ChurchEvent,
  ChurchNotification,
  ChurchSettings,
  Member,
  MinistryName,
  ParishionerAccount,
  PrayerRequest,
  SafeParishioner,
  Sermon,
} from '../shared/types/church.ts';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') });

const PORT = Number(process.env.PORT) || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
if (!process.env.ADMIN_PASSWORD) {
  console.warn(
    '[AVISO] ADMIN_PASSWORD não encontrado no arquivo .env. Usando senha padrão para desenvolvimento: admin123'
  );
}
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const COOKIE_NAME = 'paroquia_admin_session';
const MEMBER_COOKIE_NAME = 'paroquia_member_session';

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, expectedHex] = stored.split(':');
  if (!salt || !expectedHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

function toSafeParishioner(account: ParishionerAccount): SafeParishioner {
  const { passwordHash: _omit, ...safe } = account;
  return safe;
}

function signSessionToken(payload: { role: string; sub?: string; exp: number }): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${signature}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return false;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      role?: string;
      exp?: number;
    };
    return parsed.role === 'admin' && typeof parsed.exp === 'number' && parsed.exp > Date.now();
  } catch {
    return false;
  }
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const idx = part.indexOf('=');
    if (idx > -1) {
      const key = part.slice(0, idx).trim();
      const value = part.slice(idx + 1).trim();
      acc[key] = decodeURIComponent(value);
    }
    return acc;
  }, {});
}

function extractAdminToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookies(req);
  return cookies[COOKIE_NAME];
}

function verifyMemberToken(token: string | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [encoded, signature] = token.split('.');
  if (!encoded || !signature) return null;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf-8')) as {
      role?: string;
      sub?: string;
      exp?: number;
    };
    if (
      parsed.role === 'member' &&
      typeof parsed.sub === 'string' &&
      typeof parsed.exp === 'number' &&
      parsed.exp > Date.now()
    ) {
      return parsed.sub;
    }
    return null;
  } catch {
    return null;
  }
}

function extractMemberToken(req: Request): string | undefined {
  const cookies = parseCookies(req);
  return cookies[MEMBER_COOKIE_NAME];
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractAdminToken(req);
  if (!verifySessionToken(token)) {
    res.status(401).json({ error: 'Sessão administrativa expirada ou não autenticada.' });
    return;
  }
  next();
}

function escapeCsvCell(value: string): string {
  const sanitized = (value || '').replace(/"/g, '""');
  return `"${sanitized}"`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Healthcheck for Render / Railway / Fly.io / Docker
  app.get('/api/health', (_req, res) => {
    const db = readDb();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      counts: {
        events: db.events.length,
        sermons: db.sermons.length,
        members: db.members.length,
        notifications: db.notifications.length,
      },
    });
  });

  // Public overview endpoint (no sensitive member data exposed!)
  app.get('/api/public/overview', (_req, res) => {
    const db = readDb();
    const publishedEvents = db.events
      .filter((e) => e.published)
      .map((e) => ({
        ...e,
        rsvpCount: e.rsvps.reduce((sum, r) => sum + (r.guests || 1), 0),
        rsvps: undefined,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const publishedSermons = db.sermons
      .filter((s) => s.published)
      .sort((a, b) => b.date.localeCompare(a.date));

    const activeBanner =
      db.notifications.find((n) => n.activeBanner) || null;

    const recentNotifications = db.notifications.slice(0, 5);

    res.json({
      settings: db.settings,
      events: publishedEvents,
      sermons: publishedSermons,
      activeBanner,
      recentNotifications,
      stats: {
        activeMembersCount: db.members.filter((m) => m.status !== 'Inativo').length,
        subscriberCount: db.subscribers.length,
      },
    });
  });

  // Public Event RSVP
  app.post('/api/public/rsvp', (req, res) => {
    const { eventId, name, email, phone, guests } = req.body as {
      eventId?: string;
      name?: string;
      email?: string;
      phone?: string;
      guests?: number;
    };

    if (!eventId || !name?.trim() || !email?.trim()) {
      res.status(400).json({ error: 'Informe nome, e-mail e o evento selecionado.' });
      return;
    }

    const db = readDb();
    const eventIdx = db.events.findIndex((e) => e.id === eventId && e.published);
    if (eventIdx === -1) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }

    const event = db.events[eventIdx];
    const guestCount = Math.max(1, Math.min(10, Number(guests) || 1));
    const currentTaken = event.rsvps.reduce((sum, r) => sum + (r.guests || 1), 0);

    if (currentTaken + guestCount > event.capacity) {
      res.status(409).json({ error: 'Capacidade máxima do evento atingida.' });
      return;
    }

    event.rsvps.push({
      id: generateId('rsvp'),
      name: name.trim(),
      email: email.trim(),
      phone: (phone || '').trim(),
      guests: guestCount,
      createdAt: new Date().toISOString(),
    });

    writeDb(db);
    res.status(201).json({
      ok: true,
      rsvpCount: currentTaken + guestCount,
      message: 'Presença confirmada com sucesso.',
    });
  });

  // Public interest registration for parish notices
  app.post('/api/public/subscribe', (req, res) => {
    const { name, email, phone, pushEnabled, topics } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      pushEnabled?: boolean;
      topics?: string[];
    };

    if (!name?.trim() || (!email?.trim() && !phone?.trim())) {
      res.status(400).json({ error: 'Informe seu nome e ao menos um e-mail ou telefone.' });
      return;
    }

    const db = readDb();
    const normalizedEmail = (email || '').trim().toLowerCase();
    const existing = db.subscribers.find(
      (s) => normalizedEmail && s.email.toLowerCase() === normalizedEmail
    );

    if (existing) {
      existing.name = name.trim();
      existing.phone = (phone || existing.phone).trim();
      existing.pushEnabled = Boolean(pushEnabled ?? existing.pushEnabled);
      existing.topics = Array.isArray(topics) && topics.length > 0 ? topics : existing.topics;
      writeDb(db);
      res.json({ ok: true, subscriber: existing, updated: true });
      return;
    }

    const subscriber = {
      id: generateId('sub'),
      name: name.trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      pushEnabled: Boolean(pushEnabled),
      topics: Array.isArray(topics) && topics.length > 0 ? topics : ['missas', 'catequese', 'avisos'],
      createdAt: new Date().toISOString(),
    };

    db.subscribers.unshift(subscriber);
    writeDb(db);
    res.status(201).json({ ok: true, subscriber, updated: false });
  });

  // Public Prayer Request / Visit Card
  app.post('/api/public/prayer-requests', (req, res) => {
    const { name, email, phone, requestType, message } = req.body as {
      name?: string;
      email?: string;
      phone?: string;
      requestType?: 'Oração' | 'Visita';
      message?: string;
    };

    if (!name?.trim() || !message?.trim()) {
      res.status(400).json({ error: 'Por favor, informe seu nome e sua mensagem.' });
      return;
    }

    const db = readDb();
    const entry: PrayerRequest = {
      id: generateId('pray'),
      name: name.trim(),
      email: (email || '').trim(),
      phone: (phone || '').trim(),
      requestType: requestType === 'Visita' ? 'Visita' : 'Oração',
      message: message.trim(),
      status: 'Pendente',
      createdAt: new Date().toISOString(),
    };

    db.prayerRequests.unshift(entry);
    writeDb(db);
    res.status(201).json({ ok: true, entry });
  });

  // Parishioner (Área do Paroquiano) Auth & Account Routes
  app.get('/api/parishioner/me', (req, res) => {
    const accountId = verifyMemberToken(extractMemberToken(req));
    if (!accountId) {
      res.json({ authenticated: false, account: null });
      return;
    }
    const db = readDb();
    const account = (db.parishioners || []).find((p) => p.id === accountId);
    if (!account) {
      res.json({ authenticated: false, account: null });
      return;
    }
    res.json({ authenticated: true, account: toSafeParishioner(account) });
  });

  app.post('/api/parishioner/register', (req, res) => {
    const { fullName, email, phone, pastoral, password } = req.body as {
      fullName?: string;
      email?: string;
      phone?: string;
      pastoral?: MinistryName | 'Comunidade';
      password?: string;
    };

    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanName || !cleanEmail || !password) {
      res.status(400).json({ error: 'Preencha nome completo, e-mail e senha.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      res.status(400).json({ error: 'Informe um e-mail válido.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    const db = readDb();
    db.parishioners = db.parishioners || [];

    if (db.parishioners.some((p) => p.email.toLowerCase() === cleanEmail)) {
      res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
      return;
    }

    const account: ParishionerAccount = {
      id: generateId('par'),
      fullName: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      pastoral: pastoral || 'Comunidade',
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    db.parishioners.unshift(account);

    // Sync with members directory if not yet listed so parish admin sees registered parishioners
    if (!db.members.some((m) => m.email.toLowerCase() === cleanEmail)) {
      db.members.unshift({
        id: generateId('mem'),
        fullName: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        status: 'Ativo',
        ministry: pastoral || 'Comunidade',
        baptismDate: '',
        birthDate: '',
        joinedAt: new Date().toISOString().slice(0, 10),
        notes: 'Cadastrado pela Área do Paroquiano no site.',
      });
    }

    writeDb(db);

    const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
    const token = signSessionToken({ role: 'member', sub: account.id, exp });

    res.cookie(MEMBER_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 14,
      path: '/',
    });

    res.status(201).json({
      authenticated: true,
      account: toSafeParishioner(account),
    });
  });

  app.post('/api/parishioner/login', (req, res) => {
    const { email, password } = req.body as { email?: string; password?: string };
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) {
      res.status(400).json({ error: 'Informe seu e-mail e senha.' });
      return;
    }

    const db = readDb();
    const account = (db.parishioners || []).find((p) => p.email.toLowerCase() === cleanEmail);
    if (!account || !verifyPassword(password, account.passwordHash)) {
      res.status(401).json({ error: 'E-mail ou senha incorretos.' });
      return;
    }

    const exp = Date.now() + 1000 * 60 * 60 * 24 * 14;
    const token = signSessionToken({ role: 'member', sub: account.id, exp });

    res.cookie(MEMBER_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 14,
      path: '/',
    });

    res.json({
      authenticated: true,
      account: toSafeParishioner(account),
    });
  });

  app.put('/api/parishioner/me', (req, res) => {
    const accountId = verifyMemberToken(extractMemberToken(req));
    if (!accountId) {
      res.status(401).json({ error: 'Faça login para atualizar seus dados.' });
      return;
    }
    const { fullName, phone, pastoral } = req.body as {
      fullName?: string;
      phone?: string;
      pastoral?: MinistryName | 'Comunidade';
    };

    const db = readDb();
    const idx = (db.parishioners || []).findIndex((p) => p.id === accountId);
    if (idx === -1) {
      res.status(404).json({ error: 'Conta não encontrada.' });
      return;
    }

    const current = db.parishioners![idx];
    db.parishioners![idx] = {
      ...current,
      fullName: fullName?.trim() || current.fullName,
      phone: phone !== undefined ? phone.trim() : current.phone,
      pastoral: pastoral || current.pastoral,
    };

    writeDb(db);
    res.json({ authenticated: true, account: toSafeParishioner(db.parishioners![idx]) });
  });

  app.post('/api/parishioner/logout', (_req, res) => {
    res.clearCookie(MEMBER_COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false, account: null });
  });

  // Auth Routes
  app.get('/api/auth/session', (req, res) => {
    const token = extractAdminToken(req);
    res.json({ authenticated: verifySessionToken(token) });
  });

  app.post('/api/auth/login', (req, res) => {
    const { password } = req.body as { password?: string };
    if (!password || password !== ADMIN_PASSWORD) {
      res.status(401).json({ error: 'Senha administrativa incorreta.' });
      return;
    }

    const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
    const token = signSessionToken({ role: 'admin', exp });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    res.json({ authenticated: true, token });
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ authenticated: false });
  });

  // Admin Full Snapshot
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const db = readDb();
    res.json({
      ...db,
      parishioners: (db.parishioners || []).map(toSafeParishioner),
    });
  });

  // Admin Events CRUD
  app.post('/api/admin/events', requireAdmin, (req, res) => {
    const body = req.body as Partial<ChurchEvent> & { notifyMembers?: boolean };
    if (!body.title?.trim() || !body.date || !body.time) {
      res.status(400).json({ error: 'Título, data e horário são obrigatórios.' });
      return;
    }

    const db = readDb();
    const newEvent: ChurchEvent = {
      id: generateId('evt'),
      title: body.title.trim(),
      subtitle: (body.subtitle || '').trim(),
      category: body.category || 'Celebrações',
      date: body.date,
      time: body.time,
      location: (body.location || 'Igreja Matriz').trim(),
      description: (body.description || '').trim(),
      capacity: Math.max(1, Number(body.capacity) || 150),
      coverKey: body.coverKey || 'event_worship_night',
      featured: Boolean(body.featured),
      published: body.published !== false,
      rsvps: [],
      createdAt: new Date().toISOString(),
    };

    if (newEvent.featured) {
      db.events.forEach((e) => {
        e.featured = false;
      });
    }

    db.events.unshift(newEvent);

    // Create a site notice when publishing a new event
    if (body.notifyMembers && newEvent.published) {
      const targetCount =
        db.members.filter((m) => m.status !== 'Inativo').length + db.subscribers.length;
      const notification: ChurchNotification = {
        id: generateId('not'),
        title: `Novo Evento: ${newEvent.title}`,
        message: `${newEvent.subtitle || newEvent.description} · ${newEvent.date} às ${newEvent.time} em ${newEvent.location}.`,
        channel: 'banner',
        targetGroup: 'Todos',
        activeBanner: true,
        linkLabel: 'Ver evento',
        linkSection: 'eventos',
        recipientCount: targetCount,
        createdAt: new Date().toISOString(),
      };
      db.notifications.forEach((n) => {
        n.activeBanner = false;
      });
      db.notifications.unshift(notification);
    }

    writeDb(db);
    res.status(201).json(newEvent);
  });

  app.put('/api/admin/events/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<ChurchEvent>;
    const db = readDb();
    const idx = db.events.findIndex((e) => e.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Evento não encontrado.' });
      return;
    }

    const updated: ChurchEvent = {
      ...db.events[idx],
      ...body,
      id: db.events[idx].id,
      rsvps: db.events[idx].rsvps,
      capacity: Math.max(1, Number(body.capacity ?? db.events[idx].capacity)),
    };

    if (updated.featured) {
      db.events.forEach((e) => {
        if (e.id !== id) e.featured = false;
      });
    }

    db.events[idx] = updated;
    writeDb(db);
    res.json(updated);
  });

  app.delete('/api/admin/events/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.events = db.events.filter((e) => e.id !== id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Sermons CRUD
  app.post('/api/admin/sermons', requireAdmin, (req, res) => {
    const body = req.body as Partial<Sermon> & { notifyMembers?: boolean };
    if (!body.title?.trim() || !body.preacher?.trim()) {
      res.status(400).json({ error: 'Título e celebrante são obrigatórios.' });
      return;
    }

    const db = readDb();
    const newSermon: Sermon = {
      id: generateId('ser'),
      title: body.title.trim(),
      series: (body.series || 'Mensagens Paroquiais').trim(),
      preacher: body.preacher.trim(),
      date: body.date || new Date().toISOString().slice(0, 10),
      duration: (body.duration || '35 min').trim(),
      scripture: (body.scripture || '').trim(),
      summary: (body.summary || '').trim(),
      keyTakeaways: Array.isArray(body.keyTakeaways)
        ? body.keyTakeaways.filter(Boolean)
        : [],
      mediaUrl: (body.mediaUrl || '').trim(),
      coverKey: body.coverKey || 'sermon_series_cover',
      featured: Boolean(body.featured),
      published: body.published !== false,
      createdAt: new Date().toISOString(),
    };

    if (newSermon.featured) {
      db.sermons.forEach((s) => {
        s.featured = false;
      });
    }

    db.sermons.unshift(newSermon);

    if (body.notifyMembers && newSermon.published) {
      const targetCount =
        db.members.filter((m) => m.status !== 'Inativo').length + db.subscribers.length;
      const notification: ChurchNotification = {
        id: generateId('not'),
        title: `Nova Homilia: ${newSermon.title}`,
        message: `${newSermon.preacher} · ${newSermon.series} (${newSermon.duration}).`,
        channel: 'banner',
        targetGroup: 'Todos',
        activeBanner: false,
        linkLabel: 'Ouvir homilia',
        linkSection: 'homilias',
        recipientCount: targetCount,
        createdAt: new Date().toISOString(),
      };
      db.notifications.unshift(notification);
    }

    writeDb(db);
    res.status(201).json(newSermon);
  });

  app.put('/api/admin/sermons/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<Sermon>;
    const db = readDb();
    const idx = db.sermons.findIndex((s) => s.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Homilia não encontrada.' });
      return;
    }

    const updated: Sermon = {
      ...db.sermons[idx],
      ...body,
      id: db.sermons[idx].id,
    };

    if (updated.featured) {
      db.sermons.forEach((s) => {
        if (s.id !== id) s.featured = false;
      });
    }

    db.sermons[idx] = updated;
    writeDb(db);
    res.json(updated);
  });

  app.delete('/api/admin/sermons/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.sermons = db.sermons.filter((s) => s.id !== id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Members CRUD + CSV Export
  app.post('/api/admin/members', requireAdmin, (req, res) => {
    const body = req.body as Partial<Member>;
    if (!body.fullName?.trim()) {
      res.status(400).json({ error: 'Nome completo é obrigatório.' });
      return;
    }

    const db = readDb();
    const newMember: Member = {
      id: generateId('mem'),
      fullName: body.fullName.trim(),
      email: (body.email || '').trim(),
      phone: (body.phone || '').trim(),
      status: body.status || 'Ativo',
      ministry: body.ministry || 'Comunidade',
      baptismDate: body.baptismDate || '',
      birthDate: body.birthDate || '',
      joinedAt: body.joinedAt || new Date().toISOString().slice(0, 10),
      notes: (body.notes || '').trim(),
    };

    db.members.unshift(newMember);
    writeDb(db);
    res.status(201).json(newMember);
  });

  app.put('/api/admin/members/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const body = req.body as Partial<Member>;
    const db = readDb();
    const idx = db.members.findIndex((m) => m.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Membro não encontrado.' });
      return;
    }

    db.members[idx] = {
      ...db.members[idx],
      ...body,
      id: db.members[idx].id,
    };
    writeDb(db);
    res.json(db.members[idx]);
  });

  app.delete('/api/admin/members/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.members = db.members.filter((m) => m.id !== id);
    writeDb(db);
    res.json({ ok: true });
  });

  app.get('/api/admin/members/export', requireAdmin, (_req, res) => {
    const db = readDb();
    const headers = [
      'Nome Completo',
      'E-mail',
      'Telefone / WhatsApp',
      'Status',
      'Pastoral',
      'Data de Batismo',
      'Nascimento',
      'Participa Desde',
      'Observações',
    ];
    const rows = db.members.map((m) =>
      [
        escapeCsvCell(m.fullName),
        escapeCsvCell(m.email),
        escapeCsvCell(m.phone),
        escapeCsvCell(m.status),
        escapeCsvCell(m.ministry),
        escapeCsvCell(m.baptismDate),
        escapeCsvCell(m.birthDate),
        escapeCsvCell(m.joinedAt),
        escapeCsvCell(m.notes),
      ].join(',')
    );

    const csv = `\uFEFF${headers.map(escapeCsvCell).join(',')}\n${rows.join('\n')}`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="paroquianos-santa-isabel.csv"');
    res.send(csv);
  });

  // Admin Notifications Center ("Notificar")
  app.post('/api/admin/notifications', requireAdmin, (req, res) => {
    const body = req.body as Partial<ChurchNotification>;
    if (!body.title?.trim() || !body.message?.trim()) {
      res.status(400).json({ error: 'Título e mensagem da notificação são obrigatórios.' });
      return;
    }

    const db = readDb();
    const targetGroup = body.targetGroup || 'Todos';

    let recipientCount = db.subscribers.length;
    if (targetGroup === 'Todos') {
      recipientCount += db.members.filter((m) => m.status !== 'Inativo').length;
    } else if (targetGroup === 'Membros Ativos') {
      recipientCount = db.members.filter(
        (m) => m.status === 'Ativo' || m.status === 'Coordenador'
      ).length;
    } else if (targetGroup === 'Coordenadores' || targetGroup === 'Líderes') {
      recipientCount = db.members.filter((m) => m.status === 'Coordenador').length;
    } else if (targetGroup === 'Visitantes') {
      recipientCount = db.members.filter((m) => m.status === 'Visitante').length;
    } else {
      recipientCount = db.members.filter((m) => m.ministry === targetGroup).length;
    }

    if (body.activeBanner) {
      db.notifications.forEach((n) => {
        n.activeBanner = false;
      });
    }

    const notification: ChurchNotification = {
      id: generateId('not'),
      title: body.title.trim(),
      message: body.message.trim(),
      channel: body.channel || 'banner',
      targetGroup,
      activeBanner: Boolean(body.activeBanner),
      linkLabel: (body.linkLabel || 'Saiba mais').trim(),
      linkSection: (body.linkSection || 'eventos').trim(),
      recipientCount,
      createdAt: new Date().toISOString(),
    };

    db.notifications.unshift(notification);
    writeDb(db);
    res.status(201).json(notification);
  });

  app.patch('/api/admin/notifications/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { activeBanner } = req.body as { activeBanner?: boolean };
    const db = readDb();
    const idx = db.notifications.findIndex((n) => n.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Notificação não encontrada.' });
      return;
    }

    if (activeBanner) {
      db.notifications.forEach((n) => {
        n.activeBanner = false;
      });
    }
    db.notifications[idx].activeBanner = Boolean(activeBanner);
    writeDb(db);
    res.json(db.notifications[idx]);
  });

  app.delete('/api/admin/notifications/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.notifications = db.notifications.filter((n) => n.id !== id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Prayer Requests
  app.patch('/api/admin/prayer-requests/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body as { status?: PrayerRequest['status'] };
    const db = readDb();
    const idx = db.prayerRequests.findIndex((p) => p.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }
    if (status) {
      db.prayerRequests[idx].status = status;
    }
    writeDb(db);
    res.json(db.prayerRequests[idx]);
  });

  app.delete('/api/admin/prayer-requests/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.prayerRequests = db.prayerRequests.filter((p) => p.id !== id);
    writeDb(db);
    res.json({ ok: true });
  });

  // Admin Settings & Full Database Backup
  app.put('/api/admin/settings', requireAdmin, (req, res) => {
    const body = req.body as Partial<ChurchSettings>;
    const db = readDb();
    db.settings = {
      ...db.settings,
      ...body,
    };
    writeDb(db);
    res.json(db.settings);
  });

  app.get('/api/admin/backup', requireAdmin, (_req, res) => {
    const db = readDb();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="paroquia-santa-isabel-backup.json"'
    );
    res.send(JSON.stringify(db, null, 2));
  });

  // Frontend serving: Vite middleware in dev, dist static in production / npm start
  const distDir = path.join(PROJECT_ROOT, 'frontend', 'dist');
  const fs = await import('node:fs');
  const hasBuiltDist = fs.existsSync(path.join(distDir, 'index.html'));
  const isProd =
    process.env.NODE_ENV === 'production' ||
    (process.env.npm_lifecycle_event === 'start' && hasBuiltDist);

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.join(PROJECT_ROOT, 'frontend', 'vite.config.ts'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
