import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { isNew } from '../utils/is-new'
import { calculatePriceWithDiscount } from '../utils/calculate-price-with-discount'

@Controller('/products/:slug')
@Public()
export class FetchProductBySlug {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(@Param('slug') slug: string) {
    const product = await this.prisma.product.findUnique({
      where: {
        slug,
      },
      include: {
        tags: { select: { name: true } },
        category: true,
        colors: true,
        images: true,
        sizes: true,
        variants: true,
      },
    })

    if (!product) {
      throw new NotFoundException('Product Not found')
    }
    const { colors, sizes, variants, tags } = product

    const tagsArray = tags.map((tag) => tag.name)

    const variantsFormat = variants.map((variant) => {
      const { priceInCents, discount, createdAt, ...rest } = variant
      return {
        discount,
        oldPriceInCents: discount ? priceInCents.toFixed(2) : null,
        priceInCents: calculatePriceWithDiscount(priceInCents, discount),
        isNew: isNew(createdAt, 3),
        ...rest,
      }
    })

    const productFormated = {
      ...product,
      tags: tagsArray,
      colors,
      sizes,
      variants: variantsFormat,
    }

    return {
      product: productFormated,
    }
  }
}
