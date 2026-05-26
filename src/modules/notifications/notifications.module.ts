import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../locations/entities/location.entity';
import { Product } from '../products/entities/product.entity';
import { UsersModule } from '../users/users.module';
import { JobsModule } from '../jobs/jobs.module';
import { Notification } from './entities/notification.entity';
import { FirebaseService } from './firebase/firebase.service';
import { NotificationsListener } from './listeners/notifications.listener';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Product, Location]),
    UsersModule,
    forwardRef(() => JobsModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, FirebaseService, NotificationsListener],
  exports: [NotificationsService, FirebaseService],
})
export class NotificationsModule {}
