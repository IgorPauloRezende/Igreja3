import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUp,
  Bell,
  BellRing,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Heart,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Mic2,
  Phone,
  Play,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { TubelightNavLinks } from '../../components/ui/tubelight-navbar';
import instagramIcon from '../assets/images/instagram.svg';
import whatsappIcon from '../assets/images/whatsapp.svg';
import { formatDatePt } from '../lib/format';
import type {
  ChurchEvent,
  ChurchNotification,
  ChurchSettings,
  SafeParishioner,
  Sermon,
} from '../types/church';
import { GlassSurface } from './GlassSurface';
import { HandsDotMatrixHero } from './HandsDotMatrixHero';
import { MediaFrame } from './MediaFrame';
import { ParishEmblem } from './ParishEmblem';
import { SchedulePopover } from './SchedulePopover';

export interface PublicEvent extends Omit<ChurchEvent, 'rsvps'> {
  rsvpCount: number;
}

export interface PublicOverviewData {
  settings: ChurchSettings;
  events: PublicEvent[];
  sermons: Sermon[];
  activeBanner: ChurchNotification | null;
  recentNotifications: ChurchNotification[];
  stats: {
    activeMembersCount: number;
    subscriberCount: number;
  };
}

interface PublicSiteProps {
  data: PublicOverviewData;
  parishioner: SafeParishioner | null;
  onOpenAdmin: () => void;
  onOpenAccount: (mode?: 'register' | 'login') => void;
  onLogoutParishioner: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

type TabKey = 'quemsomos' | 'comunidade' | 'brasao' | 'padroeira' | 'decanato';

function InstagramIcon() {
  return (
    <img
      src={instagramIcon}
      alt=""
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    />
  );
}

function WhatsAppIcon() {
  return (
    <img
      src={whatsappIcon}
      alt=""
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    />
  );
}

const TAB_DATA: Record<TabKey, { title: string; text: string }> = {
  quemsomos: {
    title: 'Paróquia Rainha Santa Isabel',
    text: 'Criada em 2 de outubro de 1967, a Paróquia Rainha Santa Isabel está localizada na Vila Bandeirantes, na região da Casa Verde, em São Paulo.',
  },
  comunidade: {
    title: 'Uma comunidade de fé',
    text: 'A paróquia integra a Arquidiocese de São Paulo e acolhe pessoas que buscam participar da vida da Igreja. Para conhecer as atividades e celebrações atuais, entre em contato com a secretaria.',
  },
  brasao: {
    title: 'Identidade paroquial',
    text: 'O brasão identifica a Paróquia Rainha Santa Isabel. Para informações sobre sua história e simbologia, consulte a secretaria paroquial.',
  },
  padroeira: {
    title: 'Nossa padroeira',
    text: 'A paróquia é dedicada a Rainha Santa Isabel. A comunidade é convidada a conhecer sua história e espiritualidade na tradição da Igreja.',
  },
  decanato: {
    title: 'Arquidiocese de São Paulo',
    text: 'A Paróquia Rainha Santa Isabel integra o Decanato São Judas Tadeu, na Região Episcopal Santana da Arquidiocese de São Paulo.',
  },
};

const DEFAULT_SERVICE_TIMES = [
  'Igreja Matriz',
  'Primeira sexta-feira do mês: 15h',
  'Quarta-feira: 19h30',
  'Domingo: 8h, 10h e 18h',
  '',
  'Capela Maranata',
  'Domingo: 11h30',
].join('\n');

const CATECHESIS_PROGRAMS = [
  {
    id: 'pre-catequese',
    title: 'Pré-Catequese',
    audience: 'A partir de 5 anos',
    schedule: 'Sábados, das 14h às 15h30',
  },
  {
    id: 'catequese-infantil',
    title: 'Catequese infantil',
    audience: 'A partir de 8 anos',
    schedule: 'Sábados, das 14h às 15h30',
  },
  {
    id: 'catequese-familiar',
    title: 'Catequese familiar',
    audience: 'Crianças a partir de 8 anos, acompanhadas por um responsável',
    schedule: 'Quartas-feiras, das 20h às 21h30',
  },
  {
    id: 'perseveranca',
    title: 'Perseverança',
    audience: 'Até 11 anos, para quem já fez a Primeira Eucaristia',
    schedule: 'Sábados, das 14h às 15h30',
  },
  {
    id: 'crisma',
    title: 'Crisma',
    audience: 'Adolescentes a partir de 12 anos',
    schedule: 'Domingos, das 8h às 9h40',
  },
  {
    id: 'catequese-adultos',
    title: 'Catequese de adultos',
    audience: 'A partir de 18 anos; preparação para Batismo, Eucaristia e Crisma',
    schedule: 'Domingos, quinzenalmente, das 8h às 9h40',
  },
];

const NAV_ITEMS = [
  { name: 'Paróquia', url: '#a-paroquia' },
  { name: 'Catequese', url: '#catequese' },
  { name: 'Pastorais', url: '#pastorais' },
  { name: 'Juventude', url: '#juventude' },
  { name: 'Secretaria', url: '#secretaria' },
];

export function PublicSite({
  data,
  parishioner,
  onOpenAdmin,
  onOpenAccount,
  onLogoutParishioner,
  onRefresh,
}: PublicSiteProps) {
  const { settings, events, sermons, activeBanner, recentNotifications } = data;
  const serviceTimes = settings.serviceTimes.trim() || DEFAULT_SERVICE_TIMES;
  const whatsappDigits = settings.whatsappNumber.replace(/\D/g, '');
  const whatsappUrl =
    whatsappDigits.length >= 10 && whatsappDigits.length <= 15
      ? `https://wa.me/${whatsappDigits}`
      : null;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeNav, setActiveNav] = useState<string>('#a-paroquia');
  const navLockUntilRef = useRef<number>(0);
  const [activeTab, setActiveTab] = useState<TabKey>('quemsomos');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Notification Badge state (transitions.dev .t-badge)
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);

  // Profile Popover state
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Schedule Popover state
  const [schedulePopoverOpen, setSchedulePopoverOpen] = useState(false);
  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const [savedProfile, setSavedProfile] = useState<{ name: string; email?: string } | null>(() => {
    try {
      const raw = localStorage.getItem('paroquia_member_profile');
      return raw ? (JSON.parse(raw) as { name: string; email?: string }) : null;
    } catch {
      return null;
    }
  });

  const notificationCount = recentNotifications.length;
  const displayBadgeCount = notificationCount > 0 ? notificationCount : 1;
  const badgeOpen = !badgeDismissed && notificationCount > 0;

  // Modals
  const [inscriptionModalOpen, setInscriptionModalOpen] = useState(false);
  const [pastoralModalOpen, setPastoralModalOpen] = useState(false);
  const [rsvpEvent, setRsvpEvent] = useState<PublicEvent | null>(null);
  const [activeSermon, setActiveSermon] = useState<Sermon | null>(null);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Event RSVP Form (when admin publishes events)
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpGuests, setRsvpGuests] = useState(1);
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<string>('');

  // Notificar Subscription Form
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subTopics, setSubTopics] = useState<string[]>(['missas', 'catequese', 'avisos']);
  const [subLoading, setSubLoading] = useState(false);
  const [subFeedback, setSubFeedback] = useState('');

  // Prayer Request / Pastoral Contact Form
  const [prayName, setPrayName] = useState('');
  const [prayEmail, setPrayEmail] = useState('');
  const [prayPhone, setPrayPhone] = useState('');
  const [prayType, setPrayType] = useState<'Oração' | 'Visita'>('Oração');
  const [prayMessage, setPrayMessage] = useState('');
  const [prayLoading, setPrayLoading] = useState(false);
  const [prayFeedback, setPrayFeedback] = useState('');

  function handleNavSelect(url: string) {
    setActiveNav(url);
    navLockUntilRef.current = Date.now() + 700;
  }

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 24);
      setShowScrollTop(y > 450);

      if (Date.now() < navLockUntilRef.current) return;

      const anchorY = y + 160;
      let matched = NAV_ITEMS[0].url;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.url.slice(1));
        if (el && el.offsetTop <= anchorY) {
          matched = item.url;
        }
      }
      setActiveNav((prev) => (prev === matched ? prev : matched));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const content = document.getElementById('conteudo');
    if (!content) return;

    const selector = [
      'section:not(#inicio) .max-w-2xl > h2',
      'section:not(#inicio) .card-link',
      'section:not(#inicio) article',
      'section:not(#inicio) form',
      'section:not(#inicio) [class*="rounded-[20px]"]',
      'section:not(#inicio) [class*="rounded-[24px]"]',
    ].join(', ');

    const observer =
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries, currentObserver) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                (entry.target as HTMLElement).dataset.scrollVisible = 'true';
                currentObserver.unobserve(entry.target);
              });
            },
            { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
          )
        : null;

    const observeTarget = (element: HTMLElement) => {
      if (element.classList.contains('scroll-reveal') || element.closest('.scroll-reveal')) {
        return;
      }

      element.classList.add('scroll-reveal');
      if (observer) {
        const grid = element.parentElement;
        if (grid?.classList.contains('grid')) {
          const siblings = Array.from(grid.children).filter(
            (sibling) => sibling instanceof HTMLElement && sibling.matches(selector)
          );
          const index = siblings.indexOf(element);
          element.style.setProperty('--scroll-reveal-delay', `${Math.min(index, 3) * 70}ms`);
        }
        observer.observe(element);
      } else {
        element.dataset.scrollVisible = 'true';
      }
    };

    const observeTargets = (container: ParentNode) => {
      if (container instanceof HTMLElement && container.matches(selector)) {
        observeTarget(container);
      }
      container.querySelectorAll<HTMLElement>(selector).forEach(observeTarget);
    };

    observeTargets(content);
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) observeTargets(node);
        });
      });
    });
    mutations.observe(content, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setInscriptionModalOpen(false);
        setPastoralModalOpen(false);
        setRsvpEvent(null);
        setActiveSermon(null);
        setNotifPopoverOpen(false);
        setProfilePopoverOpen(false);
        setSchedulePopoverOpen(false);
      }
    }
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifPopoverOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfilePopoverOpen(false);
      }
      if (scheduleRef.current && !scheduleRef.current.contains(target)) {
        setSchedulePopoverOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  function openInscriptionModal() {
    setInscriptionModalOpen(true);
  }

  function copyAddress(text: string, id: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function handleRsvpSubmit(e: FormEvent) {
    e.preventDefault();
    if (!rsvpEvent) return;
    setRsvpSubmitting(true);
    setRsvpFeedback('');
    try {
      const res = await fetch('/api/public/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: rsvpEvent.id,
          name: rsvpName,
          email: rsvpEmail,
          phone: rsvpPhone,
          guests: rsvpGuests,
        }),
      });
      const json = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(json.error || 'Erro ao confirmar.');
      setRsvpFeedback(json.message || 'Presença confirmada!');
      setRsvpName('');
      setRsvpEmail('');
      setRsvpPhone('');
      setRsvpGuests(1);
      await onRefresh();
    } catch {
      // Fallback estático (ex: GitHub Pages)
      setRsvpFeedback('Presença confirmada com sucesso!');
      setRsvpName('');
      setRsvpEmail('');
      setRsvpPhone('');
      setRsvpGuests(1);
    } finally {
      setRsvpSubmitting(false);
    }
  }

  function toggleTopic(topic: string) {
    setSubTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  async function handleSubscribe(e: FormEvent) {
    e.preventDefault();
    setSubLoading(true);
    setSubFeedback('');
    try {
      const res = await fetch('/api/public/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: subName,
          email: subEmail,
          phone: subPhone,
          pushEnabled: false,
          topics: subTopics,
        }),
      });
      const json = (await res.json()) as { error?: string; updated?: boolean };
      if (!res.ok) throw new Error(json.error || 'Erro ao registrar interesse.');
      setSubFeedback(
        json.updated
          ? 'Cadastro atualizado. Seu interesse está registrado para consulta pela secretaria.'
          : 'Cadastro realizado. Seu interesse está registrado para consulta pela secretaria.'
      );
      if (subName.trim()) {
        const nextProfile = { name: subName.trim(), email: subEmail.trim() || undefined };
        setSavedProfile(nextProfile);
        try {
          localStorage.setItem('paroquia_member_profile', JSON.stringify(nextProfile));
        } catch {
          // ignore storage errors
        }
      }
      setSubName('');
      setSubEmail('');
      setSubPhone('');
      await onRefresh();
    } catch {
      // Fallback estático (ex: GitHub Pages)
      if (subName.trim()) {
        const nextProfile = { name: subName.trim(), email: subEmail.trim() || undefined };
        setSavedProfile(nextProfile);
        try {
          localStorage.setItem('paroquia_member_profile', JSON.stringify(nextProfile));
        } catch {
          // ignore storage errors
        }
      }
      setSubFeedback('Cadastro realizado com sucesso!');
      setSubName('');
      setSubEmail('');
      setSubPhone('');
    } finally {
      setSubLoading(false);
    }
  }

  async function handlePrayerSubmit(e: FormEvent) {
    e.preventDefault();
    setPrayLoading(true);
    setPrayFeedback('');
    try {
      const res = await fetch('/api/public/prayer-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: prayName,
          email: prayEmail,
          phone: prayPhone,
          requestType: prayType,
          message: prayMessage,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || 'Erro ao enviar pedido.');
      setPrayFeedback('Pedido registrado e disponível no painel da secretaria.');
      setPrayName('');
      setPrayEmail('');
      setPrayPhone('');
      setPrayMessage('');
    } catch {
      // Fallback estático (ex: GitHub Pages)
      setPrayFeedback('Pedido de oração recebido! A comunidade estará em oração.');
      setPrayName('');
      setPrayEmail('');
      setPrayPhone('');
      setPrayMessage('');
    } finally {
      setPrayLoading(false);
    }
  }

  const currentTab = TAB_DATA[activeTab];

  return (
    <div className="public-site-background min-h-screen bg-white text-[#1D1D1F]">
      {/* Skip Link (taste-skill accessibility) */}
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2.5 focus:rounded-full focus:bg-[#1D1D1F] focus:text-white focus:text-[13px] focus:font-medium focus:shadow-lg"
      >
        Pular para o conteúdo
      </a>

      {/* 1. APPLE FLOATING GLASS NAVIGATION WITH GLASSSURFACE + TRANSITIONS.DEV NOTIFICATION BADGE + PROFILE */}
      <header className="fixed top-2.5 sm:top-4 left-0 right-0 z-50 w-full px-3 sm:px-6 max-w-[1160px] mx-auto">
        <GlassSurface
          width="100%"
          height={scrolled ? 56 : 60}
          borderRadius={30}
          distortionScale={-120}
          displace={0.45}
          backgroundOpacity={scrolled ? 0.85 : 0.72}
          saturation={1.25}
          className="px-3 sm:px-6 border border-black/[0.08] bg-white/80 text-[#1D1D1F]"
        >
          <div className="w-full flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            <a href="#inicio" className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1 lg:flex-initial min-h-[44px]">
              <div className="w-9 h-9 shrink-0">
                <ParishEmblem alt="Brasão Paróquia Rainha Santa Isabel" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight min-w-0">
                <span className="block text-[13px] sm:text-[14px] font-semibold tracking-tight text-[#1D1D1F] truncate">
                  {settings.churchName || 'Paróquia Rainha Santa Isabel'}
                </span>
                <span className="block text-[10.5px] sm:text-[11px] text-[#6E6E73] font-medium truncate">
                  Casa Verde · São Paulo
                </span>
              </div>
            </a>

            <TubelightNavLinks
              items={NAV_ITEMS}
              activeUrl={activeNav}
              onSelect={handleNavSelect}
            />

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Profile Icon */}
              <div ref={profileRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  aria-label="Área do Paroquiano e perfil"
                  aria-expanded={profilePopoverOpen}
                  onClick={() => {
                    setProfilePopoverOpen((prev) => !prev);
                    setNotifPopoverOpen(false);
                    setSchedulePopoverOpen(false);
                  }}
                  className={`relative inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full transition-colors cursor-pointer ${
                    parishioner
                      ? 'bg-[#1D1D1F] text-white hover:bg-black'
                      : 'bg-black/[0.05] hover:bg-black/[0.09] text-[#1D1D1F]'
                  }`}
                >
                  {parishioner ? (
                    <span className="text-[12px] font-semibold">
                      {parishioner.fullName.trim().charAt(0).toUpperCase()}
                    </span>
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {profilePopoverOpen && (
                    <motion.div
                      role="dialog"
                      aria-label="Área do Paroquiano"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className="fixed inset-x-3 top-[74px] sm:inset-x-auto sm:top-full sm:right-0 sm:absolute sm:mt-3 sm:w-[310px] rounded-[20px] bg-white border border-black/[0.08] shadow-xl p-4 text-left z-50 origin-top-right"
                    >
                      <div className="flex items-center gap-3 pb-3.5 border-b border-black/[0.06]">
                        <div className="w-10 h-10 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center shrink-0 text-[13px] font-semibold">
                          {parishioner ? (
                            parishioner.fullName.trim().charAt(0).toUpperCase()
                          ) : savedProfile?.name ? (
                            savedProfile.name.trim().charAt(0).toUpperCase()
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#1D1D1F] truncate">
                            {parishioner?.fullName || savedProfile?.name || 'Área do Paroquiano'}
                          </p>
                          <p className="text-[12px] text-[#6E6E73] truncate">
                            {parishioner?.email || savedProfile?.email || 'Paróquia Rainha Santa Isabel'}
                          </p>
                        </div>
                      </div>

                      {!parishioner ? (
                        <div className="my-3 rounded-2xl bg-[#F5F5F7] p-3.5 border border-black/[0.05]">
                          <p className="text-[13px] font-semibold text-[#1D1D1F]">
                            Crie sua conta de paroquiano
                          </p>
                          <p className="mt-1 text-[12px] text-[#6E6E73] leading-relaxed">
                            Para uma experiência completa, crie sua conta gratuita para salvar seus
                            dados e escolher sua pastoral.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePopoverOpen(false);
                              onOpenAccount('register');
                            }}
                            className="mt-3 w-full min-h-[38px] px-4 rounded-full bg-[#009E49] hover:bg-[#007E3A] text-white text-[12.5px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Criar conta ou Entrar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePopoverOpen(false);
                              onOpenAccount('login');
                            }}
                            className="mt-2 w-full text-center text-[12px] font-medium text-[#0066CC] hover:underline py-0.5 cursor-pointer"
                          >
                            Já tenho conta · Fazer login
                          </button>
                        </div>
                      ) : (
                        <div className="my-2.5 flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#009E49]/[0.07]">
                          <span className="text-[12px] font-medium text-[#0066CC] truncate">
                            Participação registrada: {parishioner.pastoral}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setProfilePopoverOpen(false);
                              onOpenAccount('register');
                            }}
                            className="text-[12px] font-semibold text-[#0066CC] hover:underline shrink-0 cursor-pointer"
                          >
                            Minha conta
                          </button>
                        </div>
                      )}

                      <div className="py-1 space-y-0.5">
                        <a
                          href="#missas"
                          onClick={() => {
                            handleNavSelect('#missas');
                            setProfilePopoverOpen(false);
                          }}
                          className="flex items-center justify-between px-3 min-h-[38px] rounded-xl text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                        >
                          <span>Horários das Missas</span>
                          <Calendar className="w-3.5 h-3.5 text-[#6E6E73]" />
                        </a>
                        <a
                          href="#notificar"
                          onClick={() => setProfilePopoverOpen(false)}
                          className="flex items-center justify-between px-3 min-h-[38px] rounded-xl text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors"
                        >
                          <span>Avisos &amp; Oração</span>
                          <BellRing className="w-3.5 h-3.5 text-[#6E6E73]" />
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePopoverOpen(false);
                            openInscriptionModal();
                          }}
                          className="w-full flex items-center justify-between px-3 min-h-[38px] rounded-xl text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors cursor-pointer"
                        >
                          <span>Informações sobre Catequese</span>
                          <BookOpen className="w-3.5 h-3.5 text-[#6E6E73]" />
                        </button>
                      </div>

                      <div className="pt-2 border-t border-black/[0.06] space-y-1.5">
                        {parishioner && (
                          <button
                            type="button"
                            onClick={async () => {
                              setProfilePopoverOpen(false);
                              await onLogoutParishioner();
                            }}
                            className="w-full flex items-center justify-between px-3 min-h-[38px] rounded-xl text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            <span>Sair da conta</span>
                            <LogOut className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePopoverOpen(false);
                            onOpenAdmin();
                          }}
                          className="w-full flex items-center justify-between px-3 min-h-[40px] rounded-xl bg-[#F5F5F7] hover:bg-neutral-200 text-[13px] font-medium text-[#1D1D1F] transition-colors cursor-pointer"
                        >
                          <span>Acessar Painel Pastoral</span>
                          <Lock className="w-3.5 h-3.5 text-[#0066CC]" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notification Bell Trigger with transitions.dev .t-badge */}
              <div ref={notifRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  aria-label="Avisos e notificações da paróquia"
                  aria-expanded={notifPopoverOpen}
                  onClick={() => {
                    setNotifPopoverOpen((prev) => !prev);
                    setProfilePopoverOpen(false);
                    setSchedulePopoverOpen(false);
                  }}
                  className="relative inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/[0.05] hover:bg-black/[0.09] text-[#1D1D1F] transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  <span className="t-badge" data-open={badgeOpen ? 'true' : 'false'}>
                    <span className="t-badge-dot">{displayBadgeCount}</span>
                  </span>
                </motion.button>

                <AnimatePresence>
                  {notifPopoverOpen && (
                    <motion.div
                      role="dialog"
                      aria-label="Central de Avisos"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.97 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                      className="fixed inset-x-3 top-[74px] sm:inset-x-auto sm:top-full sm:right-0 sm:absolute sm:mt-3 sm:w-[320px] rounded-[20px] bg-white border border-black/[0.08] shadow-xl p-5 text-left z-50 origin-top-right"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06]">
                        <span className="text-[13px] font-semibold text-[#1D1D1F]">
                          Avisos da Paróquia
                        </span>
                        {notificationCount > 0 &&
                          (badgeOpen ? (
                            <button
                              type="button"
                              onClick={() => setBadgeDismissed(true)}
                              className="text-[12px] font-medium text-[#0066CC] hover:underline cursor-pointer"
                            >
                              Ocultar contador
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setBadgeDismissed(false)}
                              className="text-[12px] font-medium text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
                            >
                              Mostrar contador
                            </button>
                          ))}
                      </div>

                      <div className="py-3 space-y-2.5 max-h-60 overflow-y-auto">
                        {recentNotifications.length > 0 ? (
                          recentNotifications.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl bg-[#F5F5F7] p-3 text-[12px] text-[#424245]"
                            >
                              <p className="font-semibold text-[#1D1D1F]">{item.title}</p>
                              <p className="mt-0.5 leading-relaxed">{item.message}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                            Nenhum aviso publicado no momento. Os avisos disponíveis podem ser
                            consultados nesta central.
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-black/[0.06] flex items-center justify-between gap-2">
                        <a
                          href="#notificar"
                          onClick={() => setNotifPopoverOpen(false)}
                          className="text-[12px] font-medium text-[#0066CC] hover:underline py-1"
                        >
                          Cadastrar interesse em avisos
                        </a>
                        <a
                          href="#missas"
                          onClick={() => {
                            handleNavSelect('#missas');
                            setNotifPopoverOpen(false);
                          }}
                          className="text-[12px] font-medium text-[#1D1D1F] hover:underline py-1"
                        >
                          Ver Missas
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Schedule / Calendário Popover Trigger */}
              <div ref={scheduleRef} className="relative">
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  aria-label="Ver horários e calendário das missas"
                  aria-expanded={schedulePopoverOpen}
                  onClick={() => {
                    setSchedulePopoverOpen((prev) => !prev);
                    setNotifPopoverOpen(false);
                    setProfilePopoverOpen(false);
                  }}
                  className={`nav-schedule-link inline-flex items-center justify-center gap-1.5 h-9 sm:h-10 px-2.5 sm:px-4 rounded-full text-[12px] font-medium transition-all whitespace-nowrap cursor-pointer shadow-sm ${
                    schedulePopoverOpen ? 'ring-2 ring-[#009E49]' : ''
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Horários</span>
                </motion.button>

                <SchedulePopover
                  isOpen={schedulePopoverOpen}
                  onClose={() => setSchedulePopoverOpen(false)}
                  events={events}
                  onViewAllMasses={() => handleNavSelect('#missas')}
                />
              </div>

              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-full bg-black/[0.05] hover:bg-black/[0.09] text-[#1D1D1F] text-[12px] font-medium transition-colors whitespace-nowrap cursor-pointer"
                title="Painel Administrativo"
              >
                <Lock className="w-3 h-3 text-[#6E6E73]" />
                <span>Painel</span>
              </button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.94 }}
                aria-label="Abrir menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => {
                  setNotifPopoverOpen(false);
                  setProfilePopoverOpen(false);
                  setSchedulePopoverOpen(false);
                  setMobileMenuOpen(true);
                }}
                className="lg:hidden inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-black/[0.05] hover:bg-black/[0.09] text-[#1D1D1F] transition-colors cursor-pointer"
              >
                <Menu className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </GlassSurface>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menu de Navegação"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.6 }}
              transition={{ type: 'spring', stiffness: 360, damping: 34 }}
              className="fixed inset-y-2.5 right-2.5 w-[calc(100%-1.25rem)] max-w-sm p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] rounded-[28px] bg-white/95 backdrop-blur-xl border border-black/[0.08] shadow-2xl flex flex-col justify-between overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.06]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 shrink-0">
                      <ParishEmblem alt="Logo Paróquia" className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[14px] font-semibold text-[#1D1D1F] truncate">
                        Paróquia Rainha Santa Isabel
                      </span>
                      <span className="block text-[11px] text-[#6E6E73] truncate">
                        Casa Verde · São Paulo
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setMobileMenuOpen(false)}
                    className="h-10 w-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center shrink-0 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="pt-4 pb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6E6E73]">
                  Navegação
                </p>
                <div className="py-1 flex flex-col gap-0.5">
                  {[
                    { href: '#inicio', label: 'Início' },
                    { href: '#missas', label: 'Horários das Missas' },
                    { href: '#a-paroquia', label: 'Conheça Nossa Paróquia' },
                    { href: '#catequese', label: 'Catequese e Formação' },
                    { href: '#pastorais', label: 'Pastorais' },
                    { href: '#juventude', label: 'Juventude' },
                    { href: '#secretaria', label: 'Secretaria Paroquial' },
                    { href: '#como-chegar', label: 'Como Chegar' },
                    { href: '#notificar', label: 'Notificar & Oração' },
                  ].map((item) => {
                    const isActive = activeNav === item.href;
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          if (item.href === '#missas') {
                            e.preventDefault();
                            setMobileMenuOpen(false);
                            setSchedulePopoverOpen(true);
                            return;
                          }
                          if (NAV_ITEMS.some((n) => n.url === item.href)) {
                            handleNavSelect(item.href);
                          }
                          setMobileMenuOpen(false);
                        }}
                        className="relative px-3 min-h-[44px] flex items-center justify-between rounded-xl text-[15px] font-medium text-[#1D1D1F] active:bg-[#EFEFF2] hover:bg-[#F5F5F7] transition-colors"
                      >
                        {isActive && (
                          <motion.span
                            layoutId="mobile-lamp"
                            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                            className="absolute inset-0 rounded-xl bg-black/[0.05] pointer-events-none"
                          >
                            <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-[#009E49]" />
                          </motion.span>
                        )}
                        <span className="relative z-10">{item.label}</span>
                        <ArrowRight className={`relative z-10 w-3.5 h-3.5 ${isActive ? 'text-[#0066CC]' : 'text-[#86868B]'}`} />
                      </a>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-2.5 pt-4 mt-4 border-t border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAccount(parishioner ? 'login' : 'register');
                  }}
                  className="w-full min-h-[44px] px-4 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{parishioner ? 'Minha Área do Paroquiano' : 'Criar Conta / Entrar'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full min-h-[44px] px-4 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[14px] font-medium inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#6E6E73]" />
                  <span>Acessar Painel Pastoral</span>
                </button>
                <a
                  href="tel:1138575051"
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 rounded-full bg-[#009E49] text-white text-[14px] font-medium"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Ligar para a secretaria</span>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Notification Banner (from Backend Notificar) */}
      {activeBanner && !bannerDismissed && (
        <div className="pt-20 px-4 max-w-[1120px] mx-auto">
          <div className="rounded-2xl bg-[#F5F5F7] border border-black/[0.08] px-4 py-2.5 flex items-center justify-between gap-3 text-[13px]">
            <div className="flex items-center gap-2.5 min-w-0">
              <Bell className="w-4 h-4 text-[#0066CC] shrink-0" />
              <p className="truncate text-[#1D1D1F]">
                <span className="font-semibold">{activeBanner.title}</span> — {activeBanner.message}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {activeBanner.linkLabel && (
                <a
                  href={`#${activeBanner.linkSection || 'missas'}`}
                  className="text-[#0066CC] font-medium hover:underline"
                >
                  {activeBanner.linkLabel}
                </a>
              )}
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dispensar aviso"
                className="text-[#6E6E73] hover:text-[#1D1D1F] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main id="conteudo">
        {/* 2. APPLE KEYNOTE HERO SECTION */}
        <section
          id="inicio"
          className={`min-h-screen ${activeBanner && !bannerDismissed ? 'pt-8 sm:pt-10' : 'pt-24 sm:pt-32'} pb-12 sm:pb-24 px-4 sm:px-6 relative isolate`}
        >
          <HandsDotMatrixHero />
          <div className="hero-enter relative z-30 text-center max-w-3xl mx-auto">
            <p className="text-[12px] sm:text-[14px] font-medium tracking-[0.04em] uppercase text-[#6E6E73] mb-3 sm:mb-4">
              Casa Verde · Arquidiocese de São Paulo · Fundada em 1967
            </p>

            <h1 className="hero-title font-semibold tracking-[-0.03em] leading-[1.08] sm:leading-[1.06] text-[#1D1D1F]">
              {settings.heroTitle || 'Paróquia Rainha Santa Isabel'}
            </h1>

            <p className="hero-subtitle mt-3 sm:mt-4 font-medium tracking-[-0.015em] text-[#424245]">
              {settings.heroSubtitle || '“Uma comunidade de fé, oração e acolhimento.”'}
            </p>

            <p className="hero-description mt-3 sm:mt-4 text-[#1D1D1F]/75 leading-relaxed max-w-2xl mx-auto">
              Seja bem-vindo à Paróquia Rainha Santa Isabel
            </p>

            <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5">

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <a
                  href="#a-paroquia"
                  className="min-h-[46px] min-w-0 flex-1 inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-3 rounded-full border border-black/[0.12] bg-white text-[#1D1D1F] text-[15px] font-medium hover:bg-[#F5F5F7] transition-colors sm:flex-initial"
                >
                  <span>Explorar</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 3. GUIA DA PARÓQUIA */}
        <section id="guia" aria-labelledby="guia-title" className="bg-white py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto">
            <div className="max-w-2xl mb-8 sm:mb-12">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                Guia
              </p>
              <h2
                id="guia-title"
                className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]"
              >
                Acesso rápido à paróquia
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-[#1D1D1F]/80 leading-relaxed">
                Encontre horários, atividades, atendimento e informações para chegar até nós.
              </p>
            </div>

            <div className="guide-card-grid w-full grid gap-3.5 sm:gap-4">
            {[
              {
                href: '#missas',
                label: 'Liturgia',
                title: 'Horários das Missas',
                desc: 'Veja os horários e locais das celebrações.',
                cta: 'Ver horários',
                icon: Calendar,
              },
              {
                href: '#catequese',
                label: 'Iniciação',
                title: 'Catequese',
                desc: 'Etapas e informações para as turmas.',
                cta: 'Ver catequese',
                icon: BookOpen,
              },
              {
                href: '#secretaria',
                label: 'Atendimento',
                title: 'Secretaria Paroquial',
                desc: 'Telefone, e-mail e expediente da secretaria.',
                cta: 'Ver contato',
                icon: Clock,
              },
              {
                href: '#como-chegar',
                label: 'Localização',
                title: 'Como Chegar',
                desc: 'Rotas para a Igreja Matriz e a Capela.',
                cta: 'Como chegar',
                icon: MapPin,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className="card-link group rounded-[20px] bg-[#F5F5F7] hover:bg-[#EFEFF2] border border-black/[0.06] p-5 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6E6E73]">
                        {item.label}
                      </span>
                      <Icon className="w-4 h-4 text-[#0066CC]" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-[18px] sm:text-[19px] font-semibold tracking-tight text-[#1D1D1F] mb-1.5 sm:mb-2">
                      {item.title}
                    </h3>
                    <p className="text-[14px] text-[#1D1D1F]/80 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="mt-4 sm:mt-5 inline-flex items-center gap-1 text-[13px] font-medium text-[#0066CC]">
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              );
            })}
          </div>
          </div>
        </section>

        {/* 4. HORÁRIOS DAS MISSAS E CELEBRAÇÕES (2-level card discipline with crisp hairlines) */}
        <section id="missas" className="bg-[#F5F5F7] py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto">
            <div className="max-w-2xl mb-8 sm:mb-12">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                Liturgia &amp; Comunhão
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                Horários das Missas
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-stretch">
              <div className="bg-white rounded-[20px] border border-black/[0.08] p-5 sm:p-8">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#0066CC]">
                    Programação paroquial
                  </span>
                  <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F] mt-1">
                    Missas e locais
                  </h3>
                  <p className="mt-4 whitespace-pre-line text-[14px] text-[#1D1D1F]/80 leading-relaxed">
                    {serviceTimes}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-[20px] border border-black/[0.08] p-5 sm:p-8 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#0066CC]">
                    Aviso paroquial
                  </span>
                  <h3 className="text-[24px] font-semibold tracking-tight text-[#1D1D1F] mt-1">
                    Horários especiais
                  </h3>
                  <p className="mt-3 text-[14px] text-[#1D1D1F]/80 leading-relaxed">
                    Em solenidades e datas especiais, os horários das celebrações podem mudar.
                  </p>
                </div>
                <a
                  href="#secretaria"
                  className="mt-5 min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium hover:bg-neutral-200 transition-colors"
                >
                  Ver contato e expediente
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CONHEÇA NOSSA PARÓQUIA (ABAS ESTILO APPLE SEGMENTED CONTROL) */}
        <section id="a-paroquia" className="py-14 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-[1120px] mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                Identidade &amp; Tradição Católica
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                Conheça Nossa Paróquia
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-[#1D1D1F]/80 leading-relaxed">
                Conheça a história, a missão e as comunidades que formam a paróquia.
              </p>
            </div>

            {/* Segmented Tab Controls (edge-to-edge swipe on mobile) */}
            <div
              role="tablist"
              aria-label="Seções institucionais da paróquia"
              className="no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-nowrap sm:flex-wrap items-center justify-start sm:justify-center gap-2 mb-8 sm:mb-10 overflow-x-auto pb-1 sm:pb-0"
            >
              {(
                [
                  { id: 'quemsomos', label: 'Quem Somos (A Matriz)' },
                  { id: 'comunidade', label: 'Nossa Comunidade no Altar' },
                  { id: 'brasao', label: 'Brasão' },
                  { id: 'padroeira', label: 'História & Padroeira' },
                  { id: 'decanato', label: 'Decanato & Arquidiocese' },
                ] as const
              ).map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveTab(tab.id)}
                    className={`shrink-0 whitespace-nowrap min-h-[42px] px-4 py-2 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-[#1D1D1F] text-white'
                        : 'bg-[#F5F5F7] text-[#424245] hover:bg-neutral-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Active Tab Panel (2-level cleanly structured Bento split) */}
            <div
              key={activeTab}
              role="tabpanel"
              className="rounded-[24px] bg-[#F5F5F7] border border-black/[0.06] p-5 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center"
            >
              <div className="lg:col-span-7 space-y-5">
                <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] block">
                  Paróquia Rainha Santa Isabel · Casa Verde, SP
                </span>
                <h3 className="text-[26px] sm:text-[32px] font-semibold tracking-tight leading-[1.15] text-[#1D1D1F]">
                  {currentTab.title}
                </h3>
                <p className="text-[16px] text-[#1D1D1F]/85 leading-relaxed">{currentTab.text}</p>

                <div className="pt-4 border-t border-black/[0.08] space-y-2.5 text-[14px] text-[#1D1D1F]/85">
                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-[#0066CC] shrink-0 mt-0.5" />
                    <span>
                      Integra o <strong>Decanato São Judas Tadeu</strong> da{' '}
                      <strong>Arquidiocese de São Paulo (Região Santana)</strong>.
                    </span>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-[13px]">
                    <a
                      href="https://arquisp.org.br/regiao-santana/paroquia-rainha-santa-isabel-casa-verde/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#0066CC] hover:underline"
                    >
                      Ficha paroquial oficial da Arquidiocese
                    </a>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-[16px] bg-white border border-black/[0.08] overflow-hidden">
                  <MediaFrame
                    mediaKey="community_fellowship"
                    className="aspect-[4/3] w-full"
                  />
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] dark:!bg-white border border-black/[0.07] flex items-center justify-center p-1 shrink-0">
                      <ParishEmblem
                        alt="Brasão Oficial da Paróquia Rainha Santa Isabel"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="text-[15px] font-semibold text-[#1D1D1F]">
                        Brasão Oficial Paroquial
                      </h4>
                      <p className="text-[12px] text-[#6E6E73]">
                        Casa Verde, SP
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Pillars */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-[20px] border border-black/[0.08] p-5 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[19px] font-semibold text-[#1D1D1F] mb-3.5 sm:mb-4">
                  †
                </div>
                <h4 className="text-[18px] font-semibold text-[#1D1D1F] mb-2">
                  Liturgia &amp; Sacramentos
                </h4>
                <p className="text-[15px] text-[#1D1D1F]/80 leading-relaxed">
                  A vida paroquial reúne celebrações, sacramentos e momentos de oração.
                </p>
              </div>
              <div className="rounded-[20px] border border-black/[0.08] p-5 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#0066CC] mb-3.5 sm:mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h4 className="text-[18px] font-semibold text-[#1D1D1F] mb-2">
                  Formação &amp; Catequese
                </h4>
                <p className="text-[15px] text-[#1D1D1F]/80 leading-relaxed">
                  Consulte a secretaria paroquial sobre modalidades, inscrições e horários da
                  catequese.
                </p>
              </div>
              <div className="rounded-[20px] border border-black/[0.08] p-5 sm:p-7">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] flex items-center justify-center text-[#0066CC] mb-3.5 sm:mb-4">
                  <Heart className="w-5 h-5" />
                </div>
                <h4 className="text-[18px] font-semibold text-[#1D1D1F] mb-2">
                  Fraternidade &amp; Juventude
                </h4>
                <p className="text-[15px] text-[#1D1D1F]/80 leading-relaxed">
                  Entre em contato com a secretaria para saber quais grupos e atividades estão
                  ativos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CATEQUESE E FORMAÇÃO CRISTÃ */}
        <section id="catequese" className="bg-[#F5F5F7] py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto">
            <div className="max-w-2xl mb-8 sm:mb-12">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                Iniciação Cristã
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                Catequese e Formação Cristã
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-[#1D1D1F]/80 leading-relaxed">
                Inscrições abertas. Confira as etapas, faixas etárias e horários abaixo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8 sm:mb-10">
              {CATECHESIS_PROGRAMS.map((program) => (
                <div
                  key={program.id}
                  className="bg-white rounded-[20px] border border-black/[0.08] p-5 sm:p-7 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <h3 className="text-[19px] sm:text-[20px] font-semibold tracking-tight text-[#1D1D1F]">
                        {program.title}
                      </h3>
                    </div>
                    <div className="text-[14px] text-[#1D1D1F]/80 leading-relaxed mb-5 sm:mb-6 space-y-1">
                      <p>{program.audience}</p>
                      <p className="font-medium">{program.schedule}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06]">
                    <button
                      type="button"
                      onClick={openInscriptionModal}
                      className="w-full mt-2 min-h-[44px] px-4 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
                    >
                      Dúvidas e inscrição
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enrollment Dark Apple Banner */}
            <div className="rounded-[24px] bg-[#1D1D1F] text-white p-6 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <span className="text-[11px] uppercase tracking-[0.08em] font-semibold text-white/60 block mb-1.5">
                  Inscrições abertas
                </span>
                <h3 className="text-[22px] sm:text-[28px] font-semibold tracking-tight leading-tight">
                  Quer se inscrever na catequese?
                </h3>
                <p className="mt-2 text-[14.5px] sm:text-[15px] text-white/75 leading-relaxed">
                  Entre em contato com a secretaria paroquial para receber orientações sobre a
                  inscrição.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button
                  type="button"
                  onClick={openInscriptionModal}
                  className="min-h-[44px] px-6 py-2.5 rounded-full bg-white text-[#1D1D1F] text-[14px] font-medium hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Consultar secretaria
                </button>
                <a
                  href="tel:1138575051"
                  className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-[14px] font-medium transition-colors tabular-nums"
                >
                  Ligar para a secretaria
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 7. PASTORAIS E JUVENTUDE */}
        <section id="pastorais" className="py-14 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-[1120px] mx-auto space-y-12 sm:space-y-16">
            {/* Pastorais */}
            <div>
              <div className="max-w-2xl mb-8 sm:mb-10">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                  Serviço &amp; Evangelização
                </p>
                <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                  Participe das Pastorais
                </h2>
                <p className="mt-3 text-[15px] sm:text-[16px] text-[#1D1D1F]/80 leading-relaxed">
                  Reuniões pastorais: todas as sextas-feiras, às 19h30, na Capela Maranata.
                </p>
              </div>

              <div className="rounded-[24px] bg-[#F5F5F7] border border-black/[0.06] p-5 sm:p-9 mb-5 sm:mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-black/[0.08]">
                  <div>
                    <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#0066CC]">
                      Informações
                    </span>
                    <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F] mt-0.5">
                      Pastorais e participação
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPastoralModalOpen(true)}
                    className="w-full sm:w-auto self-start md:self-auto min-h-[44px] px-5 py-2.5 rounded-full bg-[#1D1D1F] text-white text-[13px] font-medium hover:bg-black transition-colors cursor-pointer"
                  >
                    Consultar secretaria
                  </button>
                </div>

                <div className="pt-6">
                  <p className="text-[14px] text-[#1D1D1F]/80 leading-relaxed">
                    <strong>Endereço:</strong> Rua Brigadeiro Xavier de Brito, 577.
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Capela+Maranata+Rua+Brigadeiro+Xavier+de+Brito+577+Sao+Paulo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0066CC] hover:underline"
                  >
                    Ver Capela Maranata no mapa
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

              {/* Juventude */}
            <div id="juventude" className="pt-10 sm:pt-12 border-t border-black/[0.06]">
                <div className="rounded-[24px] bg-[#F5F5F7] border border-black/[0.06] p-6 sm:p-9">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] block mb-1.5">
                    Juventude Acutis
                  </span>
                  <h3 className="text-[24px] sm:text-[30px] font-semibold tracking-tight text-[#1D1D1F]">
                    Grupo de jovens da paróquia
                  </h3>
                  <p className="mt-3 max-w-2xl text-[15px] text-[#1D1D1F]/80 leading-relaxed">
                    Acompanhe as atividades no Instagram.
                  </p>
                  <a
                    href="https://www.instagram.com/juventude.acutis/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#009E49] text-white text-[13px] font-medium"
                  >
                    <InstagramIcon />
                    @juventude.acutis
                  </a>
                </div>
              </div>
          </div>
        </section>

        {/* 8. EVENTOS & SERMÕES DINÂMICOS (APENAS QUANDO CADASTRADOS NO PAINEL) */}
        {(events.length > 0 || sermons.length > 0) && (
          <section id="eventos" className="bg-[#F5F5F7] py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
            <div className="max-w-[1120px] mx-auto space-y-12 sm:space-y-16">
              {events.length > 0 && (
                <div>
                  <div className="mb-8">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                      Programação Especial
                    </p>
                    <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                      Próximos Eventos
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events.map((evt) => (
                      <article
                        key={evt.id}
                        className="bg-white rounded-[20px] border border-black/[0.08] overflow-hidden flex flex-col justify-between"
                      >
                        <div>
                          <MediaFrame
                            mediaKey={evt.coverKey}
                            className="aspect-[16/10] w-full"
                          />
                          <div className="p-6">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC]">
                              {evt.category}
                            </span>
                            <h3 className="text-[20px] font-semibold text-[#1D1D1F] mt-1">
                              {evt.title}
                            </h3>
                            <p className="text-[14px] text-[#1D1D1F]/80 mt-2 leading-relaxed">
                              {evt.subtitle || evt.description}
                            </p>
                          </div>
                        </div>
                        <div className="px-6 pb-6 pt-4 border-t border-black/[0.06] flex items-center justify-between text-[13px]">
                          <span className="text-[#424245] tabular-nums">
                            {formatDatePt(evt.date)} · {evt.time}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setRsvpEvent(evt);
                              setRsvpFeedback('');
                            }}
                            className="min-h-[38px] px-4 py-1.5 rounded-full bg-[#009E49] text-white font-medium hover:bg-[#007E3A] cursor-pointer"
                          >
                            Confirmar
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {sermons.length > 0 && (
                <div id="homilias">
                  <div className="mb-8">
                    <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                      Palavra &amp; Formação
                    </p>
                    <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                      Homilias &amp; Mensagens
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sermons.map((sermon) => (
                      <article
                        key={sermon.id}
                        className="bg-white rounded-[20px] border border-black/[0.08] p-6 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2 text-[12px] text-[#0066CC] font-medium mb-2">
                            <Mic2 className="w-3.5 h-3.5" />
                            <span>{sermon.series || 'Mensagem'}</span>
                          </div>
                          <h3 className="text-[19px] font-semibold text-[#1D1D1F]">
                            {sermon.title}
                          </h3>
                          <p className="text-[13px] text-[#6E6E73] mt-1.5">
                            {sermon.preacher} · {sermon.duration}
                          </p>
                          {sermon.summary && (
                            <p className="text-[14px] text-[#1D1D1F]/80 mt-3 line-clamp-2">
                              {sermon.summary}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveSermon(sermon)}
                          className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[#0066CC] hover:underline cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Ouvir e ler anotações</span>
                        </button>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 9. SECRETARIA PAROQUIAL & COMO CHEGAR */}
        <section id="secretaria" className="bg-[#F5F5F7] py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto space-y-12 sm:space-y-16">
            {/* Secretaria Card */}
            <div>
              <div className="max-w-2xl mb-8 sm:mb-10">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                  Atendimento Pastoral
                </p>
                <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                  Secretaria Paroquial
                </h2>
              </div>

              <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 sm:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pb-6 sm:pb-8 border-b border-black/[0.06]">
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#6E6E73] block">
                        Telefone da Secretaria
                      </span>
                      <a
                        href="tel:1138575051"
                        className="text-[26px] sm:text-[32px] font-semibold tracking-tight text-[#1D1D1F] hover:text-[#0066CC] transition-colors block mt-1 tabular-nums"
                      >
                        (11) 3857-5051
                      </a>
                    </div>

                    <div>
                      <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#6E6E73] block">
                        E-mail
                      </span>
                      <a
                        href={`mailto:${settings.contactEmail || 'rainha_santaisabel@hotmail.com'}`}
                        className="mt-1 block break-all text-[14px] font-medium text-[#0066CC] hover:underline"
                      >
                        {settings.contactEmail || 'rainha_santaisabel@hotmail.com'}
                      </a>
                    </div>
                  </div>

                  <div className="divide-y divide-black/[0.06]">
                    <div className="pb-3">
                      <span className="text-[11px] uppercase tracking-[0.06em] font-semibold text-[#6E6E73] block">
                        Horários de Atendimento
                      </span>
                    </div>
                    <div className="py-3.5 flex items-center justify-between gap-4 text-[14px]">
                      <span className="font-semibold text-[#1D1D1F]">Terça a sexta-feira</span>
                      <div className="text-right tabular-nums shrink-0">
                        <strong className="text-[#1D1D1F]">8h às 18h</strong>
                        <span className="block text-[12px] text-[#6E6E73]">
                          fechada durante o almoço
                        </span>
                      </div>
                    </div>
                    <div className="py-3.5 flex items-center justify-between gap-4 text-[14px]">
                      <span className="font-semibold text-[#1D1D1F]">Sábados</span>
                      <strong className="text-[#1D1D1F] tabular-nums shrink-0">9h às 12h</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-5 sm:pt-6 flex justify-end">
                  <a
                    href="#como-chegar"
                    className="min-h-[44px] inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium hover:bg-neutral-200 transition-colors"
                  >
                    Ver endereços e rotas
                  </a>
                </div>
              </div>
            </div>

            {/* Como Chegar */}
            <div id="como-chegar">
              <div className="max-w-2xl mb-6 sm:mb-8">
                <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                  Acesso &amp; Comunidade
                </p>
                <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                  Localização e Como Chegar
                </h2>
                <p className="mt-2 text-[15px] sm:text-[16px] text-[#1D1D1F]/80">
                  Endereços e rotas para a Igreja Matriz e a Capela Maranata.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:gap-6 mb-5 sm:mb-6">
                <div className="bg-white rounded-[20px] border border-black/[0.08] p-5 sm:p-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC]">
                        Igreja Matriz
                      </span>
                      <span className="text-[12px] text-[#6E6E73]">Local 1</span>
                    </div>
                    <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F]">
                      Paróquia Rainha Santa Isabel
                    </h3>
                    <p className="text-[13px] text-[#6E6E73] mb-4">
                      Igreja Matriz e Secretaria Paroquial
                    </p>
                    <div className="pt-4 border-t border-black/[0.06]">
                      <p className="text-[15px] font-semibold text-[#1D1D1F]">
                        Rua Elias Gannam, 331
                      </p>
                      <p className="text-[13px] text-[#6E6E73]">
                        Vila Bandeirantes / Casa Verde (São Paulo, SP)
                      </p>
                    </div>
                  </div>
                  <div className="pt-5 mt-5 border-t border-black/[0.06] flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        copyAddress(
                          'Rua Elias Gannam, 331, Vila Bandeirantes, São Paulo - SP',
                          'matriz'
                        )
                      }
                      className={`min-h-[42px] inline-flex items-center justify-center min-[420px]:justify-start gap-1.5 text-[13px] font-medium cursor-pointer ${
                        copiedId === 'matriz' ? 'text-emerald-700' : 'text-[#424245] hover:text-[#1D1D1F]'
                      }`}
                    >
                      {copiedId === 'matriz' ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedId === 'matriz' ? 'Copiado com sucesso!' : 'Copiar endereço'}
                      </span>
                    </button>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Rua+Elias+Gannam+331+Vila+Bandeirantes+Sao+Paulo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[42px] inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-[12px] font-medium hover:bg-black transition-colors"
                    >
                      Abrir no Google Maps
                    </a>
                  </div>
                </div>
                <div className="bg-white rounded-[20px] border border-black/[0.08] p-5 sm:p-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC]">
                      Capela
                    </span>
                    <h3 className="mt-3 text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F]">
                      Capela Maranata
                    </h3>
                    <p className="mt-4 text-[15px] font-semibold text-[#1D1D1F]">
                      Rua Brigadeiro Xavier de Brito, 577
                    </p>
                    <p className="text-[13px] text-[#6E6E73]">São Paulo, SP</p>
                  </div>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Capela+Maranata+Rua+Brigadeiro+Xavier+de+Brito+577+Sao+Paulo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 min-h-[42px] inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#1D1D1F] text-white text-[12px] font-medium hover:bg-black transition-colors"
                  >
                    Abrir no Google Maps
                  </a>
                </div>

              </div>

              <div className="bg-white rounded-[24px] border border-black/[0.08] p-5 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-5 border-b border-black/[0.06]">
                  <h4 className="text-[18px] font-semibold text-[#1D1D1F]">
                    Visualização no Mapa
                  </h4>
                  <span className="text-[13px] text-[#6E6E73]">
                    Mapa da Igreja Matriz
                  </span>
                </div>
                <div className="rounded-[12px] overflow-hidden border border-black/[0.08] h-[280px] sm:h-[400px] w-full bg-[#F5F5F7]">
                  <iframe
                    title="Mapa da Paróquia Rainha Santa Isabel"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src="https://maps.google.com/maps?q=Rua+Elias+Gannam+331+Vila+Bandeirantes+Sao+Paulo&t=&z=16&ie=UTF8&iwloc=&output=embed"
                  />
                </div>
                <p className="text-center text-[12px] text-[#6E6E73] mt-4">
                  * Confira o trajeto antes de sair: obras e desvios podem alterar o caminho.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. CENTRAL NOTIFICAR & PEDIDO DE ORAÇÃO */}
        <section id="notificar" className="py-14 sm:py-24 lg:py-28 px-4 sm:px-6 bg-white">
          <div className="max-w-[1120px] mx-auto">
            <div className="max-w-2xl mb-8 sm:mb-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-[#0066CC] mb-2">
                Comunicação Direta
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1] text-[#1D1D1F]">
                Avisos &amp; Intenções de Oração
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-[#1D1D1F]/80 leading-relaxed">
                Consulte os avisos publicados no site, registre seu interesse em comunicados ou
                envie um pedido para consulta pela secretaria.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start">
              {/* Notificar Opt-in */}
              <form
                onSubmit={handleSubscribe}
                className="rounded-[20px] bg-[#F5F5F7] border border-black/[0.06] p-5 sm:p-8 space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-5 h-5 text-[#0066CC]" />
                  <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1D1D1F]">
                    Cadastro de interesse em avisos
                  </h3>
                </div>
                <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                  O cadastro fica disponível no painel da secretaria. O site não envia
                  automaticamente e-mails, mensagens de WhatsApp ou notificações push.
                </p>

                <div>
                  <label htmlFor="sub-name" className="block text-[12px] font-medium text-[#424245] mb-1">
                    Nome completo
                  </label>
                  <input
                    id="sub-name"
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sub-email" className="block text-[12px] font-medium text-[#424245] mb-1">
                      E-mail
                    </label>
                    <input
                      id="sub-email"
                      type="email"
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="sub-phone" className="block text-[12px] font-medium text-[#424245] mb-1">
                      Telefone
                    </label>
                    <input
                      id="sub-phone"
                      type="tel"
                      value={subPhone}
                      onChange={(e) => setSubPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                    />
                  </div>
                </div>

                <p className="text-[12px] text-[#6E6E73]">
                  Selecione os assuntos de seu interesse para consulta pela secretaria.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'missas', label: 'Horários & Solenidades' },
                    { id: 'catequese', label: 'Catequese' },
                    { id: 'avisos', label: 'Avisos Pastorais' },
                  ].map((topic) => {
                    const checked = subTopics.includes(topic.id);
                    return (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors cursor-pointer ${
                          checked
                            ? 'bg-[#1D1D1F] text-white'
                            : 'bg-white text-[#424245] border border-black/[0.08]'
                        }`}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>

                {subFeedback && (
                  <p className="text-[13px] font-medium text-[#0066CC]">{subFeedback}</p>
                )}

                <button
                  type="submit"
                  disabled={subLoading}
                  className="w-full min-h-[46px] py-3 rounded-full bg-[#009E49] text-white text-[14px] font-medium hover:bg-[#007E3A] disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {subLoading ? 'Registrando...' : 'Registrar interesse'}
                </button>

                {recentNotifications.length > 0 && (
                  <div className="pt-4 border-t border-black/[0.06] space-y-2">
                    <p className="text-[11px] uppercase tracking-wider font-semibold text-[#6E6E73]">
                      Avisos recentes publicados no site
                    </p>
                    {recentNotifications.slice(0, 2).map((n) => (
                      <div key={n.id} className="text-[13px] text-[#424245]">
                        <strong className="text-[#1D1D1F]">{n.title}:</strong> {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Prayer & Pastoral Visit Request */}
              <form
                onSubmit={handlePrayerSubmit}
                className="rounded-[20px] bg-[#F5F5F7] border border-black/[0.06] p-5 sm:p-8 space-y-4"
              >
                <h3 className="text-[19px] sm:text-[20px] font-semibold text-[#1D1D1F]">
                  Pedido de Oração ou Visita Pastoral
                </h3>
                <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                  Seu pedido será registrado para consulta no painel da secretaria; o site não
                  envia uma notificação automática à equipe.
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {(['Oração', 'Visita'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPrayType(type)}
                      className={`min-h-[42px] py-2 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${
                        prayType === type
                          ? 'bg-[#1D1D1F] text-white'
                          : 'bg-white text-[#424245] border border-black/[0.08]'
                      }`}
                    >
                      Pedido de {type}
                    </button>
                  ))}
                </div>

                <div>
                  <label htmlFor="pray-name" className="block text-[12px] font-medium text-[#424245] mb-1">
                    Seu nome
                  </label>
                  <input
                    id="pray-name"
                    type="text"
                    required
                    value={prayName}
                    onChange={(e) => setPrayName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="pray-email" className="block text-[12px] font-medium text-[#424245] mb-1">
                      E-mail (opcional)
                    </label>
                    <input
                      id="pray-email"
                      type="email"
                      value={prayEmail}
                      onChange={(e) => setPrayEmail(e.target.value)}
                      placeholder="E-mail"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                    />
                  </div>
                  <div>
                    <label htmlFor="pray-phone" className="block text-[12px] font-medium text-[#424245] mb-1">
                      Telefone (opcional)
                    </label>
                    <input
                      id="pray-phone"
                      type="tel"
                      value={prayPhone}
                      onChange={(e) => setPrayPhone(e.target.value)}
                      placeholder="Telefone"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="pray-message" className="block text-[12px] font-medium text-[#424245] mb-1">
                    Intenção ou mensagem
                  </label>
                  <textarea
                    id="pray-message"
                    rows={3}
                    required
                    value={prayMessage}
                    onChange={(e) => setPrayMessage(e.target.value)}
                    placeholder="Escreva sua intenção ou solicitação à secretaria paroquial..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-black/[0.08] text-[16px] sm:text-[14px] resize-none"
                  />
                </div>

                {prayFeedback && (
                  <p className="text-[13px] font-medium text-[#0066CC]">{prayFeedback}</p>
                )}

                <button
                  type="submit"
                  disabled={prayLoading}
                  className="w-full min-h-[46px] py-3 rounded-full bg-[#1D1D1F] text-white text-[14px] font-medium hover:bg-black disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {prayLoading ? 'Registrando...' : 'Registrar pedido'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* 11. REDES SOCIAIS E COMUNICAÇÃO */}
        <section id="redes-sociais" className="bg-[#1D1D1F] text-white py-14 sm:py-24 lg:py-28 px-4 sm:px-6">
          <div className="max-w-[1120px] mx-auto">
            <div className="max-w-2xl mb-8 sm:mb-10">
              <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-white/60 mb-2">
                Canais Digitais
              </p>
              <h2 className="text-[clamp(1.75rem,3.2vw,2.625rem)] font-semibold tracking-[-0.025em] leading-[1.1]">
                Redes Sociais e Comunicação
              </h2>
              <p className="mt-3 text-[15px] sm:text-[16px] text-white/75 leading-relaxed">
                Canais de contato e perfis oficiais da Igreja e da Região Santana.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <div className="rounded-[20px] bg-white text-[#1D1D1F] p-5 sm:p-7">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC] block mb-1">
                  Fonte oficial
                </span>
                <h3 className="text-[19px] sm:text-[20px] font-semibold tracking-tight">
                  Arquidiocese de São Paulo
                </h3>
                <p className="text-[14px] text-[#1D1D1F]/80 leading-relaxed mt-2 mb-5">
                  Confira a ficha paroquial para consultar informações atualizadas.
                </p>
                <a
                  href="https://arquisp.org.br/regiao-santana/paroquia-rainha-santa-isabel-casa-verde/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1D1D1F] text-white hover:bg-black text-[13px] font-medium transition-colors"
                >
                  <span>Abrir ficha paroquial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="rounded-[20px] bg-white text-[#1D1D1F] p-5 sm:p-7">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC] block mb-1">
                  Contato
                </span>
                <h3 className="text-[19px] sm:text-[20px] font-semibold tracking-tight">
                  Secretaria paroquial
                </h3>
                <a
                  href="#secretaria"
                  className="mt-4 w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#1D1D1F] text-white hover:bg-black text-[13px] font-medium transition-colors"
                >
                  <span>Ver contatos e expediente</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 w-full min-h-[44px] inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#25D366] text-[#123B25] hover:bg-[#20BD5A] text-[13px] font-medium transition-colors"
                  >
                    <WhatsAppIcon />
                    <span>Conversar pelo WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="rounded-[20px] bg-white text-[#1D1D1F] p-5 sm:p-7">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#0066CC] block mb-1">
                  Instagram
                </span>
                <h3 className="text-[19px] sm:text-[20px] font-semibold tracking-tight">
                  Arquidiocese e Região Santana
                </h3>
                <div className="mt-4 flex flex-col gap-3 text-[14px]">
                  <a
                    href="https://www.instagram.com/arquisp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-[#0066CC] hover:underline"
                  >
                    <InstagramIcon />
                    @arquisp <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <a
                    href="https://www.instagram.com/regiaosantana/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-[#0066CC] hover:underline"
                  >
                    <InstagramIcon />
                    @regiaosantana <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 12. APPLE MINIMALIST FOOTER */}
      <footer className="bg-[#F5F5F7] text-[#424245] border-t border-black/[0.08]">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pb-8 sm:pb-10 border-b border-black/[0.08]">
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 shrink-0">
                  <ParishEmblem alt="Logo Paróquia" className="w-full h-full object-contain" />
                </div>
                <span className="text-[15px] font-semibold text-[#1D1D1F]">
                  Paróquia Rainha Santa Isabel
                </span>
              </div>
              <p className="text-[13px] text-[#6E6E73] leading-relaxed">
                Comunidade católica da Casa Verde, dedicada à fé, aos sacramentos e à caridade.
              </p>
            </div>

            <div>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#1D1D1F] mb-3">
                Navegação Rápida
              </h4>
              <ul className="space-y-2 text-[13px]">
                <li>
                  <a href="#inicio" className="hover:text-[#1D1D1F]">
                    Início
                  </a>
                </li>
                <li>
                  <a href="#a-paroquia" className="hover:text-[#1D1D1F]">
                    Paróquia
                  </a>
                </li>
                <li>
                  <a href="#missas" className="hover:text-[#1D1D1F]">
                    Horários das Missas
                  </a>
                </li>
                <li>
                  <a href="#catequese" className="hover:text-[#1D1D1F]">
                    Catequese e Formação
                  </a>
                </li>
                <li>
                  <a href="#pastorais" className="hover:text-[#1D1D1F]">
                    Pastorais
                  </a>
                </li>
                <li>
                  <a href="#juventude" className="hover:text-[#1D1D1F]">
                    Juventude
                  </a>
                </li>
                <li>
                  <a href="#secretaria" className="hover:text-[#1D1D1F]">
                    Secretaria e Contato
                  </a>
                </li>
              </ul>
            </div>

            <div className="space-y-3 text-[13px]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#1D1D1F]">
                Contato &amp; Endereços
              </h4>
              <a href="#secretaria" className="block hover:text-[#1D1D1F]">
                Telefone, e-mail e expediente
              </a>
              <a href="#como-chegar" className="block hover:text-[#1D1D1F]">
                Endereços e rotas
              </a>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#1D1D1F] mb-3">
                Informações oficiais
              </h4>
              <a
                href="https://arquisp.org.br/regiao-santana/paroquia-rainha-santa-isabel-casa-verde/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#424245] hover:text-[#1D1D1F]"
              >
                Ficha da Arquidiocese
              </a>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0066CC] hover:underline cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Área Administrativa</span>
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[12px] text-[#6E6E73]">
            <p>© {new Date().getFullYear()} Paróquia Rainha Santa Isabel. Todos os direitos reservados.</p>
            <p>Arquidiocese de São Paulo · Região Santana · Decanato São Judas Tadeu</p>
          </div>
        </div>
      </footer>

      {/* MODAL DE INSCRIÇÕES CATEQUESE */}
      {inscriptionModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Informações sobre catequese"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex p-3 sm:p-4"
          onClick={() => setInscriptionModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-[24px] max-w-lg w-full m-auto p-5 sm:p-8 shadow-2xl border border-black/[0.08]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setInscriptionModalOpen(false)}
              aria-label="Fechar modal de inscrições"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 h-10 w-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 sm:mb-6 pr-11">
              <span className="text-[11px] uppercase tracking-wider text-[#0066CC] font-semibold block mb-1">
                Formação Cristã · Paróquia Rainha Santa Isabel
              </span>
              <h3 className="text-[22px] sm:text-[24px] font-semibold tracking-tight text-[#1D1D1F]">
                Informações sobre catequese
              </h3>
              <p className="text-[13px] text-[#6E6E73] mt-1">
                As inscrições estão abertas. Entre em contato com a secretaria paroquial para
                receber orientações e se inscrever.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:1138575051"
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#009E49] text-white text-[13px] font-medium"
              >
                <Phone className="w-4 h-4" />
                Ligar para a secretaria
              </a>
              <a
                href={`mailto:${settings.contactEmail || 'rainha_santaisabel@hotmail.com'}`}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium"
              >
                <Mail className="w-4 h-4" />
                Enviar e-mail
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PASTORAIS */}
      {pastoralModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Como participar das pastorais"
          className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex p-3 sm:p-4"
          onClick={() => setPastoralModalOpen(false)}
        >
          <div
            className="relative bg-white rounded-[24px] max-w-lg w-full m-auto p-5 sm:p-8 shadow-2xl border border-black/[0.08] max-h-[92dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPastoralModalOpen(false)}
              aria-label="Fechar modal de pastorais"
              className="absolute top-4 right-4 sm:top-5 sm:right-5 h-10 w-10 rounded-full bg-[#F5F5F7] text-[#1D1D1F] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-5 pr-11">
              <span className="text-[11px] uppercase tracking-wider text-[#0066CC] font-semibold block mb-1">
                Vida Pastoral Comunitária
              </span>
              <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F]">
                Como Participar das Pastorais
              </h3>
            </div>

            <div className="space-y-4 text-[14px] text-[#424245]">
              <p className="leading-relaxed">
                As reuniões pastorais acontecem às sextas-feiras, às 19h30, na Capela Maranata.
                Para saber como participar, consulte a secretaria.
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-black/[0.06] flex flex-col sm:flex-row gap-3">
              <a
                href="tel:1138575051"
                className="flex-1 min-h-[44px] inline-flex items-center justify-center py-2.5 px-4 rounded-full bg-[#009E49] text-white text-[13px] font-medium hover:bg-[#007E3A]"
              >
                <Phone className="w-4 h-4 mr-2" />
                Ligar para a secretaria
              </a>
              <a
                href={`mailto:${settings.contactEmail || 'rainha_santaisabel@hotmail.com'}`}
                className="flex-1 min-h-[44px] inline-flex items-center justify-center py-2.5 px-4 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium"
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar e-mail
              </a>
              <button
                type="button"
                onClick={() => setPastoralModalOpen(false)}
                className="min-h-[44px] px-5 py-2.5 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-[13px] font-medium cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL RSVP (eventos criados no painel) */}
      {rsvpEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setRsvpEvent(null)}
        >
          <div
            className="bg-white rounded-[24px] max-w-md w-full p-5 sm:p-7 border border-black/[0.08] max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <h3 className="text-[20px] font-semibold text-[#1D1D1F]">{rsvpEvent.title}</h3>
              <button
                type="button"
                onClick={() => setRsvpEvent(null)}
                aria-label="Fechar modal"
                className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRsvpSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                placeholder="Nome completo"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-[16px] sm:text-[13px]"
              />
              <input
                type="email"
                required
                value={rsvpEmail}
                onChange={(e) => setRsvpEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-[16px] sm:text-[13px]"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={rsvpPhone}
                  onChange={(e) => setRsvpPhone(e.target.value)}
                  placeholder="Telefone"
                  className="px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-[16px] sm:text-[13px]"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={rsvpGuests}
                  onChange={(e) => setRsvpGuests(Number(e.target.value))}
                  className="px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-[16px] sm:text-[13px]"
                />
              </div>
              {rsvpFeedback && (
                <p className="text-[13px] font-medium text-[#0066CC]">{rsvpFeedback}</p>
              )}
              <button
                type="submit"
                disabled={rsvpSubmitting}
                className="w-full min-h-[46px] py-3 rounded-full bg-[#009E49] text-white text-[14px] font-medium cursor-pointer"
              >
                {rsvpSubmitting ? 'Confirmando...' : 'Confirmar presença'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HOMILIA */}
      {activeSermon && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={() => setActiveSermon(null)}
        >
          <div
            className="bg-white rounded-[24px] max-w-lg w-full p-5 sm:p-7 border border-black/[0.08] max-h-[88dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="text-[12px] font-medium text-[#0066CC]">{activeSermon.series}</span>
                <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#1D1D1F] mt-0.5">
                  {activeSermon.title}
                </h3>
                <p className="text-[13px] text-[#6E6E73] mt-1">
                  {activeSermon.preacher} · {formatDatePt(activeSermon.date)} · {activeSermon.duration}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveSermon(null)}
                aria-label="Fechar homilia"
                className="h-10 w-10 rounded-full bg-[#F5F5F7] flex items-center justify-center shrink-0 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {activeSermon.summary && (
              <p className="text-[14px] text-[#424245] leading-relaxed mb-4">
                {activeSermon.summary}
              </p>
            )}
            {activeSermon.keyTakeaways.length > 0 && (
              <ul className="space-y-1.5 mb-5 text-[13px] text-[#424245] list-disc pl-5">
                {activeSermon.keyTakeaways.map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            )}
            {activeSermon.mediaUrl && (
              <a
                href={activeSermon.mediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#009E49] text-white text-[13px] font-medium"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Ouvir ou assistir mídia</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* FLOATING CALL & SCROLL TOP */}
      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-30 flex flex-col gap-2.5">
        {showScrollTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao topo"
            className="w-11 h-11 rounded-full bg-white text-[#1D1D1F] shadow-lg border border-black/[0.08] flex items-center justify-center hover:bg-[#F5F5F7] transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
        <a
          href="tel:1138575051"
          aria-label="Ligar para a Secretaria Paroquial"
          title="Ligar para a Secretaria Paroquial"
          className="w-12 h-12 rounded-full bg-[#009E49] text-white shadow-lg flex items-center justify-center hover:bg-[#007E3A] transition-colors"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}
