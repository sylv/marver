import { FiChevronDown } from "react-icons/fi";
import { useMutation } from "urql";
import { Spinner, SpinnerCenter, SpinnerSize } from "../../components/spinner";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { usePolledQuery } from "../../hooks/usePolledQuery";
import { graphql } from "../../graphql";

const TasksQuery = graphql(`
  query Tasks {
    tasks {
      id
      name
      description
      running
      nextRunAt
    }
  }
`);

const RunTask = graphql(`
  mutation RunTask($id: ID!) {
    runTask(id: $id) {
      id
      nextRunAt
      running
    }
  }
`);

export function Page() {
  const [runningTask, runTask] = useMutation(RunTask);
  const [{ error, data }] = usePolledQuery({
    query: TasksQuery,
    pollInterval: 1000,
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (!data) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-20 space-y-2">
      <div className="flex flex-col gap-2">
        {data.tasks.map((task) => (
          <Card key={task.name}>
            <div className="flex items-center justify-between p-4">
              <div className="flex flex-col">
                <div className="font-semibold flex items-center gap-2">
                  {task.name}
                  {task.running && <Spinner size={SpinnerSize.Small} />}
                </div>
                <p className="text-sm text-muted-foreground">{task.description}</p>
              </div>
              <div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={runningTask.fetching || !!task.running}
                  onClick={() =>
                    runTask({
                      id: task.id,
                    })
                  }
                >
                  Run Now
                </Button>
              </div>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-muted text-xs text-muted-foreground hover:text-primary transition w-full flex items-center justify-center gap-2"
            >
              Show Logs
              <FiChevronDown />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
