export type MediaKey =
  | 'hero_sanctuary'
  | 'sermon_series_cover'
  | 'event_worship_night'
  | 'community_fellowship';

export type EventCategory =
  | 'Celebrações'
  | 'Retiros & Formação'
  | 'Pastorais & Grupos'
  | 'Ação Social';

export type MemberStatus = 'Ativo' | 'Coordenador' | 'Visitante' | 'Inativo';

export type MinistryName =
  | 'Comunidade'
  | 'Liturgia'
  | 'Música'
  | 'Catequese'
  | 'Juventude Acutis'
  | 'Acolhimento'
  | 'Caridade'
  | 'Dízimo'
  | 'Pascom';

export type NotificationChannel = 'banner' | 'push' | 'whatsapp' | 'email';

export type PrayerStatus = 'Pendente' | 'Em Oração' | 'Atendido';

export interface ChurchSettings {
  churchName: string;
  city: string;
  address: string;
  serviceTimes: string;
  contactEmail: string;
  whatsappNumber: string;
  liveStreamUrl: string;
  heroTitle: string;
  heroSubtitle: string;
}

export interface EventRsvp {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  createdAt: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  subtitle: string;
  category: EventCategory;
  date: string;
  time: string;
  location: string;
  description: string;
  capacity: number;
  coverKey: MediaKey;
  featured: boolean;
  published: boolean;
  rsvps: EventRsvp[];
  createdAt: string;
}

export interface Sermon {
  id: string;
  title: string;
  series: string;
  preacher: string;
  date: string;
  duration: string;
  scripture: string;
  summary: string;
  keyTakeaways: string[];
  mediaUrl: string;
  coverKey: MediaKey;
  featured: boolean;
  published: boolean;
  createdAt: string;
}

export interface Member {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  ministry: MinistryName;
  baptismDate: string;
  birthDate: string;
  joinedAt: string;
  notes: string;
}

export interface ChurchNotification {
  id: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  targetGroup: string;
  activeBanner: boolean;
  linkLabel: string;
  linkSection: string;
  recipientCount: number;
  createdAt: string;
}

export interface NotificationSubscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  pushEnabled: boolean;
  topics: string[];
  createdAt: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  requestType: 'Oração' | 'Visita';
  message: string;
  status: PrayerStatus;
  createdAt: string;
}

export interface ParishionerAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  pastoral: MinistryName | 'Comunidade';
  passwordHash: string;
  createdAt: string;
}

export type SafeParishioner = Omit<ParishionerAccount, 'passwordHash'>;

export interface ChurchDatabase {
  settings: ChurchSettings;
  events: ChurchEvent[];
  sermons: Sermon[];
  members: Member[];
  notifications: ChurchNotification[];
  subscribers: NotificationSubscriber[];
  prayerRequests: PrayerRequest[];
  parishioners?: ParishionerAccount[];
}
