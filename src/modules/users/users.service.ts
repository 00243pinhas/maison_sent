import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleName } from '../../common/enums/role.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByEmailWithSecrets(email: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .addSelect(['user.password', 'user.refreshToken'])
      .where('user.email = :email', { email })
      .getOne();
  }

  async findByIdWithRefreshToken(id: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('user')
      .addSelect(['user.refreshToken'])
      .where('user.id = :id', { id })
      .getOne();
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  async updateRefreshToken(
    userId: string,
    hashedToken: string | null,
  ): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: hashedToken });
  }

  async findUsersByRoles(roles: RoleName[]): Promise<User[]> {
    return this.userRepo
      .createQueryBuilder('u')
      .innerJoinAndSelect('u.role', 'role')
      .where('role.name IN (:...roles)', { roles })
      .andWhere('u.deleted_at IS NULL')
      .getMany();
  }

  async updateFcmToken(userId: string, token: string | null): Promise<void> {
    await this.userRepo.update(userId, { fcmToken: token });
  }

  async findWithFcmToken(userId: string): Promise<User | null> {
    return this.userRepo
      .createQueryBuilder('u')
      .select(['u.id', 'u.fcmToken'])
      .where('u.id = :id', { id: userId })
      .getOne();
  }
}
