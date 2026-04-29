---
name: Vivid Scan Narrative
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464554'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#767586'
  outline-variant: '#c7c4d7'
  surface-tint: '#494bd6'
  primary: '#4648d4'
  on-primary: '#ffffff'
  primary-container: '#6063ee'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#006591'
  on-secondary: '#ffffff'
  secondary-container: '#39b8fd'
  on-secondary-container: '#004666'
  tertiary: '#904900'
  on-tertiary: '#ffffff'
  tertiary-container: '#b55d00'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#c9e6ff'
  secondary-fixed-dim: '#89ceff'
  on-secondary-fixed: '#001e2f'
  on-secondary-fixed-variant: '#004c6e'
  tertiary-fixed: '#ffdcc5'
  tertiary-fixed-dim: '#ffb783'
  on-tertiary-fixed: '#301400'
  on-tertiary-fixed-variant: '#703700'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 20px
  gutter: 16px
---

## Brand & Style

The brand identity focuses on precision, speed, and approachability. This design system bridges the gap between a high-utility technical tool and a consumer-friendly lifestyle app. The personality is "Quietly Powerful"—it remains unobtrusive until needed, then provides a vibrant, confident interaction model.

The visual style is **Corporate / Modern**, leaning heavily into high-clarity layouts and refined functionalism. It utilizes generous whitespace to reduce cognitive load during the scanning process and employs high-contrast typography to ensure readability in varying lighting conditions (common for QR scanning). The emotional response should be one of reliability and efficiency, wrapped in a polished, premium interface.

## Colors

The palette is anchored by a vibrant **Indigo (Primary)**, chosen for its high energy and professional association. This color is reserved strictly for primary actions, active states, and successful scan feedback.

A high-contrast grayscale system ensures accessibility. **Slate-900** is used for primary text to maintain a softer look than pure black while preserving maximum legibility. Backgrounds remain crisp white or extremely light gray to create a "paper-like" canvas that makes the QR codes and action buttons pop.

## Typography

This design system uses **Inter** for all typographic needs to leverage its exceptional legibility and systematic feel. The hierarchy is strictly enforced:
- **Headlines:** Use tight letter-spacing and bold weights to ground the page.
- **Body:** Set with generous line-height to ensure instructions and metadata are easy to scan.
- **Labels:** Used for button text and category tags, utilizing a slightly heavier weight to distinguish them from body copy.

## Layout & Spacing

The layout utilizes a **fluid grid** optimized for mobile-first utility. The core spacing unit is a **4px baseline**, with most components separated by 16px (md) or 24px (lg) increments to create a clear "breathing room" between functional zones. 

Margins are set to 20px on mobile to prevent content from feeling cramped against the screen edges. Alignment is predominantly left-aligned for data and text, with center-alignment reserved specifically for the QR scanning viewfinder and primary call-to-action clusters.

## Elevation & Depth

Visual hierarchy is established through **Ambient Shadows** and **Tonal Layers**. 

- **Level 0 (Base):** The primary background (#FFFFFF).
- **Level 1 (Cards):** Slightly elevated using a very soft, diffused shadow (0px 4px 20px rgba(15, 23, 42, 0.05)) to separate scan results from the background.
- **Level 2 (Modals/Floating Actions):** Higher elevation with a more pronounced shadow to indicate temporary priority.

Instead of heavy borders, the system uses subtle 1px strokes in a light gray (#E2E8F0) to define boundaries in high-density areas.

## Shapes

The shape language is defined by "Friendly Geometry." Consistent with the **Rounded** setting (0.5rem base), the design system utilizes 12px for standard components and 16px for larger cards and containers. 

This specific radius balances the technical precision of a utility app with the approachability of a modern consumer product. Buttons and input fields should strictly adhere to the 12px radius, while the scanning viewfinder uses a larger 24px radius or a "squircle" to feel more organic.

## Components

- **Buttons:** Primary buttons use the Indigo fill with white text. Secondary buttons use a subtle gray ghost style. All buttons have a height of 56px for optimal touch targets.
- **Scanning Viewfinder:** A central, semi-transparent overlay with "corner brackets" that pulse slightly when a code is detected.
- **Chips:** Used for QR code categories (e.g., URL, WiFi, VCard). These use a light tint of the primary color with 50% opacity and bold 12px text.
- **Lists:** Data-dense scan history uses 16px padding and subtle bottom dividers. Each list item should include a small leading icon representing the data type.
- **Input Fields:** Minimalist design with a 1px border that transforms into a 2px Indigo border on focus. Labels are always visible above the field in `label-sm`.
- **Cards:** Used for scan results, featuring a clear primary action (e.g., "Open Link") and secondary actions (e.g., "Share", "Save") as icon buttons at the bottom.