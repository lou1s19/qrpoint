# QRPoint

Modern QR code generator for the web.

## Features
- Generate QR codes from links, text, or Wi-Fi strings
- Upload a logo and place it in the center of the QR code
- Adjustable size, margin, and logo scale
- PNG download
- Netlify-ready

## Development scripts
```bash
npm install
npm run dev
npm run build
npm run verify
```

## Architecture notes
- `src/main.js` handles UI and rendering
- `src/qr-utils.js` contains reusable QR helpers for future features
- `scripts/verify-helpers.mjs` is a lightweight sanity check for the helper layer

## Deploy
Connect the GitHub repo to Netlify and use:
- Build command: `npm run build`
- Publish directory: `dist`
