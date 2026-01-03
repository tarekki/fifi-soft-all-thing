// lib/features/reviews/product_reviews_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/shared/widgets/rating_distribution.dart';
import 'package:yallabuy/shared/widgets/review_tile.dart';
import 'add_review_screen.dart';

class ProductReviewsScreen extends ConsumerWidget {
  final String productId;

  const ProductReviewsScreen({super.key, required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviewsAsync = ref.watch(productReviewsProvider(productId));
    final stats = ref.watch(productRatingStatsProvider(productId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('تقييمات المنتج'),
        centerTitle: true,
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            builder: (context) => AddReviewScreen(productId: productId),
          );
        },
        label: const Text('اكتب تقييمك'),
        icon: const Icon(Icons.rate_review),
        backgroundColor: AppTokens.damascusRose,
      ),
      body: reviewsAsync.when(
        data: (reviews) {
          if (reviews.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                   const Icon(Icons.rate_review_outlined, size: 64, color: Colors.grey),
                   const SizedBox(height: 16),
                   Text(
                    'لسا ما في تقييمات…\nكن أول واحد!',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(color: Colors.grey),
                   ),
                ],
              ),
            );
          }

          // Compute distribution for UI
          final distribution = <int, int>{
            5: 0, 4: 0, 3: 0, 2: 0, 1: 0
          };
          for (var r in reviews) {
            distribution[r.rating.round()] = (distribution[r.rating.round()] ?? 0) + 1;
          }

          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      // Big Rating
                      Column(
                        children: [
                          Text(
                            stats.rating.toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 48,
                              fontWeight: FontWeight.bold,
                              height: 1,
                            ),
                          ),
                          Row(
                            children: List.generate(5, (index) {
                              return Icon(
                                index < stats.rating ? Icons.star : Icons.star_border,
                                color: Colors.amber,
                                size: 16,
                              );
                            }),
                          ),
                          const SizedBox(height: 4),
                          Text('${stats.count} تقييم', style: const TextStyle(color: Colors.grey)),
                        ],
                      ),
                      const SizedBox(width: 24),
                      // Bars
                      Expanded(
                        child: RatingDistribution(
                          distribution: distribution,
                          totalReviews: reviews.length,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: Divider()),
              SliverPadding(
                padding: const EdgeInsets.all(16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      return ReviewTile(review: reviews[index]);
                    },
                    childCount: reviews.length,
                  ),
                ),
              ),
              // Space for FAB
              const SliverToBoxAdapter(child: SizedBox(height: 80)),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('خطأ: $err')),
      ),
    );
  }
}
