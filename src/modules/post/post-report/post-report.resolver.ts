import { Resolver } from '@nestjs/graphql';
import { PostReportService } from './post-report.service';
import { PostReport } from './entities/post-report.entity';

@Resolver(() => PostReport)
export class PostReportResolver {
  constructor(private readonly postReportService: PostReportService) {}
}
