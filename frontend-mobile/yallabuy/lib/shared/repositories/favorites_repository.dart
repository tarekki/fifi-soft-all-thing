// lib/shared/repositories/favorites_repository.dart
class FavoritesRepository {
  final Set<String> _favorites = {};

  Future<Set<String>> loadFavorites() async {
    // Simulate tiny delay
    await Future.delayed(const Duration(milliseconds: 100));
    return Set.from(_favorites);
  }

  Future<void> toggleFavorite(String productId) async {
    if (_favorites.contains(productId)) {
      _favorites.remove(productId);
    } else {
      _favorites.add(productId);
    }
  }

  Future<bool> isFavorite(String productId) async {
    return _favorites.contains(productId);
  }

  Future<void> clear() async {
    _favorites.clear();
  }
}
