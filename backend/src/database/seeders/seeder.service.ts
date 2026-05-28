import { Injectable, Logger } from '@nestjs/common';
import { RoleSeeder } from './role.seeder';
import { Seeder } from './seeder.interface';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);
  private readonly seeders: Seeder[];

  constructor(private readonly roleSeeder: RoleSeeder) {
    this.seeders = [roleSeeder];
  }

  async run(): Promise<void> {
    for (const seeder of this.seeders) {
      this.logger.log(`Running seeder: ${seeder.name}`);
      await seeder.run();
      this.logger.log(`Completed seeder: ${seeder.name}`);
    }
    this.logger.log('All seeders completed successfully');
  }
}
