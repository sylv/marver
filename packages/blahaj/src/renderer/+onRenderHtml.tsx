import { cacheExchange } from '@urql/exchange-graphcache';
import { renderToString } from 'react-dom/server';
import type { HelmetServerState } from 'react-helmet-async';
import { HelmetProvider } from 'react-helmet-async';
import prepass from 'react-ssr-prepass';
import { Provider as UrqlProvider, createClient, fetchExchange, ssrExchange } from 'urql';
import { dangerouslySkipEscape, escapeInject } from 'vike/server';
import type { OnRenderHtmlAsync } from 'vike/types';
import { App } from '../app';
import { cacheOptions } from './cache';
import type { PageProps } from './types';
import { PageContextProvider } from './usePageContext';

const GRAPHQL_URL =
  (import.meta.env.PUBLIC_ENV__FRONTEND_API_URL || import.meta.env.FRONTEND_API_URL) + '/graphql';

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext): ReturnType<OnRenderHtmlAsync> => {
  const { Page } = pageContext;
  const pageProps: PageProps = { routeParams: pageContext.routeParams };

  const ssr = ssrExchange({ isClient: false });
  const client = createClient({
    url: GRAPHQL_URL,
    suspense: true,
    exchanges: [cacheExchange(cacheOptions), ssr, fetchExchange],
  });

  const helmetContext: { helmet?: HelmetServerState } = {};
  const tree = (
    <PageContextProvider pageContext={pageContext}>
      <UrqlProvider value={client}>
        <HelmetProvider context={helmetContext}>
          <App>
            <Page {...pageProps} />
          </App>
        </HelmetProvider>
      </UrqlProvider>
    </PageContextProvider>
  );

  await prepass(tree);
  const stream = renderToString(tree);
  const helmet = helmetContext.helmet!;
  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="en">
      <!-- .. ... / .- -. -.-- --- -. . / - .... . .-. . ..--.. / --- .... / -....- / .... .. -.-.-- -->
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${dangerouslySkipEscape(helmet.title.toString())}
        ${dangerouslySkipEscape(helmet.priority.toString())}
        ${dangerouslySkipEscape(helmet.meta.toString())}
        ${dangerouslySkipEscape(helmet.link.toString())}
        ${dangerouslySkipEscape(helmet.script.toString())}
        <script type="text/javascript">
          const theme = localStorage.getItem("ui-theme");
          switch(theme) {
            case "dark":
              document.documentElement.classList.add("dark");
              break;
            case "light":
              document.documentElement.classList.add("light");
              break;
            default:
              const prefers = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
              document.documentElement.classList.add(prefers)}
        </script>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(stream)}</div>
      </body>
    </html>`;

  return {
    documentHtml: documentHtml,
    pageContext: {
      state: ssr.extractData(),
    },
  };
};
