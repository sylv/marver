import { Entity, OneToOne, OptionalProps, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID } from '@nestjs/graphql';
import { TagEntity } from '../../file/entities/tag.entity.js';

/**
 * This entity represents organizations that contributed to a piece of media.
 * That includes, but is not limited to:
 * - Studios (Marvel)
 * - Websites (reddit.com, twitter)
 * - Publishers (DC Comics)
 * - Developers (Valve)
 */
@Entity()
export class SourceEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property()
  name: string;

  @Property()
  aliases: string[];

  @Property({ nullable: true })
  url?: string;

  @OneToOne(() => TagEntity, { ref: true })
  tag: Ref<TagEntity>;

  [OptionalProps]: 'aliases';
}
