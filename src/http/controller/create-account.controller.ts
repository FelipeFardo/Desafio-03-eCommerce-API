import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
} from '@nestjs/common'

import { z } from 'zod'
import { ZodValidationPipe } from '@/http/pipes/zod-validation-pipe'
import { Public } from '@/auth/public'
import { PrismaService } from '@/database/prisma.service'
import { HashGenerator } from '@/cryptography/hash-generator'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
@Public()
export class CreateAccountController {
  constructor(
    private readonly prisma: PrismaService,
    private hashGenerator: HashGenerator,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { name, email, password } = body

    const userByEmail = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userByEmail) {
      throw new BadRequestException('user with same e-mail already exists.')
    }

    const hashedPassword = await this.hashGenerator.hash(password)

    const userCreated = await this.prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    })

    return {
      userId: userCreated.id,
    }
  }
}
