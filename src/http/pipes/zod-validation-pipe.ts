import { PipeTransform, BadRequestException } from '@nestjs/common'
import { ZodError, ZodSchema } from 'zod'
import { fromZodError } from 'zod-validation-error'
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      console.log(value)
      // console.log(this.schema.parse(value))
      return this.schema.parse(value)
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(fromZodError(error))
        throw new BadRequestException({
          message: 'Validation failed',
          statusCode: 400,
          errors: fromZodError(error),
        })
      }
      throw new BadRequestException('Validation failed')
    }
  }
}
