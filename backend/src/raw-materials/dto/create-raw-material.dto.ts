import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateRawMaterialDto {
  @IsString()
  name: string;

  @IsEnum(['g', 'ml', 'pcs', 'kg', 'L'])
  unit: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockAlert?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPerUnit?: number;
}
