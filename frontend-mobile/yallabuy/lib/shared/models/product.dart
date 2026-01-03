// lib/shared/models/product.dart
import 'product_variant.dart';

class Product {
  final String id;
  final String vendorId;
  final String categoryId;
  final String titleAr;
  final String titleEn;
  final String descriptionAr;
  final int price;
  final int discountPercent;
  final double rating;
  final int stock;
  final List<String> imageUrls;
  final List<ProductVariant> variants;
  final bool isFeatured;

  const Product({
    required this.id,
    required this.vendorId,
    required this.categoryId,
    required this.titleAr,
    required this.titleEn,
    required this.descriptionAr,
    required this.price,
    required this.discountPercent,
    required this.rating,
    required this.stock,
    required this.imageUrls,
    required this.variants,
    required this.isFeatured,
  });

  int get finalPrice => price - (price * discountPercent ~/ 100);
  
  bool get hasDiscount => discountPercent > 0;
}
