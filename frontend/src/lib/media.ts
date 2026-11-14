import communityFellowshipImg from '../assets/images/community_fellowship_1794536416038.jpg';
import eventWorshipNightImg from '../assets/images/event_worship_night_1794536414880.jpg';
import churchFacadeImg from '../assets/images/igreja.jpg';
import sermonSeriesCoverImg from '../assets/images/sermon_series_cover_1794536415100.jpg';
import type { MediaKey } from '../types/church';

export const CHURCH_MEDIA: Record<
  MediaKey,
  { src: string; alt: string; label: string; isIllustrative: boolean }
> = {
  hero_sanctuary: {
    src: churchFacadeImg,
    alt: 'Fachada da Igreja Matriz da Paróquia Rainha Santa Isabel',
    label: 'Igreja Matriz da Paróquia Rainha Santa Isabel',
    isIllustrative: false,
  },
  sermon_series_cover: {
    src: sermonSeriesCoverImg,
    alt: 'Imagem abstrata ilustrativa para conteúdos de formação',
    label: 'Homilias e Formação',
    isIllustrative: true,
  },
  event_worship_night: {
    src: eventWorshipNightImg,
    alt: 'Imagem ilustrativa de músicos em uma celebração; não representa um evento paroquial',
    label: 'Celebrações',
    isIllustrative: true,
  },
  community_fellowship: {
    src: communityFellowshipImg,
    alt: 'Imagem ilustrativa de pessoas reunidas; não representa a comunidade paroquial',
    label: 'Comunidade Paroquial',
    isIllustrative: true,
  },
};
