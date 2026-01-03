// lib/features/vendor/reviews/vendor_reviews_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/models/review.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/shared/widgets/rating_distribution.dart';
import 'package:yallabuy/shared/widgets/rating_stars.dart';
import 'package:yallabuy/shared/widgets/review_tile.dart';

class VendorReviewsScreen extends ConsumerWidget {
  const VendorReviewsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentVendorId = ref.watch(currentVendorIdProvider);
    final statsAsync = ref.watch(vendorRatingSummaryProvider(currentVendorId));
    final reviewsAsync = ref.watch(vendorReviewsProvider(currentVendorId));
    final productsMapAsync = ref.watch(productsMapProvider);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          const SliverAppBar(
            title: Text('تقييمات المتجر'),
            centerTitle: true,
            pinned: true,
            floating: true,
          ),
          
          // Summary Header
          SliverToBoxAdapter(
            child: statsAsync.when(
              loading: () => const LinearProgressIndicator(),
              error: (e,s) => Text('خطأ: $e'),
              data: (stats) {
                if (stats.totalReviews == 0) {
                  return const Padding(
                    padding: EdgeInsets.all(32.0),
                    child: Center(child: Text('لا يوجد تقييمات لمنتجاتك بعد', style: TextStyle(color: Colors.grey))),
                  );
                }

                // Stats Cards
                return Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: _buildSummaryCard(
                              context,
                              'المتوسط',
                              stats.averageRating.toStringAsFixed(1),
                              Icons.star,
                              Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: _buildSummaryCard(
                              context,
                              'العدد الكلي',
                              '${stats.totalReviews}',
                              Icons.rate_review,
                              Colors.blue,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      // Distribution
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTokens.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.grey[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('توزيع التقييمات', style: TextStyle(fontWeight: FontWeight.bold)),
                            const SizedBox(height: 8),
                            RatingDistribution(
                              distribution: stats.distribution,
                              totalReviews: stats.totalReviews,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                      // Highlights
                      if (stats.bestProductId != null || stats.mostReviewedProductId != null)
                         productsMapAsync.when(
                           data: (map) => _buildHighlights(context, stats, map),
                           loading: () => const SizedBox.shrink(),
                           error: (_,__) => const SizedBox.shrink(),
                         ),
                    ],
                  ),
                );
              },
            ),
          ),
          
          // Reviews List (Grouped by Product or mixed? Let's do latest mixed list with product info)
          // Simplified: Just list latest reviews with product context
          reviewsAsync.when(
            loading: () => const SliverFillRemaining(child: Center(child: CircularProgressIndicator())),
            error: (e,s) => SliverFillRemaining(child: Center(child: Text('خطأ: $e'))),
            data: (reviews) {
              if (reviews.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());

              return productsMapAsync.when(
                loading: () => const SliverToBoxAdapter(child: SizedBox.shrink()),
                error: (_,__) => const SliverToBoxAdapter(child: SizedBox.shrink()),
                data: (productsMap) {
                  return SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index == 0) return const Padding(
                            padding: EdgeInsets.only(bottom: 16),
                            child: Text('أحدث التقييمات', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                          );
                          
                          final review = reviews[index - 1];
                          final product = productsMap[review.productId];
                          if (product == null) return const SizedBox.shrink();

                          return _buildReviewItem(review, product);
                        },
                        childCount: reviews.length + 1,
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(BuildContext context, String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 22)),
          Text(title, style: const TextStyle(color: Colors.grey, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _buildHighlights(BuildContext context, dynamic stats, Map<String, Product> productsMap) {
    final bestP = productsMap[stats.bestProductId];
    final mostP = productsMap[stats.mostReviewedProductId];

    return Row(
      children: [
        if (bestP != null)
          Expanded(child: _buildHighlightItem(context, 'الأفضل تقييماً', bestP, Colors.green)),
        if (bestP != null && mostP != null) const SizedBox(width: 16),
        if (mostP != null)
          Expanded(child: _buildHighlightItem(context, 'الأكثر مراجعة', mostP, Colors.purple)),
      ],
    );
  }

  Widget _buildHighlightItem(BuildContext context, String label, Product product, Color color) {
    return GestureDetector(
      onTap: () => context.push('/product/${product.id}'),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Column(
          children: [
            Text(label, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12)),
            const SizedBox(height: 8),
            CircleAvatar(
              backgroundImage: NetworkImage(product.imageUrls.first),
              radius: 24,
            ),
            const SizedBox(height: 8),
            Text(
              product.titleAr,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildReviewItem(Review review, Product product) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          // Product Context Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
            ),
            child: Row(
              children: [
                ClipRRect(borderRadius: BorderRadius.circular(4), child: Image.network(product.imageUrls.first, width: 30, height: 30, fit: BoxFit.cover)),
                const SizedBox(width: 8),
                Expanded(child: Text(product.titleAr, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                const Icon(Icons.star, size: 14, color: Colors.amber),
                Text(' ${product.rating.toStringAsFixed(1)}', style: const TextStyle(fontSize: 12)),
              ],
            ),
          ),
          ReviewTile(review: review),
        ],
      ),
    );
  }
}
