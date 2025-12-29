import { Test, TestingModule } from '@nestjs/testing';
import { PostReportResolver } from './post-report.resolver';
import { PostReportService } from './post-report.service';

describe('PostReportResolver', () => {
  let resolver: PostReportResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReportResolver, PostReportService],
    }).compile();

    resolver = module.get<PostReportResolver>(PostReportResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
