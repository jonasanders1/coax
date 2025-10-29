// This file contains route configurations that can be imported in both App.tsx and vite.config.ts
export const routes = [
  { path: '/', name: 'Home' },
  { path: '/produkter', name: 'Products' },
  { path: '/produkter/:id', name: 'ProductDetails' },
  { path: '/velg-modell', name: 'ModelSelector' },
  { path: '/faq', name: 'FAQ' },
  { path: '/referanser', name: 'References' },
  { path: '/kontakt', name: 'Contact' },
  // { path: '/kalkulator', name: 'Calculator' },
  { path: '/thanks', name: 'Thanks' },
  { path: '*', name: 'NotFound' },
];
