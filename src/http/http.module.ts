import { Module } from '@nestjs/common'
import { PrismaModule } from '../database/prisma.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { CreateAccountController } from './controller/create-account.controller'
import { AuthenticateController } from './controller/authenticate-user.controller'
import { FetchProducts } from './controller/fetch-products.controller'
import { FetchProductBySlug } from './controller/fetch-product-by-slug.controller'
import { FetchCategories } from './controller/fetch-categories..controller'

@Module({
  imports: [PrismaModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    FetchProducts,
    FetchProductBySlug,
    FetchCategories,
  ],
  providers: [
    CreateAccountController,
    AuthenticateController,
    FetchProducts,
    FetchProductBySlug,
    FetchCategories,
  ],
})
export class HttpModule {}
