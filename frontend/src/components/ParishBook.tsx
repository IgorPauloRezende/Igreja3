import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Sparkles,
  Heart,
  Bookmark,
  Calendar,
  MapPin,
  Flame,
} from 'lucide-react';
import parishLogo from '../assets/images/logo_igreja.svg';
import igrejaImg from '../assets/images/igreja.jpg';
import fellowshipImg from '../assets/images/community_fellowship_1794536416038.jpg';
import worshipImg from '../assets/images/event_worship_night_1794536414880.jpg';

interface Spread {
  id: number;
  label: string;
  leftPage?: {
    tag: string;
    title: string;
    subtitle?: string;
    image?: string;
    imageCaption?: string;
    content: string[];
    highlight?: string;
    pageNumber?: number;
  };
  rightPage?: {
    tag: string;
    title: string;
    subtitle?: string;
    image?: string;
    imageCaption?: string;
    content: string[];
    highlight?: string;
    pageNumber?: number;
  };
}

const SPREADS: Spread[] = [
  // Spread 0: Capa Frontal Dura (Cover)
  {
    id: 0,
    label: 'Capa',
  },
  // Spread 1: Páginas 1 e 2 - Acolhimento & Santa Isabel
  {
    id: 1,
    label: 'Acolhida & Padroeira',
    leftPage: {
      tag: 'Acolhimento Pastoral',
      title: 'Uma Casa de Fé e Oração',
      subtitle: 'Memória da Paróquia Rainha Santa Isabel',
      content: [
        'Sejam bem-vindos às páginas da nossa história viva. A Paróquia Rainha Santa Isabel nasceu do coração de uma comunidade generosa em Casa Verde, que encontrou na fé e na fraternidade os alicerces para erguer um templo de amor.',
        'Ao longo de décadas, famílias inteiras foram batizadas, casadas e alimentadas pela Sagrada Eucaristia neste solo sagrado. Aqui, cada tijolo guarda uma oração, e cada celebração renova a certeza de que Deus habita entre nós.',
      ],
      highlight:
        '“Onde houver caridade e amor verdadeiro, ali Deus habita e faz morada perpétua.”',
      pageNumber: 1,
    },
    rightPage: {
      tag: 'Nossa Padroeira',
      title: 'Santa Isabel da Hungria',
      subtitle: 'O Milagre das Rosas e a Caridade Sem Limites',
      content: [
        'Nascida em 1207, Santa Isabel foi rainha e serva de todos. Destinou sua vida, seus bens e seu amor aos mais pobres e enfermos, tornando-se modelo supremo de humildade franciscana e partilha.',
        'A tradição nos conta que, ao levar pães escondidos aos pobres, foi surpreendida pelo esposo que perguntou o que carregava no regaço. Ao abri-lo, os pães haviam se transformado em perfumadas rosas frescas.',
      ],
      highlight: 'Festa Litúrgica: 17 de Novembro · Padroeira da Caridade e da Família',
      pageNumber: 2,
    },
  },
  // Spread 2: Páginas 3 e 4 - A Matriz & Pastorais
  {
    id: 2,
    label: 'A Matriz & Pastorais',
    leftPage: {
      tag: 'Nosso Templo Sagrado',
      title: 'Igreja Matriz & Capela Maranata',
      subtitle: 'Um Farol de Esperança na Cidade',
      image: igrejaImg,
      imageCaption: 'Fachada histórica da Igreja Matriz na Rua Elias Gannam, Casa Verde',
      content: [
        'Localizada na Rua Elias Gannam, a Igreja Matriz acolhe fiéis de toda a região paulistana com sua nave acolhedora e atmosfera serena de silêncio e adoração.',
        'Junto à Capela Maranata, formamos uma rede unida de irmãos dedicados à oração contínua e aos sacramentos.',
      ],
      pageNumber: 3,
    },
    rightPage: {
      tag: 'Comunhão & Missão',
      title: 'Vida Pastoral Ativa',
      subtitle: 'Muitos Dons, Um Só Espírito',
      image: fellowshipImg,
      imageCaption: 'Encontros de partilha, cafés fraternos e serviço social comunitário',
      content: [
        'A paróquia pulsa através do trabalho voluntário de dezenas de paroquianos organizados em ministérios: Liturgia, Música, Acolhimento, Catequese, Ação Social e Dízimo.',
        'Nosso compromisso não termina na porta da igreja: estende-se às famílias necessitadas e a quem busca consolo espiritual.',
      ],
      pageNumber: 4,
    },
  },
  // Spread 3: Páginas 5 e 6 - Juventude & Oração
  {
    id: 3,
    label: 'Juventude & Oração',
    leftPage: {
      tag: 'Nova Geração',
      title: 'Juventude Carlo Acutis',
      subtitle: 'A Eucaristia como Autoestrada para o Céu',
      image: worshipImg,
      imageCaption: 'Noites de louvor, vigílias e retiros espirituais da juventude',
      content: [
        'Inspirados pelo Beato Carlo Acutis, os jovens da paróquia unem tecnologia, oração, carisma e entusiasmo para testemunhar o Evangelho no mundo contemporâneo.',
        'Com noites de louvor, grupos de partilha e adoração ao Santíssimo Sacramento, a juventude é o coração vibrante do presente e do futuro da nossa comunidade.',
      ],
      pageNumber: 5,
    },
    rightPage: {
      tag: 'Prece Comunitária',
      title: 'Oração a Santa Isabel',
      subtitle: 'Rogai por Nossa Paróquia e Famílias',
      content: [
        'Ó gloriosa Santa Isabel, modelo de paciência, amor aos humildes e fidelidade a Cristo, alcançai-nos a graça de um coração misericordioso.',
        'Abençoai os lares da nossa paróquia, dai paz aos nossos doentes, fortalecei os nossos jovens e transformai as nossas dores em rosas de esperança.',
        'Por Cristo, nosso Senhor. Amém!',
      ],
      highlight:
        '“Não apenas falar de amor, mas estender as mãos a quem mais precisa.”',
      pageNumber: 6,
    },
  },
  // Spread 4: Contracapa Traseira (Back Cover)
  {
    id: 4,
    label: 'Contracapa',
  },
];

export function ParishBook() {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const bookContainerRef = useRef<HTMLDivElement>(null);

  const totalSpreads = SPREADS.length;
  const spread = SPREADS[currentSpread];

  function handleNext() {
    if (currentSpread < totalSpreads - 1) {
      setCurrentSpread((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (currentSpread > 0) {
      setCurrentSpread((prev) => prev - 1);
    }
  }

  function toggleFullscreen() {
    setIsFullscreen((prev) => !prev);
  }

  const isCover = currentSpread === 0;
  const isBackCover = currentSpread === totalSpreads - 1;
  const isOpen = !isCover && !isBackCover;

  return (
    <section
      id="livro"
      className="py-16 sm:py-24 lg:py-28 px-4 sm:px-6 bg-[#F5F5F7] dark:bg-[#0B0B0D] transition-colors relative overflow-hidden"
    >
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#009E49]/5 dark:bg-[#009E49]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1140px] mx-auto relative z-10">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#009E49]/10 text-[#009E49] dark:bg-[#009E49]/20 dark:text-[#30D158] text-[12px] font-semibold tracking-wide uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Memorial Interativo</span>
          </div>

          <h2 className="text-[28px] sm:text-[38px] font-bold text-[#1D1D1F] dark:text-white tracking-tight leading-tight">
            Livro de História & Galeria
          </h2>

          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] dark:text-[#98989D] leading-relaxed">
            Folheie as páginas do nosso memorial paroquial. Clique nas bordas ou nos botões de navegação para virar as páginas como em um livro físico.
          </p>
        </div>

        {/* Livro e Moldura */}
        <div
          ref={bookContainerRef}
          className={`relative mx-auto transition-all duration-300 ${
            isFullscreen
              ? 'fixed inset-0 z-[100] bg-black/95 p-4 sm:p-10 flex flex-col items-center justify-center'
              : 'w-full max-w-[960px]'
          }`}
        >
          {isFullscreen && (
            <button
              type="button"
              onClick={toggleFullscreen}
              className="absolute top-6 right-6 z-[110] px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-[13px] font-medium backdrop-blur-md transition-colors cursor-pointer flex items-center gap-2"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Sair da tela cheia</span>
            </button>
          )}

          {/* O LIVRO 3D */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[580px] perspective-[2200px] select-none">
            {/* Sombra da mesa/superfície do livro */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[92%] h-8 bg-black/25 dark:bg-black/60 rounded-full blur-xl pointer-events-none" />

            <AnimatePresence mode="wait">
              {/* 1. CAPA FRONTAL (CLOSED FRONT COVER) */}
              {isCover && (
                <motion.div
                  key="front-cover"
                  initial={{ opacity: 0, rotateY: -30, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: -90, scale: 0.92 }}
                  transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                  onClick={handleNext}
                  className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-gradient-to-br from-[#0c3822] via-[#092b1a] to-[#04160d] text-white shadow-2xl p-6 sm:p-12 flex flex-col items-center justify-between text-center border-4 border-[#C5A059]/40 relative overflow-hidden cursor-pointer group"
                >
                  {/* Textura de couro e vinco dourado */}
                  <div className="absolute inset-3 border-2 border-[#C5A059]/30 rounded-[14px] pointer-events-none" />
                  <div className="absolute inset-5 border border-[#C5A059]/20 rounded-[10px] pointer-events-none" />

                  {/* Detalhes de cantoneiras douradas */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]" />

                  {/* Fitilho marcador de páginas */}
                  <div className="absolute top-0 right-16 w-4 h-24 bg-gradient-to-b from-[#8B1E1E] to-[#601212] shadow-md rounded-b-sm border-x border-[#A32828]" />

                  {/* Cabeçalho da capa */}
                  <div className="pt-4 space-y-1">
                    <p className="text-[11px] sm:text-[13px] uppercase tracking-[0.25em] text-[#C5A059] font-medium">
                      Paróquia Rainha Santa Isabel
                    </p>
                    <p className="text-[10px] sm:text-[11px] tracking-wider text-white/50 uppercase">
                      Casa Verde · São Paulo — SP
                    </p>
                  </div>

                  {/* Brasão central dourado */}
                  <div className="relative my-auto flex flex-col items-center">
                    <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-[#C5A059]/20 to-transparent p-3 sm:p-4 border border-[#C5A059]/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
                      <img
                        src={parishLogo}
                        alt="Brasão Paroquial"
                        className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(197,160,89,0.4)]"
                      />
                    </div>

                    <h3 className="mt-5 text-[22px] sm:text-[34px] font-serif font-bold text-[#EED8A1] tracking-wide filter drop-shadow-sm">
                      MEMORIAL & HISTÓRIA
                    </h3>
                    <p className="mt-1 text-[12px] sm:text-[14px] text-white/80 max-w-md italic">
                      “Uma comunidade de fé, oração e acolhimento.”
                    </p>
                  </div>

                  {/* Toque para abrir */}
                  <div className="pb-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#EED8A1] text-[12px] sm:text-[13px] font-medium tracking-wide group-hover:bg-[#C5A059]/30 transition-colors">
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Clique na capa para abrir o livro</span>
                      <ChevronRight className="w-4 h-4 text-[#C5A059]" />
                    </span>
                  </div>
                </motion.div>
              )}

              {/* 2. PÁGINAS ABERTAS (DOUBLE-PAGE SPREAD) */}
              {isOpen && (
                <motion.div
                  key={`spread-${currentSpread}`}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full rounded-[16px] sm:rounded-[20px] bg-[#FAF8F3] dark:bg-[#151518] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col sm:flex-row overflow-hidden relative"
                >
                  {/* Dobra/Costura central do livro (Spine fold shadow) */}
                  <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-black/10 via-black/25 to-black/10 pointer-events-none z-20" />
                  <div className="hidden sm:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/30 dark:bg-white/20 z-20" />

                  {/* PÁGINA ESQUERDA */}
                  <div
                    onClick={handlePrev}
                    title="Clique para voltar a página"
                    className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 sm:p-8 md:p-10 flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-black/[0.06] dark:border-white/[0.08] relative cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors overflow-y-auto"
                  >
                    {spread.leftPage && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#009E49] dark:text-[#30D158]">
                            {spread.leftPage.tag}
                          </span>
                          <span className="text-[11px] text-[#86868B]">
                            {spread.leftPage.pageNumber ? `Pág. ${spread.leftPage.pageNumber}` : ''}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-[18px] sm:text-[22px] font-bold font-serif text-[#1D1D1F] dark:text-white leading-tight">
                            {spread.leftPage.title}
                          </h4>
                          {spread.leftPage.subtitle && (
                            <p className="text-[12px] sm:text-[13px] text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                              {spread.leftPage.subtitle}
                            </p>
                          )}
                        </div>

                        {spread.leftPage.image && (
                          <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm max-h-36 sm:max-h-44">
                            <img
                              src={spread.leftPage.image}
                              alt={spread.leftPage.title}
                              className="w-full h-full object-cover"
                            />
                            {spread.leftPage.imageCaption && (
                              <p className="p-1.5 text-[10.5px] text-center text-[#6E6E73] bg-[#EFECE6] dark:bg-[#1F1F22] italic">
                                {spread.leftPage.imageCaption}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="space-y-2 text-[12.5px] sm:text-[13.5px] text-[#2C2C2E] dark:text-[#D1D1D6] leading-relaxed">
                          {spread.leftPage.content.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>

                        {spread.leftPage.highlight && (
                          <div className="p-3 rounded-xl bg-[#009E49]/10 border-l-3 border-[#009E49] text-[12px] italic text-[#1D1D1F] dark:text-white">
                            {spread.leftPage.highlight}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dica no rodapé da página esquerda */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#86868B]">
                      <span className="inline-flex items-center gap-1 hover:text-[#1D1D1F] dark:hover:text-white">
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                      </span>
                      <span>— {spread.leftPage?.pageNumber} —</span>
                    </div>
                  </div>

                  {/* PÁGINA DIREITA */}
                  <div
                    onClick={handleNext}
                    title="Clique para avançar a página"
                    className="w-full sm:w-1/2 h-1/2 sm:h-full p-4 sm:p-8 md:p-10 flex flex-col justify-between relative cursor-pointer hover:bg-black/[0.01] dark:hover:bg-white/[0.01] transition-colors overflow-y-auto"
                  >
                    {spread.rightPage && (
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#009E49] dark:text-[#30D158]">
                            {spread.rightPage.tag}
                          </span>
                          <span className="text-[11px] text-[#86868B]">
                            {spread.rightPage.pageNumber ? `Pág. ${spread.rightPage.pageNumber}` : ''}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-[18px] sm:text-[22px] font-bold font-serif text-[#1D1D1F] dark:text-white leading-tight">
                            {spread.rightPage.title}
                          </h4>
                          {spread.rightPage.subtitle && (
                            <p className="text-[12px] sm:text-[13px] text-[#6E6E73] dark:text-[#98989D] mt-0.5">
                              {spread.rightPage.subtitle}
                            </p>
                          )}
                        </div>

                        {spread.rightPage.image && (
                          <div className="rounded-xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm max-h-36 sm:max-h-44">
                            <img
                              src={spread.rightPage.image}
                              alt={spread.rightPage.title}
                              className="w-full h-full object-cover"
                            />
                            {spread.rightPage.imageCaption && (
                              <p className="p-1.5 text-[10.5px] text-center text-[#6E6E73] bg-[#EFECE6] dark:bg-[#1F1F22] italic">
                                {spread.rightPage.imageCaption}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="space-y-2 text-[12.5px] sm:text-[13.5px] text-[#2C2C2E] dark:text-[#D1D1D6] leading-relaxed">
                          {spread.rightPage.content.map((p, idx) => (
                            <p key={idx}>{p}</p>
                          ))}
                        </div>

                        {spread.rightPage.highlight && (
                          <div className="p-3 rounded-xl bg-[#009E49]/10 border-l-3 border-[#009E49] text-[12px] italic text-[#1D1D1F] dark:text-white">
                            {spread.rightPage.highlight}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Dica no rodapé da página direita */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#86868B]">
                      <span>— {spread.rightPage?.pageNumber} —</span>
                      <span className="inline-flex items-center gap-1 hover:text-[#1D1D1F] dark:hover:text-white">
                        <span>Avançar</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* 3. CONTRACAPA DURA (BACK COVER) */}
              {isBackCover && (
                <motion.div
                  key="back-cover"
                  initial={{ opacity: 0, rotateY: 30, scale: 0.95 }}
                  animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, rotateY: 90, scale: 0.92 }}
                  transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
                  onClick={() => setCurrentSpread(0)}
                  className="w-full h-full rounded-[18px] sm:rounded-[22px] bg-gradient-to-br from-[#0c3822] via-[#092b1a] to-[#04160d] text-white shadow-2xl p-6 sm:p-12 flex flex-col items-center justify-between text-center border-4 border-[#C5A059]/40 relative overflow-hidden cursor-pointer group"
                >
                  <div className="absolute inset-3 border-2 border-[#C5A059]/30 rounded-[14px] pointer-events-none" />
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#C5A059]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#C5A059]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#C5A059]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#C5A059]" />

                  <div className="pt-4">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-[#C5A059]">
                      Paróquia Rainha Santa Isabel
                    </p>
                  </div>

                  <div className="my-auto max-w-md space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 flex items-center justify-center p-3">
                      <img
                        src={parishLogo}
                        alt="Brasão"
                        className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(197,160,89,0.3)]"
                      />
                    </div>
                    <p className="text-[14px] sm:text-[15px] italic text-[#EED8A1] leading-relaxed">
                      “Que o testemunho de Santa Isabel inspire cada fiel da nossa paróquia a construir um mundo mais justo, fraterno e cheio de amor.”
                    </p>
                    <p className="text-[11px] tracking-wider text-white/60 uppercase">
                      Rua Elias Gannam, 331 · Casa Verde, São Paulo
                    </p>
                  </div>

                  <div className="pb-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#EED8A1] text-[12px] font-medium tracking-wide group-hover:bg-[#C5A059]/30 transition-colors">
                      <span>Voltar ao início do livro</span>
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* BARRA DE CONTROLE E NAVEGAÇÃO DO LIVRO */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-2">
            {/* Botão Anterior */}
            <button
              type="button"
              disabled={currentSpread === 0}
              onClick={handlePrev}
              aria-label="Voltar página"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[13px] font-medium text-[#1D1D1F] dark:text-white shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            {/* Marcadores / Seletor de Capítulos */}
            <div className="flex items-center gap-1.5">
              {SPREADS.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentSpread(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    currentSpread === idx
                      ? 'w-7 bg-[#009E49] dark:bg-[#30D158]'
                      : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40'
                  }`}
                  title={s.label}
                />
              ))}
              <span className="ml-2 text-[12px] font-medium text-[#6E6E73] dark:text-[#98989D]">
                {currentSpread === 0
                  ? 'Capa'
                  : currentSpread === totalSpreads - 1
                  ? 'Contracapa'
                  : `Págs. ${currentSpread * 2 - 1}–${currentSpread * 2}`}
              </span>
            </div>

            {/* Ações da direita: Próximo & Tela cheia */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Alternar tela cheia"
                className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-full bg-white dark:bg-[#1C1C1E] border border-black/10 dark:border-white/10 text-[#1D1D1F] dark:text-white shadow-sm hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] transition-all cursor-pointer"
                title={isFullscreen ? 'Sair da tela cheia' : 'Modo de leitura em tela cheia'}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                disabled={currentSpread === totalSpreads - 1}
                onClick={handleNext}
                aria-label="Avançar página"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#1D1D1F] text-white hover:bg-black dark:bg-white dark:text-[#1D1D1F] dark:hover:bg-[#F2F2F7] text-[13px] font-medium shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <span>Avançar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
