import { ValidationPipe } from "@nestjs/common";
import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

let app;
export default async function handler(req, res) {
  // Bootstrap our NestJS app on cold start
  if (!app) {
    app = await NestFactory.create(AppModule);

    app.enableCors({
      origin: process.env.CORS_ORIGINS || true,
      credentials: true,
    });

    const config = new DocumentBuilder()
      .setTitle('EasyNotes API')
      .setDescription('Documentation for EasyNotes API')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);

    app.useGlobalPipes(
      new ValidationPipe({
        // Require decorator for field to be present
        whitelist: true,

        // Use class-transformer
        transform: true,

        // Use validator and transformer in response
        always: true,
      }),
    );

    SwaggerModule.setup('api', app, document);

    // This is important
    await app.init();
  }
  const adapterHost = app.get(HttpAdapterHost);
  const httpAdapter = adapterHost.httpAdapter;
  const instance = httpAdapter.getInstance();

  instance(req, res);
}