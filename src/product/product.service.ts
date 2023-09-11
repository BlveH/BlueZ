import { Inject, Injectable } from "@nestjs/common";
import { CreateProductDto } from "./dto/create-product.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Products } from "./model/product.model";
import { Model } from "mongoose";
import { InjectStripe } from "nestjs-stripe";
import Stripe from "stripe";
import { GetProductDto } from "./dto/get-product.dto";
import qs2 from "qs-to-mongo";
import { ProductRepository } from "./repo/product.repo";
import cloudinary from "cloudinary";
import { ENV } from "src/constants";
import { error } from "console";
import { unlinkSync } from "fs";

@Injectable()
export class ProductService {
  constructor(
    @Inject(ProductRepository) private readonly productDB: ProductRepository,
    @InjectModel(Products.name) private readonly productModel: Model<Products>,
    @InjectStripe() private readonly stripeClient: Stripe,
  ) {
    cloudinary.v2.config({
      cloud_name: ENV.cloud_name,
      api_key: ENV.cloud_api_key,
      api_secret: ENV.cloud_api_secret,
    });
  }

  async createProduct(createProductDto: CreateProductDto): Promise<{
    success: boolean;
    message: string;
    result: Products;
  }> {
    try {
      //create product in stripe
      if (!createProductDto.stripeProductId) {
        const createProductInStripe = await this.stripeClient.products.create({
          name: createProductDto.productName,
          description: createProductDto.description,
        });
        createProductDto.stripeProductId = createProductInStripe.id;
      }

      const createProductInDB =
        await this.productModel.create(createProductDto);

      return {
        success: true,
        message: "Product created successfully!",
        result: createProductInDB,
      };
    } catch (error) {
      throw error;
    }
  }

  async findOneProduct(id: string): Promise<{
    success: boolean;
    message: string;
    result: Products;
  }> {
    try {
      const product = await this.productModel.findOne({ _id: id });
      if (!product) {
        throw new Error("Product is not exist!");
      }

      return {
        success: true,
        message: "Get product successfully",
        result: product,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllProduct(query: GetProductDto) {
    try {
      let callFromHomePage = false;
      if (query.homepage) {
        callFromHomePage = true;
      }
      delete query.homepage;
      const { criteria, options, links } = qs2(query);
      if (callFromHomePage) {
        const products = await this.productModel.aggregate([
          {
            $facet: {
              latestProducts: [{ $sort: { createAt: -1 } }, { $limit: 4 }],
              topRateProducts: [{ $sort: { avgRating: -1 } }, { $limit: 8 }],
            },
          },
        ]);
        return {
          success: true,
          message:
            products.length > 0
              ? "Get all products successfully"
              : "No product found",
          result: products,
        };
      }

      const { totalProductCount, products } = await this.productDB.find(
        criteria,
        options,
      );

      return {
        success: true,
        message:
          products.length > 0
            ? "Get all products successfully"
            : "No product found",
        result: {
          metadata: {
            skip: options.skip || 0,
            limit: options.limit || 10,
            total: totalProductCount,
            pages: options.limit
              ? Math.ceil(totalProductCount / options.limit)
              : 1,
            links: links("/", totalProductCount),
          },
          products,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(
    id: string,
    updateProductDto: CreateProductDto,
  ): Promise<{
    success: boolean;
    message: string;
    result: Products;
  }> {
    try {
      const productExist = await this.productModel.findOne({ _id: id });
      if (!productExist) {
        throw new Error("Product is not exist!");
      }

      const updatedProduct = await this.productModel.findOneAndUpdate(
        {
          _id: id,
        },
        updateProductDto,
      );

      if (!updateProductDto.stripeProductId) {
        await this.stripeClient.products.update(productExist.stripeProductId, {
          name: updateProductDto.productName,
          description: updateProductDto.description,
        });
      }

      return {
        success: true,
        message: "Product update successfully",
        result: updatedProduct,
      };
    } catch (error) {
      throw error;
    }
  }

  async removeProductById(id: string): Promise<{
    success: boolean;
    message: string;
    result: null;
  }> {
    try {
      const productExist = await this.productModel.findOne({ _id: id });
      if (!productExist) {
        throw new Error("Product is not exist!");
      }

      await this.productModel.findByIdAndDelete({ _id: id });
      await this.stripeClient.products.del(productExist.stripeProductId);
      return {
        success: true,
        message: "Delete product successfully",
        result: null,
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadProductImage(
    id: string,
    file: any,
  ): Promise<{
    success: boolean;
    message: string;
    result: string;
  }> {
    try {
      const product = await this.productModel.findOne({ _id: id });
      if (!product) {
        throw new Error("Product is not exist!");
      }

      if (product.imageDetails?.public_id) {
        await cloudinary.v2.uploader.destroy(product.imageDetails.public_id, {
          invalidate: true,
        });
      }

      const resOfCloudinary = await cloudinary.v2.uploader.upload(file.path, {
        folder: ENV.cloud_folder_path,
        public_id: `${ENV.cluod_public_id_prefix}${Date.now()}`,
        transformation: [
          {
            width: ENV.cloud_big_size.toString().split("x")[0],
            height: ENV.cloud_big_size.toString().split("x")[1],
            crop: "fill",
          },
          { quality: "auto" },
        ],
      });

      unlinkSync(file.path);
      await this.productModel.findOneAndUpdate(
        { _id: id },
        {
          imageDetails: resOfCloudinary,
          image: resOfCloudinary.secure_url,
        },
      );

      await this.stripeClient.products.update(product.stripeProductId, {
        images: [resOfCloudinary.secure_url],
      });

      return {
        success: true,
        message: "Upload product image successfully",
        result: resOfCloudinary.secure_url,
      };
    } catch (error) {
      throw error;
    }
  }
}
