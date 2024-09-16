import type { PageContext, RouteSync } from "vike/types";
import { partRegex } from "part-regex";

const routeRegex = partRegex`/file/${/(?<fileId>[A-z0-9]+)/}`;

export const route: RouteSync = (pageContext: PageContext) => {
  if (pageContext.urlPathname === "/") return true;
  const match = routeRegex.exec(pageContext.urlPathname);
  if (match) {
    return { routeParams: match.groups };
  }

  return false;
};
