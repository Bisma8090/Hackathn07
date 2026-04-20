import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export class RecipeIngredient {
  rawMaterialId: Types.ObjectId;
  quantity: number; // quantity needed per 1 unit of product
}

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ default: '' })
  category: string;

  @Prop({ default: '' })
  imageUrl: string;

  @Prop({
    type: [
      {
        rawMaterialId: { type: Types.ObjectId, ref: 'RawMaterial' },
        quantity: Number,
      },
    ],
    default: [],
  })
  recipe: RecipeIngredient[];

  @Prop({ default: true })
  isActive: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
