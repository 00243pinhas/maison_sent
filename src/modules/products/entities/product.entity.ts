import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductStatus } from '../../../common/enums/product-status.enum';
import { decimalTransformer } from '../../../common/transformers/decimal.transformer';
import { Category } from '../../categories/entities/category.entity';
import { Supplier } from '../../suppliers/entities/supplier.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  brand: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  sku: string;

  // Partial unique index (WHERE NOT NULL) is enforced in migration only
  @Column({ type: 'varchar', length: 64, nullable: true })
  barcode: string | null;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (c) => c.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'uuid', name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'cost_price',
    transformer: decimalTransformer,
  })
  costPrice: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'selling_price',
    transformer: decimalTransformer,
  })
  sellingPrice: number;

  @Column({ type: 'integer', name: 'size_ml' })
  sizeMl: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({ type: 'integer', name: 'low_stock_threshold', nullable: true })
  lowStockThreshold: number | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}
