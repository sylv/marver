import type { FC } from "react";
import type { SSRData } from "urql";

// https://vike.dev/pageContext#typescript
declare global {
  namespace Vike {
    interface PageContext {
      Page: FC<PageProps>;
      state?: SSRData;
      pageHtml?: string;
      userAgent?: string;
    }
  }
}

export type PageProps = {
  routeParams: Record<string, string | undefined>;
};
