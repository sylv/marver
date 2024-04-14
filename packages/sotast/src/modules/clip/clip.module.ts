import { Module } from "@nestjs/common";
import { CLIPService } from "./clip.service";
import { DownloadModule } from "../download/download.module";

@Module({
  providers: [CLIPService],
  exports: [CLIPService],
  imports: [DownloadModule],
})
export class CLIPModule {}
