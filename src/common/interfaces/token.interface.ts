import { roles } from '../enum/roles.enum';
import { tokenType } from '../enum/tokenType.enum';

export interface tokenInfoI {
  role: roles;
  email: string;
  id: string;
  type: tokenType;
}

// export interface jwtData {
//   iat: number;
//   exp: number;
// }
