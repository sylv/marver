import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, type Ref } from '@mikro-orm/core';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import ISO6391 from 'iso-639-1';
import { MediaEntity } from './media.entity.js';

@Entity()
@ObjectType('MediaSubtitle')
export class MediaSubtitleEntity {
  @PrimaryKey({ autoincrement: true })
  @Field(() => ID)
  id: number;

  @Property()
  @Field()
  languageIso639_1: string;

  @Property()
  @Field()
  hearingImpaired: boolean;

  @Property()
  @Field()
  forced: boolean;

  @Property()
  @Field()
  path: string;

  @Property()
  @Field()
  generated: boolean;

  @ManyToOne(() => MediaEntity, { ref: true })
  media: Ref<MediaEntity>;

  @Property({ persist: false, type: 'string' })
  @Field(() => String)
  get languageNameNative() {
    return ISO6391.getNativeName(this.languageIso639_1);
  }

  @Property({ persist: false, type: 'string' })
  @Field(() => String)
  get languageNameEnglish() {
    return ISO6391.getName(this.languageIso639_1);
  }

  @Property({ persist: false, type: 'string' })
  @Field(() => String)
  get displayName() {
    const parts = [this.languageNameNative];
    if (this.languageNameNative !== this.languageNameEnglish)
      parts.push(`(${this.languageNameEnglish})`);
    if (this.hearingImpaired) parts.push('(hearing impaired)');
    else if (this.forced) parts.push('(forced)');
    if (this.generated) parts.push('(auto)');
    return parts.join(' ');
  }

  [OptionalProps]: 'displayName' | 'languageNameNative' | 'languageNameEnglish';
}
