import { Context } from 'graphql-ws';
import { tokenInfoI } from './token.interface';

export interface contextGraphqlWs extends Context {
  extra: {
    user: tokenInfoI;
  };
}
