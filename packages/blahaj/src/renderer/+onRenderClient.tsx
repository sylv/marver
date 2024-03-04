import { cacheExchange } from '@urql/exchange-graphcache';
import { hydrateRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider as UrqlProvider, createClient, fetchExchange, ssrExchange } from 'urql';
import type { OnRenderClientAsync } from 'vike/types';
import { App } from '../app';
import { cacheOptions, retryExchange } from './cache';
import { PageContextProvider } from './usePageContext';

export const onRenderClient: OnRenderClientAsync = async (pageContext) => {
  const { Page } = pageContext;
  const exchanges = [
    cacheExchange(cacheOptions),
    ssrExchange({ isClient: true, initialState: pageContext.state }),
    retryExchange,
    fetchExchange,
  ];

  if (import.meta.env.MODE === 'development') {
    const { devtoolsExchange } = await import('@urql/devtools');
    exchanges.unshift(devtoolsExchange);
  }

  const client = createClient({
    url: '/api/graphql',
    exchanges: exchanges,
  });

  hydrateRoot(
    document.querySelector('#root')!,
    <PageContextProvider pageContext={pageContext}>
      <UrqlProvider value={client}>
        <HelmetProvider>
          <App>
            <Page routeParams={pageContext.routeParams || {}} />
          </App>
        </HelmetProvider>
      </UrqlProvider>
    </PageContextProvider>,
  );
};
