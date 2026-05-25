import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly repo: Repository<Location>,
  ) {}

  async create(dto: CreateLocationDto): Promise<Location> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists) throw new ConflictException(`Location "${dto.name}" already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Location>> {
    const [data, total] = await this.repo.findAndCount({
      order: { name: 'ASC' },
      skip: query.skip,
      take: query.take,
    });
    return PaginatedResponse.from(data, total, query);
  }

  async findOne(id: string): Promise<Location> {
    const location = await this.repo.findOne({ where: { id } });
    if (!location) throw new NotFoundException(`Location ${id} not found`);
    return location;
  }

  async update(id: string, dto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    if (dto.name && dto.name !== location.name) {
      const exists = await this.repo.findOne({ where: { name: dto.name } });
      if (exists) throw new ConflictException(`Location "${dto.name}" already exists`);
    }
    const patch = Object.fromEntries(
      Object.entries(dto as Record<string, unknown>).filter(([, v]) => v !== undefined),
    );
    Object.assign(location, patch);
    return this.repo.save(location);
  }

  async remove(id: string): Promise<void> {
    const location = await this.findOne(id);
    await this.repo.softRemove(location);
  }
}
