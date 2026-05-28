import { Module } from '@nestjs/common';
import { RolesModule } from '../../modules/roles/roles.module';
import { SeederService } from './seeder.service';
import { RoleSeeder } from './role.seeder';

@Module({
  imports: [RolesModule],
  providers: [SeederService, RoleSeeder],
  exports: [SeederService],
})
export class SeederModule {}
