import type * as React from 'react';

// The look of the hotel's mobile app, mirrored by the preview. One place, so
// syncing with the app's theme means editing this file only.
// ponytail: neutral iOS-like values until they are checked against the app.
export const appTokens = {
  // Logical iPhone viewport the preview is drawn at, then scaled to fit.
  viewport: { width: 393, height: 852 },
  font: '-apple-system, system-ui, BlinkMacSystemFont, "Helvetica Neue", sans-serif',
  color: {
    background: '#f2f2f7',
    surface: '#ffffff',
    text: '#000000',
    secondaryText: '#8a8a8e',
    separator: '#c6c6c8',
    accent: '#007aff',
    chevron: '#c4c4c7',
    // Thumbnail of a page without images
    placeholder: '#e5e5ea',
    hiddenBanner: '#fff4e5',
    hiddenBannerText: '#8a4b00'
  },
  // Points (= CSS px at scale 1).
  spacing: { screen: 16, row: 12, section: 24 },
  fontSize: { body: 17, subtitle: 15, title: 28, navTitle: 17, h2: 22, h3: 19 },
  radius: { card: 10, image: 10 }
} as const;

/** The tokens as CSS variables for the preview's root element. */
export const appTokenStyle = {
  '--app-font': appTokens.font,
  '--app-bg': appTokens.color.background,
  '--app-surface': appTokens.color.surface,
  '--app-text': appTokens.color.text,
  '--app-text-2': appTokens.color.secondaryText,
  '--app-separator': appTokens.color.separator,
  '--app-accent': appTokens.color.accent,
  '--app-chevron': appTokens.color.chevron,
  '--app-placeholder': appTokens.color.placeholder,
  '--app-banner': appTokens.color.hiddenBanner,
  '--app-banner-text': appTokens.color.hiddenBannerText,
  '--app-screen': `${appTokens.spacing.screen}px`,
  '--app-row': `${appTokens.spacing.row}px`,
  '--app-section': `${appTokens.spacing.section}px`,
  '--app-body': `${appTokens.fontSize.body}px`,
  '--app-subtitle': `${appTokens.fontSize.subtitle}px`,
  '--app-title': `${appTokens.fontSize.title}px`,
  '--app-nav-title': `${appTokens.fontSize.navTitle}px`,
  '--app-h2': `${appTokens.fontSize.h2}px`,
  '--app-h3': `${appTokens.fontSize.h3}px`,
  '--app-radius': `${appTokens.radius.card}px`,
  '--app-image-radius': `${appTokens.radius.image}px`
} as React.CSSProperties;
