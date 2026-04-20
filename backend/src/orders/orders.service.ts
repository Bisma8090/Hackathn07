import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './order.schema';
import { Product, ProductDocument } from '../products/product.schema';
import { RawMaterial, RawMaterialDocument } from '../raw-materials/raw-material.schema';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  async create(dto: CreateOrderDto): Promise<Order> {
    // 1. Validate stock for all items
    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).lean().exec();
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);

      for (const ingredient of product.recipe) {
        const needed = ingredient.quantity * item.quantity;
        const mat = await this.rawMaterialModel
          .findById(ingredient.rawMaterialId)
          .lean()
          .exec();
        if (!mat || mat.quantity < needed) {
          throw new BadRequestException(
            `Insufficient stock for raw material in product "${product.name}"`,
          );
        }
      }
    }

    // 2. Build order items and calculate totals
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).lean().exec();
      if (!product) continue;
      const lineTotal = product.price * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        productId: new Types.ObjectId(item.productId),
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        note: item.note || '',
      });
    }

    const discount = dto.discount || 0;
    const total = subtotal - discount;
    const orderNumber = `ORD-${Date.now()}`;

    // 3. Create order
    const order = await this.orderModel.create({
      orderNumber,
      items: orderItems,
      subtotal,
      discount,
      total,
      orderType: dto.orderType || 'Dine In',
      tableNo: dto.tableNo || '',
      customerName: dto.customerName || '',
      paymentMethod: dto.paymentMethod || 'Cash',
      status: 'Completed',
    });

    // 4. Deduct raw materials (backend-driven stock deduction)
    for (const item of dto.items) {
      const product = await this.productModel.findById(item.productId).lean().exec();
      if (!product) continue;
      for (const ingredient of product.recipe) {
        const needed = ingredient.quantity * item.quantity;
        await this.rawMaterialModel.findByIdAndUpdate(ingredient.rawMaterialId, {
          $inc: { quantity: -needed },
        });
      }
    }

    return order;
  }

  async findAll(): Promise<Order[]> {
    return this.orderModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
