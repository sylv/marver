import React, { FC } from 'react';
import { FiPauseCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { setSearch, useSearchStore } from '../search';
import { SmartSearchInput } from './search/smart-search-input';

export const Navigation: FC = () => {
  const query = useSearchStore((state) => state.query);
  const navigate = useNavigate();

  return (
    <div className="container mx-auto mt-6">
      <div className="rounded-lg bg-gray-800/60 min-h-14 flex justify-between">
        <div className="ml-16 bg-black/20">
          <SmartSearchInput height="h-full w-[32em]" value={query} onChange={(value) => setSearch(value, navigate)} />
        </div>
        <button className="flex items-center bg-gray-800/40 py-4 px-8 h-full mr-16 hover:bg-gray-700/40 transition group">
          <div className="flex flex-col justify-center items-start">
            <div className="text-gray-500 text-xs">Current Task</div>
            <div>Generating thumbnails</div>
          </div>
          <FiPauseCircle className="ml-6 text-gray-700 group-hover:text-green-400 transition" size={24} />
        </button>
      </div>
    </div>
  );
};
