import { Role } from '../generated/prisma/enums';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
}
