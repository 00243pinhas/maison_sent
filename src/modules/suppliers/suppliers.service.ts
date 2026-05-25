import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { Supplier } from './entities/supplier.entity';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private readonly repo: Repository<Supplier>,
  ) {}

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    if (dto.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException(`Supplier with email "${dto.email}" already exists`);
    }
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: PaginationQueryDto): Promise<PaginatedResponse<Supplier>> {
    const [data, total] = await this.repo.findAndCount({
      order: { name: 'ASC' },
      skip: query.skip,
      take: query.take,
    });
    return PaginatedResponse.from(data, total, query);
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.repo.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException(`Supplier ${id} not found`);
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findOne(id);
    if (dto.email && dto.email !== supplier.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new ConflictException(`Supplier with email "${dto.email}" already exists`);
    }
    const patch = Object.fromEntries(
      Object.entries(dto as Record<string, unknown>).filter(([, v]) => v !== undefined),
    );
    Object.assign(supplier, patch);
    return this.repo.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.repo.softRemove(supplier);
  }
}
