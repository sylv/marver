import React, { Fragment } from 'react';
import { Button } from '../components/ui/button';
import { ModeToggle } from '../components/mode-toggle';
import { Center } from '../components/center';
import { LibrarySwitcher } from '../components/library-switcher';

export default function HomePage() {
  return (
    <Fragment>
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <Button variant="destructive">Hi</Button>
          <ModeToggle />
          <LibrarySwitcher />
        </div>
      </div>
    </Fragment>
  );
}
