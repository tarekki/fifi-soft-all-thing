// lib/features/product/product_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/product.dart';
import '../../shared/models/review.dart';
import '../../shared/providers/providers.dart';

// Combined state for Product Details Page
class ProductDetailsState {
  final Product product;
  final List<Review> reviews;
  final List<Product> related;
  
  const ProductDetailsState({
    required this.product,
    required this.reviews,
    required this.related,
  });
}

final productDetailsProvider = FutureProvider.family<ProductDetailsState, String>((ref, id) async {
  final repo = ref.watch(productRepositoryProvider);
  final reviewRepo = ref.watch(reviewRepositoryProvider);
  
  final product = await repo.fetchProduct(id);
  // Fetch others in parallel
  final results = await Future.wait([
    reviewRepo.fetchReviews(id),
    repo.fetchRelated(id),
  ]);
  
  return ProductDetailsState(
    product: product,
    reviews: results[0] as List<Review>,
    related: results[1] as List<Product>,
  );
});

// For Search
final productSearchProvider = FutureProvider.family<List<Product>, String>((ref, query) async {
  if (query.isEmpty) return [];
  return ref.watch(productRepositoryProvider).searchProducts(query);
});
