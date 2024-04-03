import { sql, type EntityRepository } from "@mikro-orm/better-sqlite";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { PersonEntity } from "./entities/person.entity";

@Injectable()
export class PersonService {
  @InjectRepository(PersonEntity) private personRepo: EntityRepository<PersonEntity>;

  /**
   * Given a face, find a person that matches the face based on known faces.
   *
   * tl;dr, cosine sim against all known faces, group by + avg sim per person,
   * return person with highest avg sim or null if below threshold.
   */
  async findPersonFromFace(faceEmbedding: Buffer): Promise<number | null> {
    const personId = await this.personRepo.getEntityManager().execute(sql`
        SELECT id, AVG(cosine_similarity(faces.embedding, ${faceEmbedding})) as avg_sim
        FROM people
        JOIN faces ON people.id = faces.person_id
        GROUP BY people.id
        ORDER BY avg_sim DESC
        LIMIT 1
    `);

    console.log({ personId });
    return null;
  }
}
