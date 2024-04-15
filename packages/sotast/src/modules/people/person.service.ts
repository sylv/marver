import { EntityManager, RequestContext } from "@mikro-orm/better-sqlite";
import { Injectable } from "@nestjs/common";
import { config } from "../../config";

@Injectable()
export class PersonService {
  /**
   * Given a face, find a person that matches the face based on known faces.
   *
   * tl;dr, cosine sim against all known faces, group by + avg sim per person,
   * return person with highest avg sim or null if below threshold.
   */
  async findPersonFromFace(faceEmbedding: Buffer): Promise<number | null> {
    const em = RequestContext.getEntityManager() as EntityManager;
    const result = await em.execute(
      `
        SELECT people.id, AVG(cosine_similarity(faces.embedding, ?)) as avg_sim
        FROM people
        JOIN faces ON people.id = faces.person_id
        GROUP BY people.id
        ORDER BY avg_sim DESC
        LIMIT 1
    `,
      [faceEmbedding],
    );

    const person = result[0];
    if (person && person.avg_sim >= config.face_detection.min_person_score) {
      return person.id;
    }

    return null;
  }
}
