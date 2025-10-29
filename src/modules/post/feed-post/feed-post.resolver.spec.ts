import { Test, TestingModule } from '@nestjs/testing';
import { FeedPostResolver } from './feed-post.resolver';
import { FeedPostService } from './feed-post.service';

describe('FeedPostResolver', () => {
  let resolver: FeedPostResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedPostResolver, FeedPostService],
    }).compile();

    resolver = module.get<FeedPostResolver>(FeedPostResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
