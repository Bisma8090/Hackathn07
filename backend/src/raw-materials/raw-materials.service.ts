import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RawMaterial, RawMaterialDocument } from './raw-material.schema';
import { CreateRawMaterialDto } from './dto/create-raw-material.dto';
import { UpdateRawMaterialDto } from './dto/update-raw-material.dto';

@Injectable()
export class RawMaterialsService {
  constructor(
    @InjectModel(RawMaterial.name)
    private rawMaterialModel: Model<RawMaterialDocument>,
  ) {}

  async create(dto: CreateRawMaterialDto): Promise<RawMaterial> {
    return this.rawMaterialModel.create(dto);
  }

  async findAll(): Promise<RawMaterial[]> {
    return this.rawMaterialModel.find().exec();
  }

  async findOne(id: string): Promise<RawMaterial> {
    const mat = await this.rawMaterialModel.findById(id).exec();
    if (!mat) throw new NotFoundException('Raw material not found');
    return mat;
  }

  async update(id: string, dto: UpdateRawMaterialDto): Promise<RawMaterial> {
    const mat = await this.rawMaterialModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!mat) throw new NotFoundException('Raw material not found');
    return mat;
  }

  async remove(id: string): Promise<void> {
    await this.rawMaterialModel.findByIdAndDelete(id).exec();
  }

  async getLowStock(): Promise<RawMaterial[]> {
    return this.rawMaterialModel
      .find({ $expr: { $lte: ['$quantity', '$minStockAlert'] } })
      .exec();
  }

  async deductStock(
    materialId: string,
    quantity: number,
    session?: any,
  ): Promise<void> {
    const opts = session ? { session } : {};
    await this.rawMaterialModel
      .findByIdAndUpdate(
        materialId,
        { $inc: { quantity: -quantity } },
        opts,
      )
      .exec();
  }
}
