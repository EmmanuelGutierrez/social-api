import { Test, TestingModule } from '@nestjs/testing';
import { FeedPostService } from './feed-post.service';

describe('FeedPostService', () => {
  let service: FeedPostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedPostService],
    }).compile();

    service = module.get<FeedPostService>(FeedPostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
