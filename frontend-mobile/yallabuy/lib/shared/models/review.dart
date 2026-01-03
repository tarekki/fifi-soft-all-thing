// lib/shared/models/review.dart
class Review {
  final String id;
  final String productId;
  final String userName;
  final String? avatarUrl;
  final double rating;
  final String comment;
  final DateTime createdAt;

  const Review({
    required this.id,
    required this.productId,
    required this.userName,
    this.avatarUrl,
    required this.rating,
    required this.comment,
    required this.createdAt,
  });
}
