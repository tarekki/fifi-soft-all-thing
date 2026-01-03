// lib/shared/repositories/catalog_repository.dart
import '../mock/mock_data.dart';
import '../models/category.dart';
import '../models/product.dart';

class CatalogRepository {
  Future<List<Category>> fetchTopCategories() async {
    await Future.delayed(const Duration(milliseconds: 600));
    return MockData.categories;
  }

  Future<List<Category>> fetchSubcategories(String parentId) async {
    await Future.delayed(const Duration(milliseconds: 400));
    return MockData.subCategories
        .where((c) => c.parentId == parentId)
        .toList();
  }

  Future<Map<String, List<Product>>> fetchHomeSections({
    required String cityId,
    required String areaId,
  }) async {
    await Future.delayed(const Duration(milliseconds: 800));
    return {
      'popular': MockData.products.where((p) => p.rating >= 4.5).take(6).toList(),
      'new': MockData.products.reversed.take(6).toList(),
      'deals': MockData.products.where((p) => p.hasDiscount).take(6).toList(),
      'featured': MockData.products.where((p) => p.isFeatured).take(6).toList(),
    };
  }
}
