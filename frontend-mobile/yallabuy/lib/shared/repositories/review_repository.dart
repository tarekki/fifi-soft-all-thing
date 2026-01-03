// lib/shared/repositories/review_repository.dart
import 'dart:math';
import 'package:yallabuy/shared/mock/mock_data.dart';
import 'package:yallabuy/shared/models/review.dart';

class ReviewRepository {
  // Static storage to persist reviews across repository instances and ensure single seeding
  static final List<Review> _reviews = [];
  static bool _seeded = false;

  ReviewRepository() {
    if (!_seeded) {
      _reviews.addAll(MockData.reviews);
      _seeded = true;
    }
  }

  Future<List<Review>> fetchReviews(String productId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _reviews.where((r) => r.productId == productId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<List<Review>> fetchReviewsByProductIds(List<String> productIds) async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Fast lookup using Set
    final idsSet = productIds.toSet();
    return _reviews.where((r) => idsSet.contains(r.productId)).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<List<Review>> fetchUserReviews(String userName) async {
    await Future.delayed(const Duration(milliseconds: 300));
    // Filter by userName (assuming unique for this mock)
    return _reviews.where((r) => r.userName == userName).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<void> addReview({
    required String productId,
    required String userName,
    required double rating,
    required String comment,
    String? avatarUrl,
  }) async {
    await Future.delayed(const Duration(milliseconds: 500));
    
    final newReview = Review(
      id: 'r_${DateTime.now().millisecondsSinceEpoch}',
      productId: productId,
      userName: userName,
      avatarUrl: avatarUrl,
      rating: rating,
      comment: comment,
      createdAt: DateTime.now(),
    );

    _reviews.add(newReview);
  }

  Future<void> deleteReview(String reviewId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _reviews.removeWhere((r) => r.id == reviewId);
  }

  Future<double> getAverageRating(String productId) async {
    final productReviews = _reviews.where((r) => r.productId == productId);
    if (productReviews.isEmpty) return 0.0;
    
    final total = productReviews.fold(0.0, (sum, r) => sum + r.rating);
    return total / productReviews.length;
  }

  Future<int> getReviewCount(String productId) async {
    return _reviews.where((r) => r.productId == productId).length;
  }
}
