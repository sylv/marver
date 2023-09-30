import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { relayStylePagination } from '@apollo/client/utilities';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { ThemeProvider } from './components/theme-provider';
import './index.css';

const client = new ApolloClient({
  uri: '/api/graphql',
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          files: relayStylePagination(),
          mediaList: relayStylePagination(['search']),
        },
      },
      Media: {
        keyFields: (data) => {
          const file = data.file;
          if (!file) throw new Error('No file');
          return (file as any).id;
        },
      },
    },
  }),
});

ReactDOM.createRoot(document.querySelector('#root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
