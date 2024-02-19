import { RequestContext } from '@mikro-orm/better-sqlite';

export const getEm = () => {
  const em = RequestContext.getEntityManager();
  if (!em) {
    throw new Error('No EntityManager found in RequestContext');
  }

  return em;
};
