import { Module } from '@nestjs/common';
import { CLIPService } from './clip.service';

@Module({
  providers: [CLIPService],
  exports: [CLIPService],
})
export class CLIPModule {}
