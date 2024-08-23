import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from '@/auth/current-user-decorator'
import { UserPayload } from '@/auth/jwt.strategy'
import { PrismaService } from '@/database/prisma.service'

@Controller('/me')
export class FetchProfile {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@CurrentUser() user: UserPayload) {
    const { sub: userId } = user

    const userQuery = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    return {
      user: {
        email: userQuery.email,
        name: userQuery.name,
      },
    }
  }
}
