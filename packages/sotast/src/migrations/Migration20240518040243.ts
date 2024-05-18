import { Migration } from '@mikro-orm/migrations';

export class Migration20240518040243 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `collections` (`id` text not null, `name` text not null, `path` text null, `generated` integer not null, `description` text null, `parent_id` text null, constraint `collections_parent_id_foreign` foreign key(`parent_id`) references `collections`(`id`) on delete set null on update cascade, primary key (`id`));');
    this.addSql('create index `collections_parent_id_index` on `collections` (`parent_id`);');

    this.addSql('create table `files` (`id` text not null, `name` text not null, `directory` text not null, `extension` text null, `path` text not null, `corrupted` integer not null default false, `unavailable` integer not null default false, `size` integer not null, `checked_at` datetime not null, `indexed_at` datetime not null, `modified_at` datetime not null, `created_at` datetime not null, `info_height` integer null, `info_width` integer null, `info_video_codec` text null, `info_bitrate` integer null, `info_framerate` integer null, `info_duration_seconds` integer null, `info_audio_channels` integer null, `info_non_verbal` integer null, `info_has_text` integer null, `info_audio_codec` text null, `info_has_embedded_subtitles` integer null, `info_has_faces` integer null, `info_is_animated` integer null, `thumbnail_id` text null, `thumbnail_tiny` blob null, constraint `files_thumbnail_id_foreign` foreign key(`thumbnail_id`) references `file_assets`(`id`) on delete set null on update cascade, primary key (`id`));');
    this.addSql('create unique index `files_path_unique` on `files` (`path`);');
    this.addSql('create index `files_unavailable_index` on `files` (`unavailable`);');
    this.addSql('create index `files_size_index` on `files` (`size`);');
    this.addSql('create unique index `files_thumbnail_id_unique` on `files` (`thumbnail_id`);');
    this.addSql('create index `files_info_height_index` on `files` (`info_height`);');
    this.addSql('create index `files_info_width_index` on `files` (`info_width`);');

    this.addSql('create table `file_embedding` (`id` integer not null primary key autoincrement, `file_id` text not null, `position` integer null, `data` blob not null, constraint `file_embedding_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_embedding_file_id_index` on `file_embedding` (`file_id`);');

    this.addSql('create table `file_assets` (`id` text not null, `asset_type` integer not null, `mime_type` text not null, `generated` integer not null, `position` integer null, `width` integer not null, `height` integer not null, `file_id` text not null, constraint `file_assets_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade, primary key (`id`));');
    this.addSql('create index `file_assets_file_id_index` on `file_assets` (`file_id`);');

    this.addSql('create table `collections_files` (`collection_entity_id` text not null, `file_entity_id` text not null, constraint `collections_files_collection_entity_id_foreign` foreign key(`collection_entity_id`) references `collections`(`id`) on delete cascade on update cascade, constraint `collections_files_file_entity_id_foreign` foreign key(`file_entity_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`collection_entity_id`, `file_entity_id`));');
    this.addSql('create index `collections_files_collection_entity_id_index` on `collections_files` (`collection_entity_id`);');
    this.addSql('create index `collections_files_file_entity_id_index` on `collections_files` (`file_entity_id`);');

    this.addSql('create table `file_exif_data` (`file_id` text not null, `lens_make` text null, `lens_model` text null, `camera_make` text null, `camera_model` text null, `focal_length` text null, `exposure_time` text null, `f_number` text null, `iso` integer null, `flash` text null, `date_time` date null, `longitude` real null, `latitude` real null, constraint `file_exif_data_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`file_id`));');
    this.addSql('create index `file_exif_data_longitude_index` on `file_exif_data` (`longitude`);');
    this.addSql('create index `file_exif_data_latitude_index` on `file_exif_data` (`latitude`);');

    this.addSql('create table `file_subtitles` (`id` integer not null primary key autoincrement, `language_iso639_1` text not null, `hearing_impaired` integer not null, `name` text not null, `forced` integer not null, `generated` integer not null, `file_id` text not null, constraint `file_subtitles_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_subtitles_file_id_index` on `file_subtitles` (`file_id`);');

    this.addSql('create table `job_states` (`file_id` text not null, `type` text not null, `state` integer not null, `result` json null, `error_message` text null, `retry_after` integer null, `retries` integer not null, `executed_at` datetime not null, constraint `job_states_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade, primary key (`file_id`, `type`));');
    this.addSql('create index `job_states_file_id_index` on `job_states` (`file_id`);');
    this.addSql('create index `job_states_type_index` on `job_states` (`type`);');
    this.addSql('create index `job_states_state_index` on `job_states` (`state`);');
  }

}
