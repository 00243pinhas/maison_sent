import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MovementType } from '../../../common/enums/movement-type.enum';
import { Location } from '../../locations/entities/location.entity';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity('inventory_movements')
@Index('IDX_inv_mov_product_created', ['productId', 'createdAt'])
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_inv_mov_product_id')
  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Index('IDX_inv_mov_type')
  @Column({ type: 'enum', enum: MovementType, name: 'movement_type' })
  movementType: MovementType;

  @Column({ type: 'integer' })
  quantity: number;

  @Index('IDX_inv_mov_from_location')
  @Column({ type: 'uuid', name: 'from_location_id', nullable: true })
  fromLocationId: string | null;

  @ManyToOne(() => Location, { eager: true, nullable: true })
  @JoinColumn({ name: 'from_location_id' })
  fromLocation: Location | null;

  @Index('IDX_inv_mov_to_location')
  @Column({ type: 'uuid', name: 'to_location_id', nullable: true })
  toLocationId: string | null;

  @ManyToOne(() => Location, { eager: true, nullable: true })
  @JoinColumn({ name: 'to_location_id' })
  toLocation: Location | null;

  @Column({ type: 'varchar', length: 80, name: 'reference_number', nullable: true })
  referenceNumber: string | null;

  @Index('IDX_inv_mov_performed_by')
  @Column({ type: 'uuid', name: 'performed_by' })
  performedBy: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Index('IDX_inv_mov_created_at')
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
