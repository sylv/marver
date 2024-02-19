import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { SpinnerCenter } from './components/spinner';

export function App() {
  return <Suspense fallback={<SpinnerCenter />}>{useRoutes(routes)}</Suspense>;
}
