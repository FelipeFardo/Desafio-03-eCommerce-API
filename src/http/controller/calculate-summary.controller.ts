import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'

const CalculateSummaryBodySchema = z.object({
  items: z.array(
    z.object({
      productSlug: z.string(),
      sku: z.string(),
      quantity: z.number(),
    }),
  ),
})

type CalculateSummaryBodySchema = z.infer<typeof CalculateSummaryBodySchema>

@Controller('/calculate-summary')
@Public()
export class CalculateSummaryController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(CalculateSummaryBodySchema))
  async handle(@Body() body: CalculateSummaryBodySchema) {
    const { items } = body

    const message = []
    const itemsFormated = await Promise.all(
      items.map(async (item) => {
        const variant = await this.prisma.productVariant.findUnique({
          include: {
            color: true,
            size: true,
            product: {
              include: {
                images: true,
              },
            },
          },
          where: {
            sku: item.sku,
            product: {
              slug: item.productSlug,
            },
          },
        })

        if (!variant || !variant.product) {
          message.push(
            `Product or variant not found for slug: ${item.productSlug} and SKU: ${item.sku}`,
          )
        }

        const quantityAvailable = variant.quantity

        if (quantityAvailable < item.quantity) {
          message.push(
            `Please note that there has been a change in the quantity available for Product ${item.productSlug} and SKU: ${item.sku}`,
          )
        }
        const quantity = Math.min(item.quantity, quantityAvailable)

        let oldPrice: number | null = null
        if (variant.product.discount > 0) {
          oldPrice = variant.product.priceInCents
          variant.product.priceInCents =
            variant.product.priceInCents -
            (variant.product.priceInCents * variant.product.discount) / 100
        }

        const subTotal = quantity * variant.product.priceInCents

        const { product } = variant
        return {
          quantityAvailable,
          product: {
            ...product,
            oldPrice,
          },
          variant,
          quantity,
          subTotal,
        }
      }),
    )
    const total = itemsFormated.reduce((sum, item) => sum + item.subTotal, 0)

    return {
      items: itemsFormated,
      total,
      message:
        message.length > 0
          ? {
              messages: message,
              type: 'error',
            }
          : null,
    }
  }
}
