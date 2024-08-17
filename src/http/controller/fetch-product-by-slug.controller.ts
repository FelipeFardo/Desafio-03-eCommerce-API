import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'

import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { isNew } from '../utls/is-new'
import { calculatePriceWithDiscount } from '../utls/calculate-price-with-discount'

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
    const priceInCents = product.discount
      ? calculatePriceWithDiscount(product.priceInCents, product.discount)
      : product.priceInCents
    const oldPriceInCents = product.discount
      ? product.priceInCents.toFixed(2)
      : null

    const productFormated = {
      ...product,
      discountPerCent: product.discount,
      tags: tagsArray,
      isNew: isNew(product.createdAt, 3),
      priceInCents: priceInCents.toFixed(2),
      oldPriceInCents,
      colors,
      sizes,
      variants,
    }

    return {
      product: productFormated,
    }
  }
}
