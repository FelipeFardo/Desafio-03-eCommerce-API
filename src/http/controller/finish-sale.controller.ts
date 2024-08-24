import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/database/prisma.service'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt.strategy'

const paymentMethods = [
  'direct_bank_tranfer',
  'pix',
  'cash_on_delivery',
] as const

const finishSaleBodySchema = z.object({
  firstName: z.string().min(3, 'First name is required'),
  lastName: z.string().min(3, 'Last name is required'),
  companyName: z.string().optional().nullable(),
  zipCode: z
    .string()
    .length(8, { message: 'ZIP Code is required' })
    .transform((value) => value.replace(/\D/g, '')),
  country: z.string().min(1, 'Country is required'),
  streetAddress: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  addOnAddress: z.string().min(1, 'Add-on addres is required'),
  email: z.string().email('Invalid email address'),
  additionalInfo: z.string().optional().nullable(),
  paymentMethod: z.enum(paymentMethods, {
    required_error: 'payment method is required',
  }),
  items: z.array(
    z.object({
      productSlug: z.string(),
      quantity: z.number(),
      sku: z.string(),
    }),
  ),
})

type FinishSaleBodySchema = z.infer<typeof finishSaleBodySchema>

@Controller('/finish-sale')
export class FinishSaleController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(finishSaleBodySchema))
  async handle(
    @Body() body: FinishSaleBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const { sub: userId } = user
    const {
      addOnAddress,
      additionalInfo,
      city,
      companyName,
      country,
      email,
      firstName,
      items,
      lastName,
      paymentMethod,
      province,
      streetAddress,
      zipCode,
    } = body
    let orderIdResponse = ''
    try {
      await this.prisma.$transaction(async (prisma) => {
        let totalInCents = 0
        const order = await prisma.order.create({
          data: {
            city,
            zipCode,
            addOnAddress,
            companyName,
            country,
            email,
            firstName,
            lastName,
            paymentMethod,
            province,
            streetAddress,
            totalInCents,
            additionalInfo,
            customerId: userId,
          },
        })
        orderIdResponse = order.id
        await Promise.all(
          items.map(async (item) => {
            const productWithVariant = await prisma.product.findUnique({
              where: {
                slug: item.productSlug,
              },
              include: {
                variants: {
                  where: {
                    sku: item.sku,
                  },
                },
              },
            })
            if (productWithVariant.variants[0].quantity > item.quantity) {
              throw new Error(
                `Please note that there has been a change in the quantity available for Product ${productWithVariant.slug} and SKU: ${productWithVariant.variants[0].sku}`,
              )
            }
            const subTotal = item.quantity * productWithVariant.priceInCents
            totalInCents += subTotal
            await prisma.orderItems.create({
              data: {
                quantity: item.quantity,
                subTotalInCents: subTotal,
                orderId: order.id,
                productId: productWithVariant.id,
                productVariantId: productWithVariant.variants[0].id,
              },
            })
            const newQuantity =
              productWithVariant.variants[0].quantity - item.quantity
            await prisma.productVariant.update({
              data: {
                quantity: newQuantity,
              },
              where: { sku: productWithVariant.variants[0].sku },
            })
          }),
        )
        await prisma.order.update({
          data: {
            totalInCents,
          },
          where: { id: order.id },
        })
      })
    } catch (error) {
      throw new ConflictException()
    }
    return {
      orderIdResponse,
    }
  }
}
