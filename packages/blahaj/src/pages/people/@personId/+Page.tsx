import type { FC } from "react";
import type { PageProps } from "../../../renderer/types";
import { graphql } from "../../../@generated";
import { useQuery } from "urql";
import { FilePage } from "../../../components/file/file-page";
import { SpinnerCenter } from "../../../components/spinner";

const PersonQuery = graphql(`
    query PersonQuery($personId: ID!) {
        person(id: $personId) {
            id
            name
            aliases
        }
    }
`);

export const Page: FC<PageProps> = ({ routeParams }) => {
  const personId = routeParams.personId!;
  const [{ data, error }] = useQuery({
    query: PersonQuery,
    variables: { personId },
  });

  if (error) return <div>Oh no... {error.message}</div>;
  if (!data) return <SpinnerCenter />;

  return (
    <div className="container mx-auto mt-20">
      <h1>{data.person.name}</h1>
      <p>{data.person.aliases}</p>
      <FilePage variables={{ personId }} />
    </div>
  );
};
