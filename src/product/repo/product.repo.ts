import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ParsedOptions } from "qs-to-mongo/lib/query/options-to-mongo";
import { Products } from "../model/product.model";
import { License } from "src/product/model/license.model";

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
    @InjectModel(License.name) private readonly licenseModel: Model<License>,
  ) {}

  async find(query: Record<string, any>, options: ParsedOptions) {
    options.sort = options.sort || { _id: 1 };
    options.limit = options.limit || 12;
    options.skip = options.skip || 0;

    if (query.search) {
      query.productName = new RegExp(query.search, "i");
      delete query.search;
    }

    const products = await this.productModel.aggregate([
      {
        $match: query,
      },
      {
        $sort: options.sort,
      },
      { $skip: options.skip },
      { $limit: options.limit },
    ]);

    const totalProductCount = await this.productModel.countDocuments(query);
    return { totalProductCount, products };
  }

  async createLicense(product: string, productSku: string, licenseKey: string) {
    const license = await this.licenseModel.create({
      product,
      productSku,
      licenseKey,
    });
    return license;
  }
  async removeLicense(query: any) {
    const license = await this.licenseModel.findOneAndDelete(query);
    return license;
  }

  async findLicense(query: any, limit?: number) {
    if (limit && limit > 0) {
      const license = await this.licenseModel.find(query).limit(limit);
      return license;
    }
    const license = await this.licenseModel.find(query);
    return license;
  }

  async updateLicense(query: any, update: any) {
    const license = await this.licenseModel.findOneAndUpdate(query, update, {
      new: true,
    });
    return license;
  }

  async updateLicenseMany(query: any, data: any) {
    const license = await this.licenseModel.updateMany(query, data);
    return license;
  }

  async deleteSku(id: string, skuId: string) {
    return await this.productModel.updateOne(
      { _id: id },
      {
        $pull: {
          skuDetails: { _id: skuId },
        },
      },
    );
  }

  async deleteAllLicences(productId: string, skuId: string) {
    if (productId)
      return await this.licenseModel.deleteMany({ product: productId });
    return await this.licenseModel.deleteMany({ productSku: skuId });
  }
}
