import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export class OrderItem {
  productId: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  orderNumber: string;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product' },
        productName: String,
        quantity: Number,
        unitPrice: Number,
        note: String,
      },
    ],
  })
  items: OrderItem[];

  @Prop({ required: true })
  subtotal: number;

  @Prop({ default: 0 })
  discount: number;

  @Prop({ required: true })
  total: number;

  @Prop({ enum: ['Dine In', 'To Go', 'Delivery'], default: 'Dine In' })
  orderType: string;

  @Prop({ default: '' })
  tableNo: string;

  @Prop({ default: '' })
  customerName: string;

  @Prop({ enum: ['Pending', 'Preparing', 'Completed', 'Cancelled'], default: 'Pending' })
  status: string;

  @Prop({ enum: ['Cash', 'Credit Card', 'Paypal'], default: 'Cash' })
  paymentMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
