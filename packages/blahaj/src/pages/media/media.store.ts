import { create } from 'zustand';
import { SimilarityType } from '../../generated/graphql';

export const useMediaStore = create(() => ({
  filter: SimilarityType.Related,
}));

export const setFilter = (filter: SimilarityType) => {
  useMediaStore.setState({ filter });
};
