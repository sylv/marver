import { memo, useMemo } from 'react';
import type { IconType } from 'react-icons/lib';
import { graphql, unmask, type FragmentType } from '../../../../@generated';
import { pascalToLabel } from '../../../../helpers/pascalToLabel';
import { FileCard } from '../../parts/file-card';
import { FileLabel } from '../../parts/file-label';
import { formatExifValue } from './format';
import { EXIF_ICONS } from './icons';

const IGNORE_VALUES = new Set(['0', '0/0', '0/0/0', '0/0/0/0', 'unknown', 'none']);

const Fragment = graphql(`
  fragment FileExifProps on File {
    exifData {
      cameraMake
      cameraModel
      lensModel
      lensMake
      dateTime
      exposureTime
      fNumber
      flash
      focalLength
      iso
    }
  }
`);

export const FileExif = memo<{ file: FragmentType<typeof Fragment> }>(({ file: fileFrag }) => {
  const file = unmask(Fragment, fileFrag);
  const props = useMemo(() => {
    if (!file.exifData) return null;
    const props = [];
    for (const [key, value] of Object.entries(file.exifData)) {
      if (value == null) continue;
      if (IGNORE_VALUES.has(value.toString().toLowerCase())) continue;
      const Icon = EXIF_ICONS[key as keyof typeof EXIF_ICONS] as IconType | undefined;
      if (Icon) {
        props.push({ Icon, key, value });
      }
    }

    return props;
  }, [file.exifData]);

  if (!file.exifData || !props || !props[0]) return null;

  return (
    <FileCard title="Metadata">
      {props.map(({ Icon, key, value }) => (
        <FileLabel key={key}>
          <div className="text-xs">
            <div className="text-[0.65rem]">{pascalToLabel(key)}</div>
            <span className="text-zinc-100">{formatExifValue(value)}</span>
          </div>
          <div className="relative text-zinc-600">
            <Icon className="h-5 w-5" />
          </div>
        </FileLabel>
      ))}
    </FileCard>
  );
});
