import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private messaging: admin.messaging.Messaging | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const rawKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !rawKey) {
      this.logger.warn(
        'Firebase credentials not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY). ' +
          'Push notifications are disabled — in-app notifications remain fully operational.',
      );
      return;
    }

    const privateKey = rawKey.replace(/\\n/g, '\n');

    try {
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      this.messaging = app.messaging();
      this.logger.log('Firebase Admin SDK initialised successfully.');
    } catch (err) {
      this.logger.error('Firebase Admin SDK failed to initialise.', err);
    }
  }

  get isEnabled(): boolean {
    return this.messaging !== null;
  }

  async sendPush(
    token: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.messaging) return;

    const stringData = data
      ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)]))
      : undefined;

    await this.messaging.send({
      token,
      notification: { title, body },
      ...(stringData ? { data: stringData } : {}),
    });
  }
}
