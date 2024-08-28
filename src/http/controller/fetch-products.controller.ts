import { Controller, Get, HttpCode, Query, UsePipes } from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { Public } from '@/auth/public'
import { Prisma } from '@prisma/client'
import { PrismaService } from '@/database/prisma.service'
import { calculatePriceWithDiscount } from '../utils/calculate-price-with-discount'
import { isNew } from '../utils/is-new'

const queryFetchProductsSchema = z.object({
  pageIndex: z.coerce.number().default(1),
  perPage: z.coerce.number().default(16),
  shortBy: z
    .enum(['asc', 'desc', 'default'])
    .optional()
    .nullable()
    .transform((value) => {
      return value === 'default' ? null : value
    }),
  categories: z
    .string()
    .optional()
    .nullable()
    .transform((value) => {
      if (value && value.length > 0) {
        return value.split(',')
      }
      return []
    }),
})

type QueryFetchProductsSchema = z.infer<typeof queryFetchProductsSchema>

type ProductWithImagesAndCategory = Prisma.ProductVariantGetPayload<{
  include: {
    product: {
      include: {
        images: true
      }
    }
  }
}>

@Controller('/products')
@Public()
export class FetchProducts {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(queryFetchProductsSchema))
  async handle(@Query() query: QueryFetchProductsSchema) {
    const { pageIndex, perPage, categories, shortBy } = query

    const categoryFilter =
      categories.length > 0
        ? {
            product: {
              category: {
                slug: { in: categories },
              },
            },
          }
        : {}

    const whereCondition = {
      quantity: {
        gt: 0,
      },
      ...categoryFilter,
    }

    const totalCount = await this.prisma.productVariant.count({
      where: whereCondition,
    })

    const productsVariants = await this.prisma.productVariant.findMany({
      skip: (pageIndex - 1) * perPage,
      take: perPage,
      include: {
        color: true,
        size: true,
        product: {
          include: {
            colors: true,
            sizes: true,
            images: {
              take: 1,
            },
          },
        },
      },
      orderBy: shortBy ? { priceInCents: shortBy } : undefined,
      where: whereCondition,
    })

    const productsVariantsFormated = productsVariants.map((productVariant) =>
      formatProductVariant(productVariant),
    )

    return {
      products: productsVariantsFormated,
      meta: {
        pageIndex,
        perPage,
        categories: categories.length ? categories : 'all',
        shortBy: shortBy || null,
        totalCount,
      },
    }
  }
}

function formatProductVariant(productVariant: ProductWithImagesAndCategory) {
  const {
    product: { images, ...productRest },
    createdAt,
    priceInCents,
    discount,
    ...rest
  } = productVariant

  return {
    ...rest,
    product: productRest,
    image: images[0],
    discount,
    isNew: isNew(createdAt, 3),
    priceInCents: calculatePriceWithDiscount(priceInCents, discount),
    oldPriceInCents: discount ? priceInCents.toFixed(2) : null,
  }
}
