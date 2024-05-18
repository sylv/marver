import type { FilterQuery } from "@mikro-orm/core";
import type { FileEntity } from "../modules/file/entities/file.entity";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "../constants";

export interface ParsedSearch {
  semantic_queries: { negate: boolean; query: string }[];
  tags: string[];
  filters: FilterQuery<FileEntity>[];
}

const strip = (input: string) => {
  if (input.startsWith('"') && input.endsWith('"')) return input.slice(1, -1);
  return input;
};

const operators: Record<string, (input: string) => FilterQuery<FileEntity> | undefined> = {
  inpath: (input) => ({ path: { $like: `%${input}%` } }),
  ext: (input) => ({ extension: input }),
  is: (input) => {
    switch (input) {
      case "image":
        return { extension: { $in: [...IMAGE_EXTENSIONS] } };
      case "video":
        return { extension: { $in: [...VIDEO_EXTENSIONS] } };
    }
  },
};

const operatorPattern = new RegExp(`(?<negate>\-)?(?<operator>${Object.keys(operators).join("|")}):.*`);

export const parseSearch = (input: string) => {
  const result: ParsedSearch = {
    semantic_queries: [],
    tags: [],
    filters: [],
  };

  const pattern = /(?:[^\s"]+|"[^"]*")+/g;
  const parts = input.match(pattern)!;
  for (const part of parts) {
    if (part.startsWith("#")) {
      result.tags.push(strip(part.slice(1)));
    } else if (part.startsWith("-")) {
      result.semantic_queries.push({
        negate: true,
        query: strip(part.slice(1)),
      });
    } else {
      const operatorMatch = operatorPattern.exec(part);
      if (operatorMatch) {
        const { negate, operator } = operatorMatch.groups!;
        const value = strip(part.slice(operator.length + 1));
        const filter = operators[operator](value);
        if (filter) {
          if (negate) {
            result.filters.push({ $not: filter });
          } else {
            result.filters.push(filter);
          }

          continue;
        }
      }

      const previousIndex = result.semantic_queries.length - 1;
      if (
        result.semantic_queries[previousIndex] &&
        !result.semantic_queries[previousIndex].negate &&
        !part.startsWith('"')
      ) {
        result.semantic_queries[previousIndex].query += ` ${part}`;
      } else {
        result.semantic_queries.push({
          negate: false,
          query: strip(part),
        });
      }
    }
  }

  return result;
};

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("should parse text in quotes", () => {
    expect(parseSearch('test "hello world"')).toMatchInlineSnapshot(`
      {
        "semantic_queries": [
          {
            "negate": false,
            "query": "test",
          },
          {
            "negate": false,
            "query": "hello world",
          },
        ],
        "tags": [],
      }
    `);
  });

  it("should always split on quotes", () => {
    expect(parseSearch('"hello" "world"')).toMatchInlineSnapshot(`
      {
        "semantic_queries": [
          {
            "negate": false,
            "query": "hello",
          },
          {
            "negate": false,
            "query": "world",
          },
        ],
        "tags": [],
      }
    `);
  });

  it("should parse negations", () => {
    expect(parseSearch('test -"hello world"')).toMatchInlineSnapshot(`
      {
        "semantic_queries": [
          {
            "negate": false,
            "query": "test",
          },
          {
            "negate": true,
            "query": "hello world",
          },
        ],
        "tags": [],
      }
    `);
    expect(parseSearch("hello -world")).toMatchInlineSnapshot(`
      {
        "semantic_queries": [
          {
            "negate": false,
            "query": "hello",
          },
          {
            "negate": true,
            "query": "world",
          },
        ],
        "tags": [],
      }
    `);
  });

  it("should parse tags", () => {
    expect(parseSearch('#tag1 #tag2 #"tag3"')).toMatchInlineSnapshot(`
      {
        "semantic_queries": [],
        "tags": [
          "tag1",
          "tag2",
          "tag3",
        ],
      }
    `);
  });
}
