import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'

import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { HashComparer } from '@/cryptography/hash-compare'
import { Encrypter } from '@/cryptography/encrypter'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(
    private prisma: PrismaService,
    private hashcompare: HashComparer,
    private jwt: Encrypter,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.')
    }
    const isPasswordValid = await this.hashcompare.compare(
      password,
      user.password,
    )

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.')
    }

    const accessToken = await this.jwt.encrypt({
      sub: user.id,
    })

    return {
      accessToken,
    }
  }
}
