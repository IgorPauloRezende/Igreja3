import type { PublicOverviewData } from '../components/PublicSite';

export const FALLBACK_OVERVIEW_DATA: PublicOverviewData = {
  settings: {
    churchName: 'Paróquia Rainha Santa Isabel',
    city: 'Casa Verde, São Paulo',
    address: 'Rua Elias Gannam, 331 · Vila Bandeirantes, São Paulo — SP',
    serviceTimes: `Igreja Matriz
Primeira sexta-feira do mês: 15h
Quarta-feira: 19h30
Domingo: 8h, 10h e 18h

Capela Maranata
Domingo: 11h30`,
    contactEmail: 'rainha_santaisabel@hotmail.com',
    whatsappNumber: '',
    liveStreamUrl: '',
    heroTitle: 'Paróquia Rainha Santa Isabel',
    heroSubtitle: '“Uma comunidade de fé, oração e acolhimento.”',
  },
  events: [
    {
      id: 'evt-1',
      title: 'Missa Solene em Honra a Santa Isabel',
      subtitle: 'Celebração com a comunidade e bênção especial',
      category: 'Celebrações',
      date: '2026-12-06',
      time: '18:00',
      location: 'Igreja Matriz',
      description: 'Venha celebrar conosco a Santa Missa em honra à nossa padroeira Santa Isabel da Hungria.',
      capacity: 250,
      coverKey: 'event_worship_night',
      featured: true,
      published: true,
      rsvpCount: 18,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'evt-2',
      title: 'Encontro da Juventude Acutis',
      subtitle: 'Louvor, adoração e partilha entre jovens',
      category: 'Pastorais & Grupos',
      date: '2026-11-28',
      time: '19:30',
      location: 'Salão Paroquial',
      description: 'Um espaço de formação, oração e convivência inspirado no Beato Carlo Acutis.',
      capacity: 100,
      coverKey: 'community_fellowship',
      featured: false,
      published: true,
      rsvpCount: 24,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ],
  sermons: [],
  activeBanner: null,
  recentNotifications: [],
  stats: {
    activeMembersCount: 120,
    subscriberCount: 85,
  },
};
