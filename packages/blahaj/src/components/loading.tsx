import { Spinner } from './spinner';

export const Loading = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <Spinner />
    </div>
  );
};
