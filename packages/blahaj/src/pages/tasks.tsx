import { useMutation, useQuery } from '@apollo/client';
import { FiChevronDown } from 'react-icons/fi';
import { RunTaskDocument, TasksDocument } from '../@generated/graphql';
import { Loading } from '../components/loading';
import { Spinner, SpinnerSize } from '../components/spinner';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export default function Tasks() {
  const [runTask, runningTask] = useMutation(RunTaskDocument);
  const { loading, error, data } = useQuery(TasksDocument, {
    pollInterval: 1000,
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (loading || !data) return <Loading />;

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
                  disabled={runningTask.loading || !!task.running}
                  onClick={() =>
                    runTask({
                      variables: {
                        id: task.id,
                      },
                    })
                  }
                >
                  Run Now
                </Button>
              </div>
            </div>
            <button className="px-4 py-2 bg-muted text-xs text-muted-foreground hover:text-primary transition w-full flex items-center justify-center gap-2">
              Show Logs
              <FiChevronDown />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
