// lib/features/reviews/my_reviews_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/models/review.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/features/product/product_controller.dart';

class MyReviewsScreen extends ConsumerWidget {
  const MyReviewsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 1. Fetch user reviews
    final reviewsAsync = ref.watch(myReviewsProvider);
    // 2. Fetch products map (cached) for sync lookup
    final productsMapAsync = ref.watch(productsMapProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('مراجعاتي'),
      ),
      body: reviewsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
        data: (reviews) {
          if (reviews.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.rate_review_outlined, size: 64, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(
                    'لم تقم بكتابة أي مراجعة بعد',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey),
                  ),
                ],
              ),
            );
          }

          // We need products map to render
          return productsMapAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, stack) => Center(child: Text('خطأ في تحميل المنتجات: $err')),
            data: (productsMap) {
              return ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: reviews.length,
                separatorBuilder: (_, __) => const SizedBox(height: 16),
                itemBuilder: (context, index) {
                  final review = reviews[index];
                  final product = productsMap[review.productId];

                  if (product == null) return const SizedBox.shrink();

                  return _buildReviewCard(context, ref, review, product);
                },
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildReviewCard(BuildContext context, WidgetRef ref, Review review, Product product) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        children: [
          // Header: Product Info
          ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.network(
                product.imageUrls.first,
                width: 50,
                height: 50,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) => Container(color: Colors.grey[300], width: 50, height: 50),
              ),
            ),
            title: Text(
              product.titleAr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            subtitle: Text(DateFormat.yMMMd().format(review.createdAt)),
            trailing: IconButton(
              icon: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
              onPressed: () => context.push('/product/${product.id}'),
            ),
          ),
          const Divider(height: 1),
          // Body: Rating & Comment
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Row(
                      children: List.generate(5, (index) {
                        return Icon(
                          index < review.rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 18,
                        );
                      }),
                    ),
                    const Spacer(),
                    // Delete Action
                    IconButton(
                      icon: const Icon(Icons.delete_outline, color: Colors.red),
                      onPressed: () => _confirmDelete(context, ref, review),
                      tooltip: 'حذف المراجعة',
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text(
                  review.comment,
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 14, color: Colors.black87),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, WidgetRef ref, Review review) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف المراجعة؟'),
        content: const Text('هل أنت متأكد من حذف هذه المراجعة؟ لا يمكن التراجع عن هذا الإجراء.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context); // Close dialog
              
              // Perform delete
              await ref.read(reviewRepositoryProvider).deleteReview(review.id);

              // 3. Refresh Providers
              // Refresh My Reviews List
              ref.invalidate(myReviewsProvider);
              // Refresh Product Reviews List
              ref.invalidate(productReviewsProvider(review.productId));
              // Refresh Product Details Stats (Rating/Count)
              ref.invalidate(productDetailsProvider(review.productId));
              ref.invalidate(productRatingStatsProvider(review.productId));

              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('تم حذف المراجعة')),
                );
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
  }
}
