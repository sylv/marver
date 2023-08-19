'use client';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import * as React from 'react';

const groups = [
  {
    label: 'Personal Account',
    teams: [
      {
        label: 'Alicia Koch',
        value: 'personal',
      },
    ],
  },
  {
    label: 'Teams',
    teams: [
      {
        label: 'Acme Inc.',
        value: 'acme-inc',
      },
      {
        label: 'Monsters Inc.',
        value: 'monsters',
      },
    ],
  },
];

type Team = (typeof groups)[number]['teams'][number];

export const LibrarySwitcher = () => {
  const [open, setOpen] = React.useState(false);
  const [selectedTeam, setSelectedTeam] = React.useState<Team>(groups[0].teams[0]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a team"
          className={'w-[200px] justify-between'}
        >
          {selectedTeam.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div>
          {groups.map((group) => (
            <div key={group.label}>
              {group.teams.map((team) => (
                <div
                  key={team.value}
                  onSelect={() => {
                    setSelectedTeam(team);
                    setOpen(false);
                  }}
                  className="text-sm"
                >
                  {team.label}
                </div>
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
