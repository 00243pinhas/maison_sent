import { RoleName } from '../../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleName;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: RoleName;
}
