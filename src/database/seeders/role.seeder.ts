import { Injectable, Logger } from '@nestjs/common';
import { RolesService } from '../../modules/roles/roles.service';
import { RoleName } from '../../common/enums/role.enum';
import { Seeder } from './seeder.interface';

const ROLE_DEFINITIONS: Array<{ name: RoleName; description: string }> = [
  { name: RoleName.SUPER_ADMIN, description: 'Unrestricted system access' },
  { name: RoleName.ADMIN, description: 'Organization-wide administration' },
  {
    name: RoleName.WAREHOUSE_MANAGER,
    description: 'Manages central warehouse operations',
  },
  { name: RoleName.BRANCH_MANAGER, description: 'Manages a branch / store' },
  { name: RoleName.SALES_STAFF, description: 'Performs sales at a branch' },
];

@Injectable()
export class RoleSeeder implements Seeder {
  readonly name = 'RoleSeeder';
  private readonly logger = new Logger(RoleSeeder.name);

  constructor(private readonly rolesService: RolesService) {}

  async run(): Promise<void> {
    for (const { name, description } of ROLE_DEFINITIONS) {
      await this.rolesService.upsertByName(name, description);
      this.logger.log(`Ensured role: ${name}`);
    }
  }
}
