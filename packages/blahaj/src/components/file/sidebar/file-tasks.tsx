import { cva } from "class-variance-authority";
import type { FragmentOf } from "gql.tada";
import type { FC } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { graphql, unmask } from "../../../graphql";
import { snakeToLabel } from "../../../helpers/snakeToLabel";
import { FileCardToggle } from "../parts/file-card";
import { FileLabel } from "../parts/file-label";

const STRIP_PATTERN = /^(IMAGE|VIDEO)_/;
const iconClasses = cva("h-4 w-4 flex-shrink-0", {
  variants: {
    kind: {
      Completed: "text-green-500",
      Failed: "text-red-500",
    },
  },
});

export const FileTasksFragment = graphql(`
  fragment FileTasks on File {
    id
    jobStates {
      state
      type
    }
  }
`);

// todo: display tasks that havent run, or that are waiting on other tasks to run
// todo: display child tasks better
// todo: display task errors
export const FileTasks: FC<{ file: FragmentOf<typeof FileTasksFragment> }> = ({ file: fileFrag }) => {
  const file = unmask(FileTasksFragment, fileFrag);
  if (!file.jobStates[0]) return null;
  return (
    <FileCardToggle title="Tasks">
      {file.jobStates.map((jobState) => {
        const Icon = jobState.state === "Completed" ? FiCheckCircle : FiXCircle;

        return (
          <FileLabel key={jobState.type}>
            <div>
              <div className="text-xs text-left">{jobState.state}</div>
              <div className="text-sm text-white">
                {snakeToLabel(jobState.type.replace(STRIP_PATTERN, ""))}
              </div>
            </div>
            <Icon className={iconClasses({ kind: jobState.state })} />
          </FileLabel>
        );
      })}
    </FileCardToggle>
  );
};
