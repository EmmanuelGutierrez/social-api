import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostReportInput } from './dto/create-post-report.input';
import { UpdatePostReportInput } from './dto/update-post-report.input';
import { PostReport } from './entities/post-report.entity';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ReportStatus } from 'src/common/enum/reportStatus.enum';

@Injectable()
export class PostReportService {
  constructor(
    @InjectModel(PostReport.name)
    private readonly postReportModel: Model<PostReport>, // private readonly postService: PostService,
  ) {}

  async createReportPost(input: CreatePostReportInput, userId: string) {
    const postReport = await this.postReportModel.updateOne(
      {
        postId: new Types.ObjectId(input.postId),
        userId: new Types.ObjectId(userId),
      },
      {
        $set: {
          ...input,
          postId: new Types.ObjectId(input.postId),
          userId: new Types.ObjectId(userId),
        },
      },
      { upsert: true, strict: false },
    );
    return postReport;
  }

  async totalReports(postId: string) {
    const totalReports = await this.postReportModel.countDocuments({
      postId,
    });
    return totalReports;
  }

  async resolvePostReport(input: UpdatePostReportInput, status: ReportStatus) {
    const postReport = await this.postReportModel.updateMany(
      { postId: input.postId },
      { $set: { resolved: true, status } },
    );
    if (!postReport.matchedCount) {
      throw new NotFoundException('Post report not found');
    }
    return postReport;
  }
}
