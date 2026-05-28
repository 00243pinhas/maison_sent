import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto';
import { CategoriesService } from '../categories/categories.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly categoriesService: CategoriesService,
    private readonly suppliersService: SuppliersService,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    await this.categoriesService.findOne(dto.categoryId);
    await this.suppliersService.findOne(dto.supplierId);

    const skuExists = await this.repo.findOne({ where: { sku: dto.sku } });
    if (skuExists)
      throw new ConflictException(`SKU "${dto.sku}" already exists`);

    if (dto.barcode) {
      const barcodeExists = await this.repo.findOne({
        where: { barcode: dto.barcode },
      });
      if (barcodeExists)
        throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
    }

    return this.repo.save(this.repo.create(dto));
  }

  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<Product>> {
    const qb = this.repo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'category')
      .leftJoinAndSelect('p.supplier', 'supplier');

    if (query.search) {
      qb.andWhere(
        '(p.name ILIKE :search OR p.brand ILIKE :search OR p.sku ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.categoryId) {
      qb.andWhere('p.category_id = :categoryId', {
        categoryId: query.categoryId,
      });
    }
    if (query.supplierId) {
      qb.andWhere('p.supplier_id = :supplierId', {
        supplierId: query.supplierId,
      });
    }
    if (query.status) {
      qb.andWhere('p.status = :status', { status: query.status });
    }

    qb.orderBy('p.name', 'ASC').skip(query.skip).take(query.take);

    const [data, total] = await qb.getManyAndCount();
    return PaginatedResponse.from(data, total, query);
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product ${id} not found`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);

    if (dto.categoryId && dto.categoryId !== product.categoryId) {
      await this.categoriesService.findOne(dto.categoryId);
    }
    if (dto.supplierId && dto.supplierId !== product.supplierId) {
      await this.suppliersService.findOne(dto.supplierId);
    }
    if (dto.sku && dto.sku !== product.sku) {
      const skuExists = await this.repo.findOne({ where: { sku: dto.sku } });
      if (skuExists)
        throw new ConflictException(`SKU "${dto.sku}" already exists`);
    }
    if (dto.barcode && dto.barcode !== product.barcode) {
      const barcodeExists = await this.repo.findOne({
        where: { barcode: dto.barcode },
      });
      if (barcodeExists)
        throw new ConflictException(`Barcode "${dto.barcode}" already exists`);
    }

    const patch = Object.fromEntries(
      Object.entries(dto as Record<string, unknown>).filter(
        ([, v]) => v !== undefined,
      ),
    );
    Object.assign(product, patch);
    return this.repo.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.repo.softRemove(product);
  }
}
