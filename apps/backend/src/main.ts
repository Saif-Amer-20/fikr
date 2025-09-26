import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // تمكين CORS للسماح للواجهة الأمامية بالاتصال بالخادم
  app.enableCors({
    origin: [/localhost:\d+/],
    credentials: true,
  });
  // حماية عامة باستخدام Helmet
  app.use(helmet());
  // استخدام ValidationPipe للتحقق من المدخلات
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // تعيين مسار أساسي لجميع الـ APIs
  app.setGlobalPrefix('api');
  await app.listen(4000);
  console.log('Backend is running on http://localhost:4000');
}
bootstrap();