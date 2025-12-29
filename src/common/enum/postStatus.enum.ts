import { registerEnumType } from '@nestjs/graphql';

export enum PostStatus {
  ACTIVE = 'ACTIVE',
  DELETED_BY_USER = 'DELETED_BY_USER',
  DELETED_BY_ADMIN = 'DELETED_BY_ADMIN',
  HIDDEN_BY_REPORTS = 'HIDDEN_BY_REPORTS',
}

registerEnumType(PostStatus, { name: 'PostStatus' });
