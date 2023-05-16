import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import routes from '~react-pages';
import { Background } from './components/background';
import { Navigation } from './components/navigation';
import { SpinnerCenter } from './components/spinner';

export function App() {
  return (
    <Suspense fallback={<SpinnerCenter />}>
      <div className="mb-10">
        <Navigation />
        {useRoutes(routes)}
      </div>
      <Background />
    </Suspense>
  );
}
