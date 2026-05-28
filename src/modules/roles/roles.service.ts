import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { RoleName } from '../../common/enums/role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async findByName(name: RoleName): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { name } });
    if (!role) {
      throw new NotFoundException(
        `Role "${name}" not found. Have you run the seeder? (npm run seed)`,
      );
    }
    return role;
  }

  async findById(id: string): Promise<Role> {
    const role = await this.roleRepo.findOne({ where: { id } });
    if (!role) throw new NotFoundException(`Role "${id}" not found`);
    return role;
  }

  async findAll(): Promise<Role[]> {
    return this.roleRepo.find();
  }

  async upsertByName(name: RoleName, description?: string): Promise<Role> {
    const existing = await this.roleRepo.findOne({ where: { name } });
    if (existing) {
      if (description !== undefined && existing.description !== description) {
        existing.description = description;
        return this.roleRepo.save(existing);
      }
      return existing;
    }
    const role = this.roleRepo.create({
      name,
      description: description ?? null,
    });
    return this.roleRepo.save(role);
  }
}
