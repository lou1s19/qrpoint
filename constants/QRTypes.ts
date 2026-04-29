export type QRType = 'url' | 'wifi' | 'vcard' | 'text' | 'email' | 'phone' | 'sms';

export type DotsStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
export type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded';
export type CornerDotStyle = 'square' | 'dot';

export interface QRCodeConfig {
  dotsStyle: DotsStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  fgColor: string;
  bgColor: string;
  logo?: string;
  logoSize: number;
  logoMargin: number;
}

export interface QRHistoryItem {
  id: string;
  title: string;
  type: QRType;
  content: string;
  createdAt: number;
  isScanned: boolean;
  config: QRCodeConfig;
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
  phone: 'Telefon',
  sms: 'SMS',
};

export const QR_TYPE_COLORS: Record<QRType, string> = {
  url: '#006591',
  wifi: '#4648d4',
  vcard: '#904900',
  text: '#767586',
  email: '#006591',
  phone: '#4648d4',
  sms: '#904900',
};

export const DEFAULT_QR_CONFIG: QRCodeConfig = {
  dotsStyle: 'square',
  cornerSquareStyle: 'extra-rounded',
  cornerDotStyle: 'dot',
  fgColor: '#4648d4',
  bgColor: '#ffffff',
  logoSize: 0.3,
  logoMargin: 5,
};

export function buildQRContent(type: QRType, data: Record<string, string>): string {
  switch (type) {
    case 'url':
      return data.url || '';
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
        data.website ? `URL:${data.website}` : '',
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
