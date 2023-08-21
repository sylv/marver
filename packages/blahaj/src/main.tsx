import { devtoolsExchange } from '@urql/devtools';
import { cacheExchange } from '@urql/exchange-graphcache';
import { relayPagination } from '@urql/exchange-graphcache/extras';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider, createClient, fetchExchange } from 'urql';
import { App } from './app';
import schema from './generated/introspection.json';
import './index.css';
import { ThemeProvider } from './components/theme-provider';

const client = createClient({
  url: '/api/graphql',
  exchanges: [
    devtoolsExchange,
    cacheExchange({
      schema: schema as any,
      keys: {
        FileMetadata: () => null,
        BoundingBox: () => null,
        Media: (data) => {
          const file = data.file;
          if (!file) throw new Error('No file');
          return (file as any).id;
        },
      },
      resolvers: {
        Query: {
          files: relayPagination(),
          mediaList: relayPagination(),
        },
      },
    }),
    fetchExchange,
  ],
});

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <Provider value={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </ThemeProvider>
  </React.StrictMode>,
);
