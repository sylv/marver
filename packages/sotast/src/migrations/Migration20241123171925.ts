import { Migration } from '@mikro-orm/migrations';

export class Migration20241123171925 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`files\` add column \`bumped_at\` datetime null;`);
  }

}
