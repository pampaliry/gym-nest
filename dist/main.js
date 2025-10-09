"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const all_exceptions_filter_1 = require("./all-exceptions.filter");
const express_basic_auth_1 = __importDefault(require("express-basic-auth"));
const prisma_service_1 = require("./prisma/prisma.service");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const prismaService = app.get(prisma_service_1.PrismaService);
    prismaService.enableShutdownHooks(app);
    app.use('/', (0, express_basic_auth_1.default)({
        users: { admin: 'tvojeHeslo123' },
        challenge: true,
    }));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter());
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api');
    app.enableCors();
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Gym API')
        .setDescription('REST API pre tréningový systém')
        .setVersion('1.0')
        .addTag('training')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('/', app, document);
    const port = Number(process.env.PORT) || 3000;
    await app.listen(port);
    console.log(`🚀 Gym API beží na: http://localhost:${port}`);
    console.log(`📘 Swagger UI dostupný na: http://localhost:${port}/`);
}
bootstrap().catch((err) => {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map