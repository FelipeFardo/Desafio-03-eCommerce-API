import { Controller, Get, HttpCode } from '@nestjs/common'

import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'

@Controller('/categories')
@Public()
export class FetchCategories {
  constructor(private prisma: PrismaService) {}

  @Get()
  @HttpCode(200)
  async handle() {
    const categories = await this.prisma.productCategory.findMany()

    return {
      categories,
    }
  }
}
