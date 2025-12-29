import { Resolver } from '@nestjs/graphql';
import { FileService } from './file.service';
import { File } from './entities/file.entity';

@Resolver(() => File)
export class FileResolver {
  constructor(private readonly fileService: FileService) {}

  // @Query(() => [File], { name: 'allFiles' })
  // findAll() {
  //   return this.fileService.getAll();
  // }
}
