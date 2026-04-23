# QRPoint Ausbau-Roadmap

> **For Hermes:** Use subagent-driven-development skill to implement this roadmap task-by-task.

**Goal:** QRPoint soll von einem guten QR-Generator zu einem kleinen Branding-Tool werden, das sauber erweiterbar ist und bei jeder Änderung automatisch getestet wird.

**Architecture:**
Die App bleibt bewusst leichtgewichtig in Vite + plain JavaScript. Neue Features kommen in kleine, isolierte Module, damit Render-Logik, UI und Utility-Funktionen getrennt bleiben. Jede Erweiterung bekommt mindestens eine kleine Verifikation oder Helper-Prüfung, damit wir nicht blind weiterbauen.

**Tech Stack:** Vite, plain JavaScript, Canvas, qrcode, Netlify

---

### Task 1: SVG-Download hinzufügen

**Objective:** Neben PNG auch SVG exportieren, damit QRPoint für Druck und skalierbare Nutzung besser wird.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Optional test helper: `scripts/verify-helpers.mjs`

**Step 1: Write failing verification**

Add a small helper test for a new function that returns SVG export options or SVG markup.

**Step 2: Run verification to confirm missing functionality**

Run: `npm run verify`
Expected: FAIL for the new SVG helper test until implemented.

**Step 3: Implement minimal SVG export**

Add a second download button or a dropdown action that exports the current QR as SVG.

**Step 4: Verify**

Run: `npm run build`
Run: `npm run verify`
Expected: PASS

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add svg export to qrpoint"
```

---

### Task 2: QR-Muster / Stil-Auswahl

**Objective:** Let the user choose between different QR styles such as classic squares, dots, rounded modules, or a more premium look.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Optional: `src/qr-utils.js`

**Scope:**
- Add a style selector for QR module rendering
- Start with safe styles only: classic, dots, rounded
- Keep scan reliability first
- Make style changes apply to preview and download consistently
- Avoid ultra-artistic shapes that hurt scannability

**Verification:**
- Switching styles changes the visible QR pattern
- QR remains readable in each safe mode
- Build passes

---

### Task 3: Farbpresets für QR und Hintergrund

**Objective:** Allow simple brand colors without breaking readability.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Optional: `src/qr-utils.js`

**Scope:**
- One foreground color picker
- One background color picker
- Keep safe defaults
- Auto-contrast warnings when colors are too weak

**Verification:**
- Build passes
- QR renders with selected colors
- Logo mode still uses high error correction

---

### Task 4: Preset cards for common use cases

**Objective:** Make QRPoint faster to use for common cases like website, WhatsApp, Wi-Fi, and contact links.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`

**Scope:**
- Clickable preset cards
- Better default text for each preset
- Optional helper descriptions

**Verification:**
- Preset selection updates content correctly
- Build passes

---

### Task 4: Simple QR history for recent codes

**Objective:** Let the user re-open the last few generated QR codes without retyping them.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Optional: `src/qr-utils.js`

**Scope:**
- Store last 5 items in localStorage
- Show them as compact chips
- Re-render on click

**Verification:**
- History survives reload
- Old entries don't break rendering

---

### Task 5: Polish and quality pass

**Objective:** Tighten UI, accessibility, and scan reliability.

**Files:**
- Modify: `src/main.js`
- Modify: `src/style.css`
- Modify: `README.md`

**Scope:**
- Better labels and keyboard handling
- Small empty-state improvements
- Document features and limits clearly

**Verification:**
- Manual browser check
- Build passes
- No obvious regressions
