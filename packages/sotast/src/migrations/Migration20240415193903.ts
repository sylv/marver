import { Migration } from '@mikro-orm/migrations';

export class Migration20240415193903 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `collections` (`id` text not null, `name` text not null, `path` text null, `generated` integer not null, `description` text null, `parent_id` text null, constraint `collections_parent_id_foreign` foreign key(`parent_id`) references `collections`(`id`) on delete set null on update cascade, primary key (`id`));');
    this.addSql('create index `collections_parent_id_index` on `collections` (`parent_id`);');

    this.addSql('create table `files` (`id` text not null, `path` text not null, `corrupted` integer not null default false, `unavailable` integer not null default false, `size` integer not null, `preview` blob null, `checked_at` datetime not null, `indexed_at` datetime not null, `modified_at` datetime not null, `created_at` datetime not null, `info_height` integer null, `info_width` integer null, `info_video_codec` text null, `info_bitrate` integer null, `info_framerate` integer null, `info_duration_seconds` integer null, `info_audio_channels` integer null, `info_non_verbal` integer null, `info_has_text` integer null, `info_audio_codec` text null, `info_has_embedded_subtitles` integer null, `info_has_faces` integer null, `info_is_animated` integer null, `mime_type` text null, `extension` text null, primary key (`id`));');
    this.addSql('create unique index `files_path_unique` on `files` (`path`);');
    this.addSql('create index `files_unavailable_index` on `files` (`unavailable`);');
    this.addSql('create index `files_size_index` on `files` (`size`);');
    this.addSql('create index `files_extension_index` on `files` (`extension`);');
    this.addSql('create index `files_info_height_index` on `files` (`info_height`);');
    this.addSql('create index `files_info_width_index` on `files` (`info_width`);');

    this.addSql('create table `file_embedding` (`id` integer not null primary key autoincrement, `file_id` text not null, `source` text null, `data` blob not null, constraint `file_embedding_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_embedding_file_id_index` on `file_embedding` (`file_id`);');

    this.addSql('create table `collections_files` (`collection_entity_id` text not null, `file_entity_id` text not null, constraint `collections_files_collection_entity_id_foreign` foreign key(`collection_entity_id`) references `collections`(`id`) on delete cascade on update cascade, constraint `collections_files_file_entity_id_foreign` foreign key(`file_entity_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`collection_entity_id`, `file_entity_id`));');
    this.addSql('create index `collections_files_collection_entity_id_index` on `collections_files` (`collection_entity_id`);');
    this.addSql('create index `collections_files_file_entity_id_index` on `collections_files` (`file_entity_id`);');

    this.addSql('create table `file_exif_data` (`file_id` text not null, `lens_make` text null, `lens_model` text null, `camera_make` text null, `camera_model` text null, `focal_length` text null, `exposure_time` text null, `f_number` text null, `iso` integer null, `flash` text null, `date_time` date null, `longitude` real null, `latitude` real null, constraint `file_exif_data_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`file_id`));');
    this.addSql('create index `file_exif_data_longitude_index` on `file_exif_data` (`longitude`);');
    this.addSql('create index `file_exif_data_latitude_index` on `file_exif_data` (`latitude`);');

    this.addSql('create table `file_perceptual_hashes` (`id` integer not null primary key autoincrement, `file_id` text not null, `hash` blob not null, `from_ms` integer null, `to_ms` integer null, constraint `file_perceptual_hashes_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_perceptual_hashes_file_id_index` on `file_perceptual_hashes` (`file_id`);');

    this.addSql('create table `file_posters` (`file_id` text not null, `mime_type` text not null, `width` integer not null, `height` integer not null, `generated` integer not null, `from_ms` integer null, constraint `file_posters_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`file_id`));');

    this.addSql('create table `file_subtitles` (`id` integer not null primary key autoincrement, `language_iso639_1` text not null, `hearing_impaired` integer not null, `forced` integer not null, `path` text not null, `generated` integer not null, `file_id` text not null, constraint `file_subtitles_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_subtitles_file_id_index` on `file_subtitles` (`file_id`);');

    this.addSql('create table `file_text` (`id` integer not null primary key autoincrement, `file_id` text not null, `type` integer not null, `text` text not null, `bounding_box_x1` integer not null, `bounding_box_y1` integer not null, `bounding_box_x2` integer not null, `bounding_box_y2` integer not null, `confidence` integer not null, `code` text null, `timestamp` integer null, constraint `file_text_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade);');
    this.addSql('create index `file_text_file_id_index` on `file_text` (`file_id`);');

    this.addSql('create table `file_thumbnails` (`file_id` text not null, `mime_type` text not null, `width` integer not null, `height` integer not null, constraint `file_thumbnails_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`file_id`));');

    this.addSql('create table `file_timelines` (`file_id` text not null, `mime_type` text not null, `width` integer not null, `height` integer not null, constraint `file_timelines_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on delete cascade on update cascade, primary key (`file_id`));');

    this.addSql('create table `job_states` (`file_id` text not null, `type` text not null, `state` integer not null, `result` json null, `error_message` text null, `retry_after` integer null, `retries` integer not null, `executed_at` datetime not null, constraint `job_states_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade, primary key (`file_id`, `type`));');
    this.addSql('create index `job_states_file_id_index` on `job_states` (`file_id`);');
    this.addSql('create index `job_states_type_index` on `job_states` (`type`);');
    this.addSql('create index `job_states_state_index` on `job_states` (`state`);');

    this.addSql('create table `people` (`id` integer not null primary key autoincrement, `name` text not null, `aliases` text not null, `description` text null, `birth_date` datetime null, `death_date` datetime null);');
    this.addSql('create unique index `people_name_unique` on `people` (`name`);');

    this.addSql('create table `faces` (`id` integer not null primary key autoincrement, `embedding` blob not null, `bounding_box_x1` integer not null, `bounding_box_y1` integer not null, `bounding_box_x2` integer not null, `bounding_box_y2` integer not null, `file_id` text not null, `person_id` integer not null, constraint `faces_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade, constraint `faces_person_id_foreign` foreign key(`person_id`) references `people`(`id`) on update cascade);');
    this.addSql('create index `faces_file_id_index` on `faces` (`file_id`);');
    this.addSql('create index `faces_person_id_index` on `faces` (`person_id`);');

    this.addSql('create table `tags` (`name` text not null, `aliases` text not null, `description` text not null, `color` integer null, `parent_name` text null, constraint `tags_parent_name_foreign` foreign key(`parent_name`) references `tags`(`name`) on delete set null on update cascade, primary key (`name`));');
    this.addSql('create index `tags_parent_name_index` on `tags` (`parent_name`);');

    this.addSql('create table `taggings` (`tag_name` text not null, `file_id` text not null, `system` integer not null, `match_percent` integer null, constraint `taggings_tag_name_foreign` foreign key(`tag_name`) references `tags`(`name`) on update cascade, constraint `taggings_file_id_foreign` foreign key(`file_id`) references `files`(`id`) on update cascade, primary key (`tag_name`, `file_id`));');
    this.addSql('create index `taggings_tag_name_index` on `taggings` (`tag_name`);');
    this.addSql('create index `taggings_file_id_index` on `taggings` (`file_id`);');
  }

}
