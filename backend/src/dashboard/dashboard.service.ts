import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../orders/order.schema';
import { RawMaterial, RawMaterialDocument } from '../raw-materials/raw-material.schema';
import { Product, ProductDocument } from '../products/product.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getStats() {
    const [totalOrders, orders, lowStock, products] = await Promise.all([
      this.orderModel.countDocuments({ status: 'Completed' }),
      this.orderModel.find({ status: 'Completed' }).lean().exec(),
      this.rawMaterialModel
        .find({ $expr: { $lte: ['$quantity', '$minStockAlert'] } })
        .lean()
        .exec(),
      this.productModel.find({ isActive: true }).lean().exec(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    // Most sold products
    const productSales: Record<string, { name: string; count: number; productId: string }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productId.toString();
        if (!productSales[key]) {
          productSales[key] = { name: item.productName, count: 0, productId: key };
        }
        productSales[key].count += item.quantity;
      }
    }
    const topSold = Object.values(productSales)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Fetch imageUrl for each top sold product
    const productIds = topSold.map((p) => p.productId);
    const productDocs = await this.productModel
      .find({ _id: { $in: productIds } })
      .select('_id imageUrl')
      .lean()
      .exec();
    const imageMap: Record<string, string> = {};
    for (const doc of productDocs) {
      imageMap[doc._id.toString()] = doc.imageUrl || '';
    }
    const mostSold = topSold.map((p) => ({
      ...p,
      imageUrl: imageMap[p.productId] || '',
    }));

    // Order type breakdown
    const allOrders = await this.orderModel.find().lean().exec();
    const orderTypes = { 'Dine In': 0, 'To Go': 0, Delivery: 0 };
    for (const o of allOrders) {
      if (orderTypes[o.orderType] !== undefined) orderTypes[o.orderType]++;
    }

    // Recent orders
    const recentOrders = await this.orderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    return {
      totalRevenue,
      totalOrders,
      totalCustomers: allOrders.length,
      lowStockMaterials: lowStock,
      mostSoldProducts: mostSold,
      orderTypeBreakdown: orderTypes,
      recentOrders,
    };
  }
}
