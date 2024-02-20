import { useEffect } from 'react';
import { useQuery, type AnyVariables, type UseQueryArgs, type UseQueryResponse } from 'urql';

export const usePolledQuery = <Data = any, Variables extends AnyVariables = AnyVariables>(
  args: UseQueryArgs<Variables, Data> & { pollInterval: number | undefined | null },
): UseQueryResponse<Data, Variables> => {
  const [data, executeQuery] = useQuery<Data, Variables>(args);

  useEffect(() => {
    if (data.fetching) return;
    if (!args.pollInterval) return;
    const interval = setInterval(() => {
      executeQuery({ requestPolicy: 'network-only' });
    }, args.pollInterval);

    return () => clearInterval(interval);
  }, [data.fetching, args.pollInterval, executeQuery]);

  return [data, executeQuery];
};
