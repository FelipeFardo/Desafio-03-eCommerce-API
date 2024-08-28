import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { calculatePriceWithDiscount } from '../utils/calculate-price-with-discount'

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
                images: {
                  take: 1,
                },
              },
            },
          },
          where: {
            sku: item.sku,
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

        variant.priceInCents = calculatePriceWithDiscount(
          variant.priceInCents,
          variant.discount,
        )

        const subTotal = quantity * variant.priceInCents

        const {
          product: { images, ...productRest },
        } = variant
        return {
          quantityAvailable,
          product: {
            image: images[0],
            ...productRest,
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
