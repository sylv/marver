import { ImSpinner2 } from 'react-icons/im';

export const Loading = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <ImSpinner2 className="animate-spin text-4xl" />
    </div>
  );
};
