#!/usr/bin/env node
// Run with: node scripts/build-qr-html.js
// Reads qr-code-styling and embeds it in QRGeneratorHTML.ts.
const fs = require('fs');
const path = require('path');
const jsPath = path.join(__dirname, '../assets/js/qr-code-styling.js');
const outputPath = path.join(__dirname, '../constants/QRGeneratorHTML.ts');

if (!fs.existsSync(jsPath)) {
  console.error('Missing assets/js/qr-code-styling.js — run: curl https://unpkg.com/qr-code-styling@1.6.0/lib/qr-code-styling.js -o assets/js/qr-code-styling.js');
  process.exit(1);
}

const js = fs.readFileSync(jsPath, 'utf8').replace('//# sourceMappingURL=qr-code-styling.js.map', '');
const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; }
    #qr-container { position: absolute; top: -9999px; left: -9999px; }
  </style>
</head>
<body>
  <div id="qr-container"></div>
  <script>
    ${js}
  </script>
  <script>
    var pendingGenerate = null;

    // iOS uses window.addEventListener, Android uses document.addEventListener.
    document.addEventListener('message', onMsg);
    window.addEventListener('message', onMsg);

    function onMsg(event) {
      try {
        var msg = JSON.parse(event.data);
        if (msg.type === 'generate') {
          generateQR(msg);
        } else if (msg.type === 'round') {
          roundImage(msg.dataUri, msg.radiusRatio || 0.04, function(result) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'round_result', data: result }));
          }, msg.format || 'png', msg.bgColor || '#ffffff');
        }
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
      }
    }

    function normalizeFormat(format) {
      return format === 'jpeg' || format === 'jpg' ? 'jpeg' : 'png';
    }

    function getExportBackground(msg) {
      if (!msg.transparent) return msg.bgColor || '#ffffff';
      return msg.format === 'jpeg' ? '#ffffff' : 'rgba(0,0,0,0)';
    }

    function exportCanvas(canvas, format, bgColor) {
      var exportFormat = normalizeFormat(format);
      if (exportFormat === 'jpeg') {
        var flattened = document.createElement('canvas');
        flattened.width = canvas.width;
        flattened.height = canvas.height;
        var flatCtx = flattened.getContext('2d');
        flatCtx.fillStyle = bgColor || '#ffffff';
        flatCtx.fillRect(0, 0, flattened.width, flattened.height);
        flatCtx.drawImage(canvas, 0, 0);
        return flattened.toDataURL('image/jpeg', 0.92);
      }
      return canvas.toDataURL('image/png');
    }

    function generateQR(msg) {
      var container = document.getElementById('qr-container');
      container.innerHTML = '';
      var el = document.createElement('div');
      container.appendChild(el);
      var exportFormat = normalizeFormat(msg.format);
      var exportBg = getExportBackground(msg);

      var options = {
        width: msg.size || 1024,
        height: msg.size || 1024,
        margin: (msg.margin || 0) + (msg.rounded ? Math.round((msg.size || 1024) * (msg.cornerRadiusRatio || 0.04)) : 0),
        type: 'canvas',
        data: msg.data || 'https://example.com',
        qrOptions: {
          errorCorrectionLevel: msg.logo ? 'H' : 'M'
        },
        dotsOptions: {
          color: msg.fgColor || '#000000',
          type: msg.dotsType || 'square'
        },
        backgroundOptions: {
          color: exportBg
        },
        cornersSquareOptions: {
          color: msg.fgColor || '#000000',
          type: msg.cornersSquareType || 'square'
        },
        cornersDotOptions: {
          color: msg.fgColor || '#000000',
          type: msg.cornersDotType || 'square'
        }
      };

      if (msg.logo) {
        options.image = msg.logo;
        options.imageOptions = {
          hideBackgroundDots: true,
          imageSize: 0.3,
          margin: msg.logoMargin || 4,
          crossOrigin: 'anonymous'
        };
      }

      try {
        var qrCode = new QRCodeStyling(options);
        qrCode.append(el);

        // Wait for canvas to render, then export.
        setTimeout(function() {
          var canvas = el.querySelector('canvas');
          if (!canvas) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'No canvas found' }));
            return;
          }
          var dataUri = exportCanvas(canvas, exportFormat, exportBg);
          if (msg.rounded) {
            roundImage(dataUri, msg.cornerRadiusRatio || 0.04, function(rounded) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'qr_result', data: rounded, requestId: msg.requestId }));
            }, exportFormat, exportBg);
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'qr_result', data: dataUri, requestId: msg.requestId }));
          }
        }, 100);
      } catch(e) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: e.message }));
      }
    }

    function roundImage(dataUri, radiusRatio, callback, format, bgColor) {
      var img = new Image();
      img.onload = function() {
        var exportFormat = normalizeFormat(format);
        var r = Math.round(img.width * (radiusRatio || 0.08));
        var c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        var ctx = c.getContext('2d');
        if (exportFormat === 'jpeg') {
          ctx.fillStyle = bgColor || '#ffffff';
          ctx.fillRect(0, 0, c.width, c.height);
        }
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(img.width - r, 0);
        ctx.quadraticCurveTo(img.width, 0, img.width, r);
        ctx.lineTo(img.width, img.height - r);
        ctx.quadraticCurveTo(img.width, img.height, img.width - r, img.height);
        ctx.lineTo(r, img.height);
        ctx.quadraticCurveTo(0, img.height, 0, img.height - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 0, 0);
        callback(c.toDataURL(exportFormat === 'jpeg' ? 'image/jpeg' : 'image/png', 0.92));
      };
      img.onerror = function() { callback(dataUri); };
      img.src = dataUri;
    }
  </script>
</body>
</html>`;

const source = `// Auto-generated — do not edit manually. Run scripts/build-qr-html.js to regenerate.\nexport const QR_GENERATOR_HTML: string = ${JSON.stringify(html)};\n`;

fs.writeFileSync(outputPath, source);
console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
