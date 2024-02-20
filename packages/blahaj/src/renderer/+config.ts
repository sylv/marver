import type { Config } from 'vike/types';

export default {
  passToClient: ['state', 'routeParams'],
  prefetchStaticAssets: 'viewport',
  clientRouting: true,
  hydrationCanBeAborted: true,
} satisfies Config;
