import seededGradient from '@privjs/gradients';
import { memo, useMemo } from 'react';
import { LuImage } from 'react-icons/lu';
import type { CollectionPartsFragment } from '../../@generated/graphql';
import { Card } from '../ui/card';
import { Image } from '../image';
import { cn } from '../../helpers/cn';

export const CollectionPreview = memo<{ collection: CollectionPartsFragment }>(({ collection }) => {
  const href = `/collections/${collection.id}`;
  const gradient = useMemo(() => {
    if (!collection.previewFiles) return null;
    return seededGradient(collection.id);
  }, [collection]);

  return (
    <a href={href}>
      <Card className="h-40 w-full bg-zinc-900 flex flex-col justify-between overflow-hidden rounded-md relative">
        <div
          className={cn(
            'z-10 p-3 flex justify-between flex-col absolute top-0 left-0 right-0 bottom-0 transition duration-75',
            !collection.previewFiles[0] &&
              'bg-gradient-to-b from-black/70 via-transparent to-black/70 hover:bg-black/30',
            collection.previewFiles[0] && 'bg-black/50 hover:bg-black/70',
          )}
        >
          <div className="flex items-center justify-between gap-1">
            <h2>{collection.name}</h2>
            {collection.fileCount && (
              <div className="flex items-center gap-1 text-xs">
                <LuImage className="inline-block h-3.5 h-3.5" />
                {collection.fileCount.toLocaleString()}
              </div>
            )}
          </div>
          <p className="text-sm w-full truncate">{collection.description || 'No description'}</p>
        </div>
        {collection.previewFiles[0] && (
          <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
            {collection.previewFiles.map((file) => (
              <Image key={file.id} file={file} className="rounded-none h-full w-full object-cover" />
            ))}
          </div>
        )}
        {!collection.previewFiles[0] && gradient && (
          <div className="w-full h-full" style={{ backgroundImage: gradient }}></div>
        )}
      </Card>
    </a>
  );
});
