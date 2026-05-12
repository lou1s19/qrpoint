export type QRType = 'url' | 'wifi' | 'vcard' | 'text' | 'email' | 'phone' | 'sms' | 'mecard' | 'location' | 'facebook' | 'twitter' | 'youtube' | 'event' | 'crypto';

export const UNTESTED_QR_TYPES: QRType[] = [
  'vcard',
  'mecard',
  'location',
  'facebook',
  'twitter',
  'youtube',
  'event',
  'crypto',
  'wifi',
];

export type DotsStyle =
  | 'square'
  | 'mosaic'
  | 'dot'
  | 'circle'
  | 'circle-zebra'
  | 'circle-zebra-vertical'
  | 'circular'
  | 'edge-cut'
  | 'edge-cut-smooth'
  | 'japnese'
  | 'leaf'
  | 'pointed'
  | 'pointed-edge-cut'
  | 'pointed-in'
  | 'pointed-in-smooth'
  | 'pointed-smooth'
  | 'round'
  | 'rounded-in'
  | 'rounded-in-smooth'
  | 'rounded-pointed'
  | 'star'
  | 'diamond';

export type CornerSquareStyle =
  | 'frame0'
  | 'frame1'
  | 'frame2'
  | 'frame3'
  | 'frame4'
  | 'frame5'
  | 'frame6'
  | 'frame7'
  | 'frame8'
  | 'frame9'
  | 'frame10'
  | 'frame11'
  | 'frame12'
  | 'frame13'
  | 'frame14'
  | 'frame15'
  | 'frame16';

export type CornerDotStyle =
  | 'ball0'
  | 'ball1'
  | 'ball2'
  | 'ball3'
  | 'ball4'
  | 'ball5'
  | 'ball6'
  | 'ball7'
  | 'ball8'
  | 'ball9'
  | 'ball10'
  | 'ball11'
  | 'ball12'
  | 'ball13'
  | 'ball14'
  | 'ball15'
  | 'ball16'
  | 'ball17'
  | 'ball18'
  | 'ball19';

export interface QRCodeConfig {
  dotsStyle: DotsStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  fgColor: string;
  bgColor: string;
  logo?: string;
  logoMargin: number;
  logoRadius?: number;
  margin: number;
  qrSize: number;
  transparentBg: boolean;
  roundedCorners: boolean;
}

export interface QRHistoryItem {
  id: string;
  title: string;
  type: QRType;
  content: string;
  createdAt: number;
  isScanned: boolean;
  config: QRCodeConfig;
  localImagePath?: string;
}

export interface QRPreset {
  id: string;
  name: string;
  createdAt: number;
  config: QRCodeConfig;
}

export interface MeCardData {
  name: string;
  phone: string;
  email: string;
  url: string;
  address: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
}

export interface EventData {
  title: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface CryptoData {
  currency: 'bitcoin' | 'ethereum' | 'litecoin';
  address: string;
  amount: string;
}

export interface WiFiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  website: string;
}

export const QR_TYPE_LABELS: Record<QRType, string> = {
  url: 'URL',
  wifi: 'Wi-Fi',
  vcard: 'vCard',
  text: 'Text',
  email: 'E-Mail',
  phone: 'Phone',
  sms: 'SMS',
  mecard: 'MeCard',
  location: 'Location',
  facebook: 'Facebook',
  twitter: 'Twitter',
  youtube: 'YouTube',
  event: 'Event',
  crypto: 'Crypto',
};

export const QR_TYPE_COLORS: Record<QRType, string> = {
  url: '#006591',
  wifi: '#4648d4',
  vcard: '#904900',
  text: '#767586',
  email: '#006591',
  phone: '#4648d4',
  sms: '#904900',
  mecard: '#904900',
  location: '#e63946',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  youtube: '#FF0000',
  event: '#7b2d8b',
  crypto: '#f7931A',
};

export const DEFAULT_QR_CONFIG: QRCodeConfig = {
  dotsStyle: 'square',
  cornerSquareStyle: 'frame0',
  cornerDotStyle: 'ball0',
  fgColor: '#4648d4',
  bgColor: '#ffffff',
  logoMargin: 0,
  logoRadius: 0,
  margin: 10,
  qrSize: 1024,
  transparentBg: false,
  roundedCorners: true,
};

export function normalizeUrlContent(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed || /^https?:\/\/?$/i.test(trimmed)) return '';
  if (/^\/\//.test(trimmed)) return `https:${trimmed}`;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function normalizeWebUrlContent(value: string): string {
  const trimmed = (value || '').trim();
  if (!trimmed || /^(https?:\/\/)+$/i.test(trimmed)) return '';
  const withoutProtocol = trimmed
    .replace(/^(https?:\/\/)+/i, '')
    .replace(/^(https?:\/\/)+/i, '');
  return withoutProtocol ? `https://${withoutProtocol}` : '';
}

export function isLikelyWebUrl(value: string): boolean {
  const normalized = normalizeWebUrlContent(value);
  if (!normalized) return false;
  return /^https:\/\/[^/\s]+\.[^/\s]{2,}(?:[/?#].*)?$/i.test(normalized);
}

export function getOpenableUrl(value: string): string | null {
  const normalized = normalizeUrlContent(value);
  return /^https?:\/\//i.test(normalized) ? normalized : null;
}

export function detectQRTypeFromContent(value: string): QRType {
  const trimmed = (value || '').trim();
  if (getOpenableUrl(trimmed)) return 'url';
  if (/^wifi:/i.test(trimmed)) return 'wifi';
  if (/^begin:vcard/i.test(trimmed)) return 'vcard';
  if (/^mailto:/i.test(trimmed)) return 'email';
  if (/^tel:/i.test(trimmed)) return 'phone';
  if (/^sms:/i.test(trimmed)) return 'sms';
  return 'text';
}

export function buildQRContent(type: QRType, data: Record<string, string>): string {
  switch (type) {
    case 'url':
      return normalizeWebUrlContent(data.url || '');
    case 'wifi': {
      const enc = data.encryption || 'WPA';
      const hidden = data.hidden === 'true' ? 'H:true;' : '';
      return `WIFI:S:${data.ssid || ''};T:${enc};P:${data.password || ''};${hidden};`;
    }
    case 'vcard':
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${data.firstName || ''} ${data.lastName || ''}`,
        `N:${data.lastName || ''};${data.firstName || ''}`,
        data.phone ? `TEL:${data.phone}` : '',
        data.email ? `EMAIL:${data.email}` : '',
        data.company ? `ORG:${data.company}` : '',
        data.website ? `URL:${normalizeWebUrlContent(data.website)}` : '',
        'END:VCARD',
      ].filter(Boolean).join('\n');
    case 'text':
      return data.text || '';
    case 'email':
      return `mailto:${data.email || ''}${data.subject ? `?subject=${encodeURIComponent(data.subject)}` : ''}`;
    case 'phone':
      return `tel:${data.phone || ''}`;
    case 'sms':
      return `sms:${data.phone || ''}${data.message ? `?body=${encodeURIComponent(data.message)}` : ''}`;
    default:
      return '';
  }
}
