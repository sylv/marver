import clsx from 'clsx';
import JSON5 from 'json5';
import { AlignLeft, Check, ChevronDown, X } from 'lucide-react';
import { useEffect, useMemo, useState, type FC } from 'react';
import {
  CompletionState,
  CompletionsDocument,
  useCompletionsQuery,
  useRejectCompletionMutation,
  useVerifyCompletionMutation,
  type RegularCompletionFragment,
  type CompletionsQuery,
  type CompletionsQueryVariables,
} from '../@generated/graphql';
import { Codeblock } from '../components/codeblock';
import { Loading } from '../components/loading';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { tokenizeStringFromObject, type Token } from '../helpers/tokenize';
import { produce } from 'immer';

const IMPORTANT_KEYS = ['category', 'title', 'name', 'cleanName', 'description', ''];
const TYPE_DESCRIPTIONS: Record<string, string> = {
  path_metadata: 'Extract metadata from the file path',
};

const prettifyObject = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  const keys = Object.keys(obj);
  // important keys first, preferring the order of IMPORTANT_KEYS
  keys.sort((a, b) => {
    const aIndex = IMPORTANT_KEYS.indexOf(a);
    const bIndex = IMPORTANT_KEYS.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });

  const formatted: Record<string, unknown> = {};
  for (const key of keys) {
    const value = obj[key];
    formatted[key] = value;
  }

  return formatted as Partial<T>;
};

const getDataPreview = (data: unknown) => {
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    if (keys.length === 1) return (data as any)[keys[0]].toString();
    return JSON5.stringify(data);
  }

  return String(data);
};

export default function CompletionsPage() {
  const [state, setState] = useState(CompletionState.PendingVerification);
  const { data, error, loading } = useCompletionsQuery({
    variables: {
      state: state,
    },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (loading || !data?.completions) return <Loading />;

  return (
    <div className="container mx-auto mt-20 space-y-2">
      <div className="grid grid-cols-6 gap-2">
        <div className="flex flex-col gap-2">
          <div className="text-xl font-bold">Filters</div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setState(CompletionState.PendingVerification)}
          >
            Pending Verification
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setState(CompletionState.VerifiedManual)}
          >
            Verified Manual
          </Button>
        </div>
        <div className="col-span-5 space-y-2">
          {data.completions.edges.map((completion) => (
            <Completion completion={completion.node} key={completion.node.id} />
          ))}
        </div>
      </div>
    </div>
  );
}

const Completion: FC<{ completion: RegularCompletionFragment }> = ({ completion }) => {
  const [expanded, setExpanded] = useState(false);
  const typeDescription = TYPE_DESCRIPTIONS[completion.type] || completion.type;
  const preview = useMemo(() => {
    if (!completion.result) return null;
    return JSON5.stringify(prettifyObject(completion.result), null, 2);
  }, [expanded, completion.result]);

  const [verify, verifyData] = useVerifyCompletionMutation({
    optimisticResponse: {
      __typename: 'Mutation',
      verifyCompletion: produce(completion, (draft) => {
        draft.state = CompletionState.VerifiedManual;
      }),
    },
    update: (cache, { data }) => {
      if (!data) return null;
      // move from the Pending query to the Verified query
      cache.updateQuery<CompletionsQuery, CompletionsQueryVariables>(
        {
          query: CompletionsDocument,
          variables: { state: CompletionState.PendingVerification },
        },
        (query) => {
          if (!query) return null;
          return produce(query, (draft) => {
            const index = draft.completions.edges.findIndex(
              (edge) => edge.node.id === completion.id,
            );
            if (index === -1) return;
            draft.completions.edges.splice(index, 1);
          });
        },
      );

      cache.updateQuery<CompletionsQuery, CompletionsQueryVariables>(
        {
          query: CompletionsDocument,
          variables: { state: CompletionState.VerifiedManual },
        },
        (query) => {
          if (!query) return null;
          return produce(query, (draft) => {
            draft.completions.edges.unshift({
              __typename: 'CompletionEdge',
              node: data.verifyCompletion,
            });
          });
        },
      );
    },
  });

  const [reject, rejectData] = useRejectCompletionMutation({
    optimisticResponse: {
      __typename: 'Mutation',
      rejectCompletion: produce(completion, (draft) => {
        draft.state = CompletionState.PendingCompletion;
        draft.result = undefined;
        draft.alwaysInclude = false;
        draft.examples = [];
        draft.examplesSimilarity = null;
      }),
    },
    update: (cache, { data }) => {
      if (!data) return null;
      // move from the Pending query to the Verified query
      cache.updateQuery<CompletionsQuery, CompletionsQueryVariables>(
        {
          query: CompletionsDocument,
          variables: { state: CompletionState.PendingVerification },
        },
        (query) => {
          if (!query) return null;
          return produce(query, (draft) => {
            const index = draft.completions.edges.findIndex(
              (edge) => edge.node.id === completion.id,
            );
            if (index === -1) return;
            draft.completions.edges.splice(index, 1);
          });
        },
      );

      cache.updateQuery<CompletionsQuery, CompletionsQueryVariables>(
        {
          query: CompletionsDocument,
          variables: { state: CompletionState.PendingCompletion },
        },
        (query) => {
          if (!query) return null;
          return produce(query, (draft) => {
            draft.completions.edges.unshift({
              __typename: 'CompletionEdge',
              node: data.rejectCompletion,
            });
          });
        },
      );
    },
  });

  const disableControls = rejectData.loading || verifyData.loading;

  return (
    <Card>
      <div className="p-4 bg-gradient-to-r flex justify-between items-center gap-2 pb-4">
        <div>
          <span className="text-muted-foreground text-xs lowercase font-mono">
            {typeDescription}
          </span>
          <div>
            <CompletionHighlight
              preview={getDataPreview(completion.data)}
              result={completion.result}
            />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button size="sm" variant="outline">
            <AlignLeft className="mr-2 h-4 w-4" /> Details
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={disableControls}
            icon={<X className="mr-2 h-4 w-4" />}
            loading={rejectData.loading}
            onClick={() =>
              reject({
                variables: { id: completion.id },
              })
            }
          >
            Reject
          </Button>
          <Button
            size="sm"
            variant="default"
            disabled={disableControls}
            icon={<Check className="mr-2 h-4 w-4" />}
            loading={verifyData.loading}
            onClick={() =>
              verify({
                variables: { id: completion.id },
              })
            }
          >
            Approve
          </Button>
        </div>
      </div>
      {(preview || completion.examples[0]) && (
        <div
          onClick={() => setExpanded(true)}
          className={clsx(
            'relative',
            !expanded &&
              'max-h-36 overflow-hidden bg-gradient-to-b from-transparent to-black/50 cursor-pointer',
          )}
        >
          {preview && (
            <div className="p-4 pt-0">
              <Codeblock>{preview}</Codeblock>
            </div>
          )}
          {expanded && completion.examples[0] && (
            <div className="grid grid-cols-2 gap-3 px-4 pb-9">
              {[...completion.examples]
                .sort((a, b) => b.similarity - a.similarity)
                .map(({ example, similarity }) => (
                  <div key={example.id} className="flex bg-secondary rounded-lg">
                    <div className="bg-black/40 p-2 text-muted-foreground font-mono text-sm flex items-center justify-center">
                      {Math.floor(similarity * 100)}%
                    </div>
                    <div className="p-2 truncate">{getDataPreview(example.data)}</div>
                  </div>
                ))}
            </div>
          )}
          <button
            className="absolute bottom-0 right-0 left-0 py-2 flex items-center justify-center gap-1 text-sm text-muted-foreground"
            onClick={(event) => {
              event.stopPropagation();
              setExpanded((prev) => !prev);
            }}
          >
            {expanded ? 'show less' : 'show more'}
            <ChevronDown className={clsx('h-3 w-3', expanded && 'rotate-180')} />
          </button>
        </div>
      )}
    </Card>
  );
};

// const completionVariants = cva(
//   'pr-2 py-1 rounded-full flex-shrink-0 inline-flex items-center justify-center text-xs lowercase shadow flex items-center justify-center',
//   {
//     variants: {
//       state: {
//         [CompletionState.BuiltIn]: 'bg-blue-900 text-blue-400',
//         [CompletionState.VerifiedAuto]: 'bg-green-800 text-green-300',
//         [CompletionState.VerifiedHybrid]: 'bg-green-900 text-green-400',
//         [CompletionState.VerifiedManual]: 'bg-green-900 text-green-400',
//         [CompletionState.PendingCompletion]: 'bg-red-900 text-red-400',
//         [CompletionState.PendingVerification]: 'bg-amber-900 text-amber-400',
//       },
//     },
//   },
// );

// const CompletionLabelIcon: FC<{ state: CompletionState; className: string }> = ({
//   state,
//   className,
// }) => {
//   if (state === CompletionState.BuiltIn) return <Box className={className} />;
//   if (state === CompletionState.PendingVerification) return <AlertOctagon className={className} />;
//   if (state === CompletionState.VerifiedAuto) return <Info className={className} />;
//   if (state === CompletionState.PendingCompletion) {
//     return <Loader2 className={clsx(className, 'animate-spin')} />;
//   }

//   return <Check className={className} />;
// };

// const CompletionLabel: FC<VariantPropsWithRequired<typeof completionVariants, 'state'>> = ({
//   state,
// }) => {
//   // -mt-0.5 is because the text is lowercase, which makes it look like its not centered.
//   // with the slight adjustment it looks 🤌
//   return (
//     <div className={completionVariants({ state })}>
//       <CompletionLabelIcon className="h-3.5" state={state} />
//       <span className="-mt-0.5">{labelize(state)}</span>
//     </div>
//   );
// };

// todo: this will only really make sense for the path_metadata type,
// other types will need special previews.
const CompletionHighlight: FC<{ preview: string; result?: Record<string, unknown> }> = ({
  preview,
  result,
}) => {
  const [tokenized, setTokenized] = useState<Token[]>(() => [{ text: preview }]);

  useEffect(() => {
    if (!result) setTokenized([{ text: preview }]);
    else setTokenized([...tokenizeStringFromObject(preview, result)]);
  }, [preview, result]);

  return (
    <div>
      {tokenized.map((part, i) => {
        return (
          <span key={part.text + i.toString()} className={clsx('rounded', part.colour)}>
            {part.text}
          </span>
        );
      })}
    </div>
  );
};
