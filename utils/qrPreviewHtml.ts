import { QRCodeConfig } from '@/constants/QRTypes';
import { mapCornerDotStyle, mapCornerSquareStyle, mapDotsStyle } from '@/constants/QRStyleMapping';

export function buildQRPreviewHtml(content: string, config: QRCodeConfig) {
  const bgColor = config.transparentBg ? '#ffffff' : config.bgColor;
  const logoSnippet = config.logo
    ? `
      options.image = cfg.logo;
      options.imageOptions = {
        crossOrigin: 'anonymous',
        margin: Math.max(cfg.logoMargin ?? 0, 10),
        imageSize: 0.3,
        hideBackgroundDots: true
      };
    `
    : '';

  return `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${bgColor};overflow:hidden}
    canvas,svg{max-width:100%;max-height:100%}
  </style>
  </head><body><div id="c"></div>
  <script src="https://unpkg.com/qr-code-styling@1.9.2/lib/qr-code-styling.js"></script>
  <script>
    var cfg = ${JSON.stringify(config)};
    var options = {
      width: 128,
      height: 128,
      type: 'canvas',
      data: ${JSON.stringify(content || 'https://example.com')},
      margin: 6,
      qrOptions: { errorCorrectionLevel: cfg.logo ? 'H' : 'M' },
      dotsOptions: { color: cfg.fgColor || '#4648d4', type: ${JSON.stringify(mapDotsStyle(config.dotsStyle))}, roundSize: true },
      cornersSquareOptions: { type: ${JSON.stringify(mapCornerSquareStyle(config.cornerSquareStyle))}, color: cfg.fgColor || '#4648d4' },
      cornersDotOptions: { type: ${JSON.stringify(mapCornerDotStyle(config.cornerDotStyle))}, color: cfg.fgColor || '#4648d4' },
      backgroundOptions: { color: ${JSON.stringify(bgColor)} }
    };
    ${logoSnippet}
    new QRCodeStyling(options).append(document.getElementById('c'));
  </script></body></html>`;
}
