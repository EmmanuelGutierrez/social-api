import { Test, TestingModule } from '@nestjs/testing';
import { PostReportService } from './post-report.service';

describe('PostReportService', () => {
  let service: PostReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostReportService],
    }).compile();

    service = module.get<PostReportService>(PostReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
