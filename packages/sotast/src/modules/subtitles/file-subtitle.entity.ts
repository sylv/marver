import { Entity, ManyToOne, OptionalProps, PrimaryKey, Property, type Ref } from "@mikro-orm/better-sqlite";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import ISO6391 from "iso-639-1";
import { FileEntity } from "../file/entities/file.entity.js";
import { join } from "path";
import { config } from "../../config.js";

@Entity({ tableName: "file_subtitles" })
@ObjectType("FileSubtitle")
export class FileSubtitleEntity {
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
  name: string;

  @Property()
  @Field()
  forced: boolean;

  @Property()
  @Field()
  generated: boolean;

  @ManyToOne(() => FileEntity, { ref: true })
  file: Ref<FileEntity>;

  @Property({ persist: false, type: "string" })
  @Field(() => String)
  get languageNameNative() {
    return ISO6391.getNativeName(this.languageIso639_1);
  }

  @Property({ persist: false, type: "string" })
  @Field(() => String)
  get languageNameEnglish() {
    return ISO6391.getName(this.languageIso639_1);
  }

  @Property({ persist: false, type: "string" })
  @Field(() => String)
  get displayName() {
    const nameNative = this.languageNameNative;
    const nameEnglish = this.languageNameEnglish;
    const parts = [nameNative];
    if (nameNative !== nameEnglish) {
      parts.push(`(${nameEnglish})`);
    }

    if (this.hearingImpaired) parts.push("(hearing impaired)");
    else if (this.forced) parts.push("(forced)");
    if (this.generated) parts.push("(auto)");
    return parts.join(" ");
  }

  getPath() {
    return join(config.metadata_dir, "subtitles", this.file.id, this.name);
  }

  [OptionalProps]: "displayName" | "languageNameNative" | "languageNameEnglish";
}
