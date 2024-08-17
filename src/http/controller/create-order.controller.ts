import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { PrismaService } from '@/database/prisma.service'
import { CurrentUser } from '@/auth/current-user-decorator'
import type { UserPayload } from '@/cryptography/jwt.strategy'

const createOrderBodySchema = z.object({
  state: z.string(),
  city: z.string(),
  streetAddress: z.string(),
  number: z.string(),
  codePostal: z.string(),
  complement: z.string(),
  items: z.array(
    z.object({
      productSlug: z.string(),
      quantity: z.number(),
      productVariantId: z.string(),
    }),
  ),
})

type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

@Controller('/order')
export class CreateOrderController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createOrderBodySchema))
  async handle(
    @Body() body: CreateOrderBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const {
      city,
      codePostal,
      complement,
      items,
      number,
      state,
      streetAddress,
    } = body

    const userId = user.sub
  }
}
