import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InventoryModule } from '../inventory/inventory.module';
import { TransferItem } from './entities/transfer-item.entity';
import { Transfer } from './entities/transfer.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, TransferItem]),
    InventoryModule,
  ],
  controllers: [TransfersController],
  providers: [TransfersService, RolesGuard],
  exports: [TransfersService],
})
export class TransfersModule {}
