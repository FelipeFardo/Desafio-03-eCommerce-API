import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/database/prisma.service'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { calculatePriceWithDiscount } from '../utils/calculate-price-with-discount'

const paymentMethods = [
  'direct_bank_tranfer',
  'pix',
  'cash_on_delivery',
] as const

const finishSaleBodySchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().min(3),
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

const bodyValidationPipe = new ZodValidationPipe(finishSaleBodySchema)

type FinishSaleBodySchema = z.infer<typeof finishSaleBodySchema>

@Controller('/finish-sale')
export class FinishSaleController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: FinishSaleBodySchema,
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
          const productVariant = await prisma.productVariant.findUnique({
            where: {
              sku: item.sku,
            },
            include: {
              product: true,
            },
          })

          if (item.quantity > productVariant.quantity) {
            throw new ConflictException(
              `Please note that there has been a change in the quantity available for Product ${productVariant.product.slug} and SKU: ${productVariant.sku}. The available quantity is ${productVariant.quantity}`,
            )
          }

          const priceInCentsPerUnit = calculatePriceWithDiscount(
            productVariant.priceInCents,
            productVariant.discount,
          )
          const subTotal = item.quantity * priceInCentsPerUnit

          totalInCents += subTotal
          await prisma.orderItems.create({
            data: {
              priceInCentsPerUnit,
              quantity: item.quantity,
              subTotalInCents: subTotal,
              orderId: order.id,
              productId: productVariant.productId,
              productVariantId: productVariant.id,
            },
          })
          const newQuantity = productVariant.quantity - item.quantity
          await prisma.productVariant.update({
            data: {
              quantity: newQuantity,
            },
            where: { sku: productVariant.sku },
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

    return {
      orderId: orderIdResponse,
    }
  }
}
