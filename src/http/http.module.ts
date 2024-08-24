import { Module } from '@nestjs/common'
import { PrismaModule } from '../database/prisma.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { CreateAccountController } from './controller/create-account.controller'
import { AuthenticateController } from './controller/authenticate-user.controller'
import { FetchProducts } from './controller/fetch-products.controller'
import { FetchProductBySlug } from './controller/fetch-product-by-slug.controller'
import { FetchCategories } from './controller/fetch-categories.controller'
import { FetchProfile } from './controller/fetch-profile.controller'
import { CalculateSummaryController } from './controller/calculate-summary.controller'
import { FinishSaleController } from './controller/finish-sale.controller'

@Module({
  imports: [PrismaModule, CryptographyModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    FetchProducts,
    FetchProductBySlug,
    FetchCategories,
    FetchProfile,
    CalculateSummaryController,
    FinishSaleController,
  ],
  providers: [
    CreateAccountController,
    AuthenticateController,
    FetchProducts,
    FetchProductBySlug,
    FetchCategories,
    FetchProfile,
    CalculateSummaryController,
    FinishSaleController,
  ],
})
export class HttpModule {}
