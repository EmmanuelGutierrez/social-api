import { Module } from '@nestjs/common';
import { PostReportService } from './post-report.service';
import { PostReportResolver } from './post-report.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { PostReport, PostReportSchema } from './entities/post-report.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReport.name, schema: PostReportSchema },
    ]),
  ],
  providers: [PostReportResolver, PostReportService],
  exports: [PostReportService],
})
export class PostReportModule {}
