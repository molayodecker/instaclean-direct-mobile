/** Shared breakpoints — width in logical pixels (portrait/landscape via useWindowDimensions). */
export const layout = {
  tabletMinWidth: 768,
  largeTabletMinWidth: 1024,
  /** Primary admin content column on iPad */
  contentMaxWidth: 720,
  /** Dashboards / More menu on 12.9" iPad */
  wideContentMaxWidth: 980,
  /** Sign-in and narrow forms */
  formMaxWidth: 440,
  /** WhatsApp thread reading width */
  chatMaxWidth: 640,
} as const;
