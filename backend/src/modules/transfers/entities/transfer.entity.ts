import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransferStatus } from '../../../common/enums/transfer-status.enum';
import { Location } from '../../locations/entities/location.entity';
import { User } from '../../users/entities/user.entity';
import { TransferItem } from './transfer-item.entity';

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 80,
    name: 'reference_number',
    nullable: true,
  })
  referenceNumber: string | null;

  @Index('IDX_transfers_from_location')
  @Column({ type: 'uuid', name: 'from_location_id' })
  fromLocationId: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'from_location_id' })
  fromLocation: Location;

  @Index('IDX_transfers_to_location')
  @Column({ type: 'uuid', name: 'to_location_id' })
  toLocationId: string;

  @ManyToOne(() => Location, { eager: true })
  @JoinColumn({ name: 'to_location_id' })
  toLocation: Location;

  @Index('IDX_transfers_status')
  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.DRAFT })
  status: TransferStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'text', name: 'rejection_reason', nullable: true })
  rejectionReason: string | null;

  @Index('IDX_transfers_created_by')
  @Column({ type: 'uuid', name: 'created_by' })
  createdBy: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'uuid', name: 'approved_by', nullable: true })
  approvedBy: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: User | null;

  @Column({ type: 'uuid', name: 'completed_by', nullable: true })
  completedBy: string | null;

  @ManyToOne(() => User, { eager: false, nullable: true })
  @JoinColumn({ name: 'completed_by' })
  completer: User | null;

  @Column({ type: 'timestamptz', name: 'approved_at', nullable: true })
  approvedAt: Date | null;

  @Column({ type: 'timestamptz', name: 'completed_at', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => TransferItem, (item) => item.transfer, { cascade: true })
  items: TransferItem[];

  @Index('IDX_transfers_created_at')
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}
