import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../locations/entities/location.entity';
import { Role } from '../../roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, name: 'full_name' })
  fullName: string;

  @Index()
  @Column({ type: 'varchar', length: 180, unique: true })
  email: string;

  @Column({ type: 'varchar', select: false })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
    select: false,
    name: 'refresh_token',
  })
  refreshToken: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
    name: 'fcm_token',
  })
  fcmToken: string | null;

  @Column({ type: 'uuid', name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, (r) => r.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ type: 'uuid', nullable: true, name: 'location_id' })
  locationId: string | null;

  @ManyToOne(() => Location, (l) => l.users, { eager: false, nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: Location | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', name: 'deleted_at' })
  deletedAt: Date | null;
}
