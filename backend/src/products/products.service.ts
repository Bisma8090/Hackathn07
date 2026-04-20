import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { RawMaterial, RawMaterialDocument } from '../raw-materials/raw-material.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(RawMaterial.name) private rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const data = {
      ...dto,
      recipe: dto.recipe.map((r) => ({
        rawMaterialId: r.rawMaterialId,
        quantity: r.quantity,
      })),
    };
    return this.productModel.create(data as any);
  }

  async findAll(): Promise<any[]> {
    const products = await this.productModel.find({ isActive: true }).lean().exec();
    return Promise.all(products.map((p) => this.attachAvailability(p)));
  }

  async findOne(id: string): Promise<any> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException('Product not found');
    return this.attachAvailability(product);
  }

  // Core logic: calculate how many units can be made from current raw material stock
  async calculateAvailability(product: any): Promise<number> {
    if (!product.recipe || product.recipe.length === 0) return 999;

    let maxUnits = Infinity;
    for (const ingredient of product.recipe) {
      if (!ingredient.rawMaterialId || ingredient.quantity <= 0) continue;
      const mat = await this.rawMaterialModel
        .findById(ingredient.rawMaterialId)
        .lean()
        .exec();
      if (!mat) return 0;
      const possible = Math.floor(mat.quantity / ingredient.quantity);
      if (possible < maxUnits) maxUnits = possible;
    }
    return maxUnits === Infinity ? 999 : maxUnits;
  }

  private async attachAvailability(product: any): Promise<any> {
    const available = await this.calculateAvailability(product);
    return { ...product, availableUnits: available };
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    await this.productModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }

  async checkStockSufficiency(
    productId: string,
    quantity: number,
  ): Promise<boolean> {
    const product = await this.productModel.findById(productId).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    for (const ingredient of product.recipe) {
      const mat = await this.rawMaterialModel
        .findById(ingredient.rawMaterialId)
        .lean()
        .exec();
      if (!mat || mat.quantity < ingredient.quantity * quantity) return false;
    }
    return true;
  }

  async getProductWithRecipe(id: string): Promise<any> {
    const product = await this.productModel.findById(id).lean().exec();
    if (!product) throw new NotFoundException('Product not found');

    const recipeWithDetails = await Promise.all(
      product.recipe.map(async (ing: any) => {
        const mat = await this.rawMaterialModel
          .findById(ing.rawMaterialId)
          .lean()
          .exec();
        return { ...ing, rawMaterial: mat };
      }),
    );
    return { ...product, recipe: recipeWithDetails };
  }
}
