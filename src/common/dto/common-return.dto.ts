export abstract class CommonReturn<T, C> {
  data: T[];

  nextCursor?: C;

  hasMore: boolean;
}
