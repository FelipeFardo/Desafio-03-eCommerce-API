import {
  BadRequestException,
  Controller,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common'

import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'

@Controller('/order/:orderId')
@Public()
export class FetchOrderById {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle(@Param('orderId') orderId: string) {
    const order = await this.prisma.order.findUnique({
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                categoryId: true,
              },
            },
            productVariant: {
              include: {
                color: true,
                size: true,
              },
            },
          },
        },
      },
      where: {
        id: orderId,
      },
    })

    if (!order) {
      throw new BadRequestException()
    }

    return {
      order,
    }
  }
}
