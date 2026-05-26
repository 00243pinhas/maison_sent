import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from '../../common/guards/roles.guard';
import { InventoryBalance } from './entities/inventory-balance.entity';
import { InventoryMovement } from './entities/inventory-movement.entity';
import { InventoryBalancesService } from './inventory-balances.service';
import { InventoryController } from './inventory.controller';
import { InventoryMovementsService } from './inventory-movements.service';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, InventoryBalance])],
  controllers: [InventoryController],
  providers: [
    InventoryService,
    InventoryMovementsService,
    InventoryBalancesService,
    RolesGuard,
  ],
  exports: [InventoryService, InventoryBalancesService],
})
export class InventoryModule {}
