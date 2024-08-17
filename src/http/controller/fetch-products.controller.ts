import { Controller, Get, HttpCode, Query, UsePipes } from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { calculatePriceWithDiscount } from '../utls/calculate-price-with-discount'
import { isNew } from '../utls/is-new'

const queryFetchProductsSchema = z.object({
  pageIndex: z.coerce.number().default(1),
  perPage: z.coerce.number().default(16),
  shortBy: z.enum(['asc', 'desc']).optional(),
  categories: z.string().optional(),
})

type QueryFetchProductsSchema = z.infer<typeof queryFetchProductsSchema>

@Controller('/products')
@Public()
export class FetchProducts {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(queryFetchProductsSchema))
  async handle(@Query() query: QueryFetchProductsSchema) {
    const { pageIndex, perPage, categories: categoriesQuery, shortBy } = query

    const categories = categoriesQuery ? categoriesQuery.split(',') : []

    const totalCount = await this.prisma.product.count()

    const products = await this.prisma.product.findMany({
      skip: (pageIndex - 1) * perPage,
      take: perPage,
      include: {
        category: true,
        images: {
          take: 1,
        },
      },
      ...(shortBy ? { orderBy: { priceInCents: shortBy } } : {}),
      ...(categories.length > 0
        ? {
            where: {
              category: {
                name: { in: categories },
              },
            },
          }
        : {}),
    })

    const productsFormated = products.map((product) => {
      const { images, ...rest } = product

      return {
        ...rest,
        image: images[0],
        isNew: isNew(product.createdAt, 3),
        priceInCents: product.discount
          ? calculatePriceWithDiscount(
              product.priceInCents,
              product.discount,
            ).toFixed(2)
          : product.priceInCents.toFixed(2),
        oldPriceInCents: product.discount
          ? product.priceInCents.toFixed(2)
          : null,
      }
    })

    return {
      products: productsFormated,
      meta: {
        pageIndex,
        perPage,
        categories,
        shortBy: shortBy || null,
        totalCount,
      },
    }
  }
}
