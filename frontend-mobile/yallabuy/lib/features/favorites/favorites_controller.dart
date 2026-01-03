// lib/features/favorites/favorites_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/shared/repositories/product_repository.dart';

// Controller for the list of favorites (Set<String>)
class FavoritesController extends AsyncNotifier<Set<String>> {
  @override
  Future<Set<String>> build() async {
    return ref.watch(favoritesRepositoryProvider).loadFavorites();
  }

  Future<void> toggleFavorite(String productId) async {
    await ref.read(favoritesRepositoryProvider).toggleFavorite(productId);
    // Refresh local state
    state = await AsyncValue.guard(() => ref.read(favoritesRepositoryProvider).loadFavorites());
  }
}

final favoritesControllerProvider = AsyncNotifierProvider<FavoritesController, Set<String>>(
  FavoritesController.new,
);

// Helper provider to check if a specific product is favorite
final isFavoriteProvider = Provider.family<bool, String>((ref, productId) {
  final favoritesAsync = ref.watch(favoritesControllerProvider);
  return favoritesAsync.maybeWhen(
    data: (ids) => ids.contains(productId),
    orElse: () => false,
  );
});

// Provider to get the actual Product objects for the favorites screen
final favoriteProductsProvider = FutureProvider<List<Product>>((ref) async {
  final favoriteIds = ref.watch(favoritesControllerProvider).valueOrNull ?? {};
  if (favoriteIds.isEmpty) return [];

  // In a real app, we'd query by IDs. Here we fetch all and filter (since it's mock/in-memory)
  // Or utilize ProductRepository if it had a getByIds method.
  // For now, let's just fetch all from ProductRepository and filter
  final allProducts = await ref.watch(productRepositoryProvider).fetchProducts();
  return allProducts.where((p) => favoriteIds.contains(p.id)).toList();
});
