import type { FC } from "react";
import type { PageProps } from "../../renderer/types";
import { useQuery } from "urql";
import { graphql } from "../../@generated";
import { SpinnerCenter } from "../../components/spinner";

const PeopleQuery = graphql(`
    query PeopleQuery {
        people(first: 100) {
            edges {
                node {
                    id
                    name
                    aliases
                }
            }
        }
    }
`);

export const Page: FC<PageProps> = () => {
  const [{ data, error }] = useQuery({
    query: PeopleQuery,
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (!data) return <SpinnerCenter />;

  return (
    <div className="flex flex-col items-center">
      {data.people.edges.map((person) => (
        <a href={`/people/${person.node.id}`} key={person.node.id}>
          <h1>{person.node.name}</h1>
          <p>{person.node.aliases}</p>
        </a>
      ))}
    </div>
  );
};
