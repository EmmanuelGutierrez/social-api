import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/app/rolesKey';
import { roles } from '../enum/roles.enum';

export const Roles = (...roles: roles[]) => SetMetadata(ROLES_KEY, roles);
