// Maps QRCode Monkey style names → qr-code-styling options
// qr-code-styling dot types: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded'
// qr-code-styling corner square types: 'square' | 'dot' | 'extra-rounded'
// qr-code-styling corner dot types: 'square' | 'dot'

export type QRStylingDotType = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
export type QRStylingCornerSquareType = 'square' | 'dot' | 'extra-rounded';
export type QRStylingCornerDotType = 'square' | 'dot';

export const DOT_STYLE_MAP: Record<string, QRStylingDotType> = {
  'square':                 'square',
  'mosaic':                 'square',
  'dot':                    'dots',
  'circle':                 'dots',
  'circle-zebra':           'dots',
  'circle-zebra-vertical':  'dots',
  'circular':               'extra-rounded',
  'edge-cut':               'classy',
  'edge-cut-smooth':        'classy-rounded',
  'japnese':                'square',
  'leaf':                   'rounded',
  'pointed':                'classy',
  'pointed-edge-cut':       'classy',
  'pointed-in':             'classy-rounded',
  'pointed-in-smooth':      'classy-rounded',
  'pointed-smooth':         'classy-rounded',
  'round':                  'rounded',
  'rounded-in':             'rounded',
  'rounded-in-smooth':      'rounded',
  'rounded-pointed':        'rounded',
  'star':                   'extra-rounded',
  'diamond':                'classy',
};

export const CORNER_SQUARE_MAP: Record<string, QRStylingCornerSquareType> = {
  'frame0':  'square',
  'frame1':  'extra-rounded',
  'frame2':  'dot',
  'frame3':  'extra-rounded',
  'frame4':  'square',
  'frame5':  'square',
  'frame6':  'extra-rounded',
  'frame7':  'square',
  'frame8':  'dot',
  'frame9':  'extra-rounded',
  'frame10': 'square',
  'frame11': 'extra-rounded',
  'frame12': 'dot',
  'frame13': 'square',
  'frame14': 'extra-rounded',
  'frame15': 'dot',
  'frame16': 'extra-rounded',
};

export const CORNER_DOT_MAP: Record<string, QRStylingCornerDotType> = {
  'ball0':  'square',
  'ball1':  'dot',
  'ball2':  'square',
  'ball3':  'dot',
  'ball4':  'square',
  'ball5':  'dot',
  'ball6':  'square',
  'ball7':  'dot',
  'ball8':  'square',
  'ball9':  'dot',
  'ball10': 'square',
  'ball11': 'dot',
  'ball12': 'square',
  'ball13': 'dot',
  'ball14': 'square',
  'ball15': 'dot',
  'ball16': 'square',
  'ball17': 'dot',
  'ball18': 'square',
  'ball19': 'dot',
};

export function mapDotsStyle(style: string): QRStylingDotType {
  return DOT_STYLE_MAP[style] ?? 'square';
}

export function mapCornerSquareStyle(style: string): QRStylingCornerSquareType {
  return CORNER_SQUARE_MAP[style] ?? 'square';
}

export function mapCornerDotStyle(style: string): QRStylingCornerDotType {
  return CORNER_DOT_MAP[style] ?? 'square';
}
