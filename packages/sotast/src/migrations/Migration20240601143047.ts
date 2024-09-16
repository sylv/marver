import { Migration } from '@mikro-orm/migrations';

export class Migration20240601143047 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `files` rename column `name` to `display_name`;');
  }

}
