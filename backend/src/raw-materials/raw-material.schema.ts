import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RawMaterialDocument = RawMaterial & Document;

@Schema({ timestamps: true })
export class RawMaterial {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['g', 'ml', 'pcs', 'kg', 'L'] })
  unit: string;

  @Prop({ required: true, default: 0 })
  quantity: number;

  @Prop({ default: 0 })
  minStockAlert: number;

  @Prop({ default: 0 })
  costPerUnit: number;
}

export const RawMaterialSchema = SchemaFactory.createForClass(RawMaterial);
