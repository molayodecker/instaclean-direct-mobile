import type { Href } from 'expo-router';

export type MoreMenuItem = {
  label: string;
  icon: string;
  href?: Href;
};

export type MoreMenuSection = {
  title: string;
  items: MoreMenuItem[];
};

/** Static navigation only — every linked screen loads data from Mithril. */
export const moreSections: MoreMenuSection[] = [
  {
    title: 'OPERATIONS',
    items: [
      { label: 'Bookings', icon: 'calendar', href: '/(tabs)/bookings' },
      { label: 'Concierge', icon: 'flash', href: '/concierge' },
      { label: 'New booking', icon: 'add-circle', href: '/assisted-booking' },
      { label: 'WhatsApp', icon: 'logo-whatsapp', href: '/whatsapp' },
      { label: 'Live jobs', icon: 'radio', href: '/(tabs)/live' },
      { label: 'Dispatch map', icon: 'map', href: '/dispatch-map' },
      { label: 'Placements', icon: 'home', href: '/placements' },
    ],
  },
  {
    title: 'PEOPLE',
    items: [
      { label: 'Customers', icon: 'people', href: '/customers' },
      { label: 'Customer trust', icon: 'shield', href: '/customer-trust' },
      { label: 'Workers', icon: 'construct', href: '/workers' },
      { label: 'Worker health', icon: 'heart', href: '/worker-health' },
      { label: 'Reviews', icon: 'star', href: '/reviews' },
    ],
  },
  {
    title: 'MONEY & GROWTH',
    items: [
      { label: 'Payments & payouts', icon: 'cash', href: '/payouts' },
      { label: 'Billing', icon: 'document-text', href: '/billing' },
      { label: 'Contracts', icon: 'briefcase', href: '/contracts' },
      { label: 'Worker loans', icon: 'wallet', href: '/finance/loans' },
      { label: 'Services & pricing', icon: 'pricetag', href: '/services' },
      { label: 'Promo codes', icon: 'ticket', href: '/promo-codes' },
      { label: 'Service areas', icon: 'location', href: '/service-areas' },
      { label: 'Reports', icon: 'stats-chart', href: '/reports' },
    ],
  },
  {
    title: 'ADMIN',
    items: [
      { label: 'Team & roles', icon: 'people-circle', href: '/team' },
      { label: 'Notifications', icon: 'notifications', href: '/notifications' },
      { label: 'Merge accounts', icon: 'git-merge', href: '/users/merge' },
      { label: 'App update policy', icon: 'phone-portrait', href: '/app-update-policy' },
      { label: 'Settings', icon: 'settings', href: '/settings' },
    ],
  },
];
