// lib/shared/providers/providers.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../repositories/cart_repository.dart';
import '../repositories/catalog_repository.dart';
import '../repositories/location_repository.dart';
import '../repositories/orders_repository.dart';
import '../repositories/product_repository.dart';
import '../repositories/vendor_ops_repository.dart';
import '../repositories/favorites_repository.dart';
import '../repositories/address_repository.dart';
import '../repositories/notification_repository.dart';
import '../repositories/vendor_repository.dart';
import '../models/product.dart';
import '../repositories/review_repository.dart';
import '../models/review.dart';

// --- Repositories ---
final locationRepositoryProvider = Provider((ref) => LocationRepository());
final catalogRepositoryProvider = Provider((ref) => CatalogRepository());
final productRepositoryProvider = Provider((ref) => ProductRepository());
final vendorRepositoryProvider = Provider((ref) => VendorRepository());
final cartRepositoryProvider = Provider((ref) => CartRepository());
final ordersRepositoryProvider = Provider((ref) => OrdersRepository());
final vendorOpsRepositoryProvider = Provider((ref) => VendorOpsRepository(ref));
final favoritesRepositoryProvider = Provider((ref) => FavoritesRepository());
final addressRepositoryProvider = Provider((ref) => AddressRepository());
final notificationRepositoryProvider = Provider((ref) => NotificationRepository());

// --- Simple State ---
// For Vendor Mode: Selected Vendor ID (mocking logged-in vendor)
final currentVendorIdProvider = StateProvider<String>((ref) => 'v1');

// --- Quick Lookups ---
final productByIdProvider = FutureProvider.family<Product, String>((ref, id) async {
  return ref.watch(productRepositoryProvider).fetchProduct(id);
});

final reviewRepositoryProvider = Provider((ref) => ReviewRepository());

// Reviews for a specific product
final productReviewsProvider = FutureProvider.family<List<Review>, String>((ref, productId) async {
  final repo = ref.watch(reviewRepositoryProvider);
  return repo.fetchReviews(productId);
});

// Computed Rating Stats
final productRatingStatsProvider = Provider.family<({double rating, int count}), String>((ref, productId) {
  final reviewsValue = ref.watch(productReviewsProvider(productId));
  return reviewsValue.maybeWhen(
    data: (reviews) {
      if (reviews.isEmpty) return (rating: 0.0, count: 0);
      final total = reviews.fold(0.0, (sum, r) => sum + r.rating);
      return (rating: total / reviews.length, count: reviews.length);
    },
    orElse: () => (rating: 0.0, count: 0),
  );
});

// My Reviews Provider
final myReviewsProvider = FutureProvider<List<Review>>((ref) async {
  final repo = ref.watch(reviewRepositoryProvider);
  // Mock User
  return repo.fetchUserReviews('أنا'); // Must match the userName used in AddReviewScreen
});

// Products Map Provider (Fast Lookup)
final productsMapProvider = FutureProvider<Map<String, Product>>((ref) async {
  // We fetch all products once to build a lookup map
  final products = await ref.watch(productRepositoryProvider).fetchProducts();
  return {for (var p in products) p.id: p};
});

// --- Vendor Insights ---
// Fetch all reviews for a specific vendor
final vendorReviewsProvider = FutureProvider.family<List<Review>, String>((ref, vendorId) async {
  // 1. Get all products for this vendor
  // note: relying on ProductRepository to have a method for this or we filter existing list
  // existing: fetchProductsByCategory, etc. But let's check ProductRepository.
  // Actually simpler: fetch all products and filter locally for now? No, use correct repo method if exists.
  // ProductRepository has fetchProducts() (all). Let's use that and filter, assuming database scale is small.
  // If real app, we'd have fetchProductsByVendor.
  final allProducts = await ref.watch(productRepositoryProvider).fetchProducts();
  final vendorProductIds = allProducts
      .where((p) => p.vendorId == vendorId)
      .map((p) => p.id)
      .toList();
  
  if (vendorProductIds.isEmpty) return [];

  // 2. Fetch reviews for these products
  final reviewRepo = ref.watch(reviewRepositoryProvider);
  return reviewRepo.fetchReviewsByProductIds(vendorProductIds);
});

// Vendor Rating Summary Model
class VendorRatingSummary {
  final double averageRating;
  final int totalReviews;
  final Map<int, int> distribution;
  final String? bestProductId;
  final int mostReviewedCount;
  final String? mostReviewedProductId;

  VendorRatingSummary({
    required this.averageRating,
    required this.totalReviews,
    required this.distribution,
    this.bestProductId,
    this.mostReviewedCount = 0,
    this.mostReviewedProductId,
  });
}

final vendorRatingSummaryProvider = FutureProvider.family<VendorRatingSummary, String>((ref, vendorId) async {
  final reviews = await ref.watch(vendorReviewsProvider(vendorId).future);
  
  if (reviews.isEmpty) {
    return VendorRatingSummary(
      averageRating: 0, 
      totalReviews: 0, 
      distribution: {5:0, 4:0, 3:0, 2:0, 1:0}
    );
  }

  // Calc Average
  final totalRating = reviews.fold(0.0, (sum, r) => sum + r.rating);
  final avg = totalRating / reviews.length;

  // Calc Distribution
  final dist = <int, int>{5:0, 4:0, 3:0, 2:0, 1:0};
  for (var r in reviews) {
    dist[r.rating.round()] = (dist[r.rating.round()] ?? 0) + 1;
  }

  // Calc Best/Most Reviewed Product
  // Group by Product
  final reviewsByProduct = <String, List<Review>>{};
  for (var r in reviews) {
    if (!reviewsByProduct.containsKey(r.productId)) {
      reviewsByProduct[r.productId] = [];
    }
    reviewsByProduct[r.productId]!.add(r);
  }

  String? bestPid;
  double bestAvg = -1;
  
  String? mostPid;
  int mostCount = -1;

  reviewsByProduct.forEach((pid, pReviews) {
    // Most Reviewed
    if (pReviews.length > mostCount) {
      mostCount = pReviews.length;
      mostPid = pid;
    }

    // Best Rated (min 1 review) - weighted slightly by count could be better but simple avg for now
    final pTotal = pReviews.fold(0.0, (sum, r) => sum + r.rating);
    final pAvg = pTotal / pReviews.length;
    if (pAvg > bestAvg) {
      bestAvg = pAvg;
      bestPid = pid;
    }
  });

  return VendorRatingSummary(
    averageRating: avg,
    totalReviews: reviews.length,
    distribution: dist,
    bestProductId: bestPid,
    mostReviewedProductId: mostPid,
    mostReviewedCount: mostCount,
  );
});

