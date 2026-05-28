import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { Product } from '../../products/entities/product.entity';

// Unique constraint (product_id, location_id) is enforced via migration only.
@Entity('inventory_balances')
export class InventoryBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', name: 'location_id' })
  locationId: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
