// lib/features/catalog/catalog_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/category.dart';
import '../../shared/providers/providers.dart';

final topCategoriesProvider = FutureProvider<List<Category>>((ref) async {
  return ref.watch(catalogRepositoryProvider).fetchTopCategories();
});

final subCategoriesProvider = FutureProvider.family<List<Category>, String>((ref, parentId) async {
  return ref.watch(catalogRepositoryProvider).fetchSubcategories(parentId);
});
