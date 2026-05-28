import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { LocationsModule } from './modules/locations/locations.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { ReportsModule } from './modules/reports/reports.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ProductsModule } from './modules/products/products.module';
import { RolesModule } from './modules/roles/roles.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { UsersModule } from './modules/users/users.module';
import { SeederModule } from './database/seeders/seeder.module';

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        return {
          type: 'postgres',
          ...(databaseUrl
            ? { url: databaseUrl, ssl: true, extra: { ssl: { rejectUnauthorized: false } } }
            : {
                host: config.getOrThrow<string>('DATABASE_HOST'),
                port: config.getOrThrow<number>('DATABASE_PORT'),
                username: config.getOrThrow<string>('DATABASE_USER'),
                password: config.getOrThrow<string>('DATABASE_PASSWORD'),
                database: config.getOrThrow<string>('DATABASE_NAME'),
              }),
          autoLoadEntities: true,
          synchronize: false,
        };
      },
    }),

    AuthModule,
    UsersModule,
    RolesModule,
    LocationsModule,
    SuppliersModule,
    CategoriesModule,
    ProductsModule,
    InventoryModule,
    TransfersModule,
    ReportsModule,
    NotificationsModule,
    ...(process.env.REDIS_URL || process.env.REDIS_HOST ? [JobsModule] : []),
    SeederModule,
  ],
})
export class AppModule {}
