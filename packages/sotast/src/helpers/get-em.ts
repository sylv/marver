import { RequestContext } from '@mikro-orm/core';

export const getEm = () => {
  const em = RequestContext.getEntityManager();
  if (!em) {
    throw new Error('No EntityManager found in RequestContext');
  }

  return em;
};
