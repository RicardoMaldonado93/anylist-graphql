import { InputType, Int, Field, Float } from '@nestjs/graphql';
import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class CreateItemInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  name: string;

  @Field(() => Float)
  @Min(0)
  quantity: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  quantityUnits?: string;
}
