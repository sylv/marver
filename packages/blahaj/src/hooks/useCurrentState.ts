import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';

export type CurrentStateType<S> = [S, Dispatch<SetStateAction<S>>, MutableRefObject<S>];

// https://geist-ui.dev/en-us/hooks/use-current-state
const useCurrentState = <S>(initialState: S | (() => S)): CurrentStateType<S> => {
  const [state, setState] = useState<S>(() => {
    return typeof initialState === 'function' ? (initialState as () => S)() : initialState;
  });
  const ref = useRef<S>(initialState as S);

  useEffect(() => {
    ref.current = state;
  }, [state]);

  const setValue = (val: SetStateAction<S>) => {
    const result = typeof val === 'function' ? (val as (prevState: S) => S)(ref.current) : val;
    ref.current = result;
    setState(result);
  };

  return [state, setValue, ref];
};

export default useCurrentState;
