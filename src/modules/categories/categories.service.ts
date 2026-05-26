import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const exists = await this.repo.findOne({ where: { name: dto.name } });
    if (exists)
      throw new ConflictException(`Category "${dto.name}" already exists`);
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponse<Category>> {
    const [data, total] = await this.repo.findAndCount({
      order: { name: 'ASC' },
      skip: query.skip,
      take: query.take,
    });
    return PaginatedResponse.from(data, total, query);
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (dto.name && dto.name !== category.name) {
      const exists = await this.repo.findOne({ where: { name: dto.name } });
      if (exists)
        throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    const patch = Object.fromEntries(
      Object.entries(dto as Record<string, unknown>).filter(
        ([, v]) => v !== undefined,
      ),
    );
    Object.assign(category, patch);
    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);

    // Block delete if any active (non-soft-deleted) products reference this category.
    // Uses global TypeORM metadata for the join — no Product repo needed in this module.
    const activeProductCount = await this.repo
      .createQueryBuilder('c')
      .innerJoin('c.products', 'p', 'p.deleted_at IS NULL')
      .where('c.id = :id', { id })
      .getCount();

    if (activeProductCount > 0) {
      throw new ConflictException(
        `Cannot delete category "${category.name}": it has active products`,
      );
    }

    await this.repo.softRemove(category);
  }
}
