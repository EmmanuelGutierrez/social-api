import { registerEnumType } from '@nestjs/graphql';

export enum ReportStatus {
  PENDING = 'PENDING',
  IGNORED = 'IGNORED',
  HIDDEN = 'HIDDEN',
  DELETED = 'DELETED',
}

registerEnumType(ReportStatus, { name: 'ReportStatus' });
