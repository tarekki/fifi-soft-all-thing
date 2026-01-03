// lib/shared/repositories/product_repository.dart
import '../mock/mock_data.dart';
import '../models/product.dart';
import '../models/review.dart';

class ProductRepository {
  Future<Product> fetchProduct(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final product = MockData.productById[id];
    if (product == null) throw Exception('Product not found');
    return product;
  }

  Future<List<Product>> fetchProducts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return List.from(MockData.products);
  }

  Future<List<Product>> fetchProductsByCategory(String categoryId) async {
    await Future.delayed(const Duration(milliseconds: 600));
    return MockData.products
        .where((p) => p.categoryId == categoryId)
        .toList();
  }

  Future<List<Product>> fetchRelated(String productId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Simple mock logic: same category or random
    final p = MockData.productById[productId];
    if (p == null) return [];
    return MockData.products
        .where((other) => other.categoryId == p.categoryId && other.id != p.id)
        .take(4)
        .toList();
  }

  Future<List<Review>> fetchReviews(String productId) async {
    await Future.delayed(const Duration(milliseconds: 600));
    return MockData.reviews.where((r) => r.productId == productId).toList();
  }

  Future<List<Product>> searchProducts(
    String query, {
    int? minPrice,
    int? maxPrice,
    double? minRating,
    bool? inStock,
    bool? discountOnly,
  }) async {
    await Future.delayed(const Duration(milliseconds: 700));
    final lowerQ = query.toLowerCase();
    return MockData.products.where((p) {
      if (!p.titleEn.toLowerCase().contains(lowerQ) &&
          !p.titleAr.contains(lowerQ)) return false;
      if (minPrice != null && p.price < minPrice) return false;
      if (maxPrice != null && p.price > maxPrice) return false;
      if (minRating != null && p.rating < minRating) return false;
      if (inStock == true && p.stock <= 0) return false;
      if (discountOnly == true && !p.hasDiscount) return false;
      return true;
    }).toList();
  }
}
