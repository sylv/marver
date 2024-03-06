import { cva } from 'class-variance-authority';
import { memo } from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { graphql, unmask, type FragmentType } from '../../../@generated';
import { State } from '../../../@generated/graphql';
import { snakeToLabel } from '../../../helpers/snakeToLabel';
import { FileCardToggle } from '../parts/file-card';
import { FileLabel } from '../parts/file-label';

const STRIP_PATTERN = /^(IMAGE|VIDEO)_/;
const iconClasses = cva('h-4 w-4 flex-shrink-0', {
  variants: {
    kind: {
      [State.Completed]: 'text-green-500',
      [State.Failed]: 'text-red-500',
    },
  },
});

const Fragment = graphql(`
  fragment FileTasksProps on File {
    jobStates {
      state
      type
    }
  }
`);

// todo: display tasks that havent run, or that are waiting on other tasks to run
// todo: display child tasks better
// todo: display task errors
export const FileTasks = memo<{ file: FragmentType<typeof Fragment> }>(({ file: fileFrag }) => {
  const file = unmask(Fragment, fileFrag);
  if (!file.jobStates[0]) return null;
  return (
    <FileCardToggle title="Tasks">
      {file.jobStates.map((jobState) => {
        const Icon = jobState.state === State.Completed ? FiCheckCircle : FiXCircle;

        return (
          <FileLabel key={jobState.type}>
            <div>
              <div className="text-xs text-left">{jobState.state}</div>
              <div className="text-sm text-white">
                {snakeToLabel(jobState.type.replace(STRIP_PATTERN, ''))}
              </div>
            </div>
            <Icon className={iconClasses({ kind: jobState.state })} />
          </FileLabel>
        );
      })}
    </FileCardToggle>
  );
});
