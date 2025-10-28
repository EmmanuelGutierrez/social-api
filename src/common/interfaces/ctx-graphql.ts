import { Request } from 'express';
import { tokenInfoI } from './token.interface';

export interface GraphQLContext {
  req: Request & { user: tokenInfoI };
}
