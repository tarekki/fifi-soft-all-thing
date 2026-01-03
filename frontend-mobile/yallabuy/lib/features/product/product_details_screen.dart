// lib/features/product/product_details_screen.dart
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/cart/cart_controller.dart';
import 'package:yallabuy/features/favorites/favorites_controller.dart';
import 'package:yallabuy/features/product/product_controller.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/utils/async_value_ui.dart';
import 'package:yallabuy/shared/widgets/price_tag.dart';
import 'package:yallabuy/shared/widgets/product_card.dart';
import 'package:yallabuy/shared/widgets/rating_stars.dart';
import '../../features/reviews/add_review_screen.dart';
import '../../shared/widgets/review_tile.dart';

class ProductDetailsScreen extends ConsumerStatefulWidget {
  final String productId;
  final String? heroTag;

  const ProductDetailsScreen({
    super.key,
    required this.productId,
    this.heroTag,
  });

  @override
  ConsumerState<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends ConsumerState<ProductDetailsScreen> {
  int _selectedImageIndex = 0;
  String? _selectedVariantId;
  int _qty = 1;
  bool _isDescriptionExpanded = false;

  @override
  Widget build(BuildContext context) {
    final stateAsync = ref.watch(productDetailsProvider(widget.productId));

    return Scaffold(
      body: AsyncValueWidget(
        value: stateAsync,
        data: (state) {
          final product = state.product;

          return CustomScrollView(
            slivers: [
              _buildSliverAppBar(product),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(AppTokens.spaceL),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              product.titleAr,
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                    fontWeight: FontWeight.bold,
                                  ),
                            ),
                          ),
                          Consumer(
                            builder: (context, ref, _) {
                              final isFavorite = ref.watch(isFavoriteProvider(product.id));
                              return IconButton(
                                onPressed: () {
                                  ref.read(favoritesControllerProvider.notifier).toggleFavorite(product.id);
                                },
                                icon: Icon(
                                  isFavorite ? Icons.favorite : Icons.favorite_border,
                                  color: isFavorite ? AppTokens.damascusRose : Colors.grey,
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: 8),
                      // Rating
                      Builder(builder: (context) {
                        final count = state.reviews.length;
                        final rating = count == 0 ? 0.0 : state.reviews.fold(0.0, (sum, r) => sum + r.rating) / count;
                        
                        return GestureDetector(
                          onTap: () {
                             context.push('/product/${product.id}/reviews');
                          },
                          child: RatingStars(
                            rating: rating,
                            reviewCount: count,
                            size: 20,
                          ),
                        );
                      }),
                      
                      const SizedBox(height: 16),
                      
                      // Price
                      PriceTag(
                        price: product.price,
                        discountPercent: product.discountPercent,
                        fontSize: 24,
                      ),

                      const SizedBox(height: 24),
                      const Divider(),
                      const SizedBox(height: 16),

                      // Variants
                      if (product.variants.isNotEmpty) ...[
                        const Text('الخيار:', style: TextStyle(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: product.variants.map((v) {
                            final isSelected = _selectedVariantId == v.id;
                            return ChoiceChip(
                              label: Text(v.name),
                              selected: isSelected,
                              onSelected: (selected) {
                                setState(() {
                                  _selectedVariantId = selected ? v.id : null;
                                });
                              },
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 24),
                      ],

                      // Vendor Snippet
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: CircleAvatar(
                          backgroundColor: Colors.grey[200],
                          child: const Icon(Icons.store),
                        ),
                        title: const Text('المتجر'), // TODO: Fetch vendor name
                        subtitle: const Text('تقييم المتجر: 4.5'),
                        trailing: OutlinedButton(
                          onPressed: () {
                             ScaffoldMessenger.of(context).showSnackBar(
                               const SnackBar(content: Text('الانتقال للمتجر قريباً')),
                             );
                          },
                          child: const Text('زيارة'),
                        ),
                      ),
                      
                      const SizedBox(height: 24),

                      // Reviews Preview
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                           Text('التقييمات (${state.reviews.length})', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                           TextButton(
                             onPressed: () {
                               context.push('/product/${product.id}/reviews');
                             },
                             child: const Text('عرض الكل'),
                           ),
                        ],
                      ),
                      if (state.reviews.isEmpty)
                        const Padding(
                          padding: EdgeInsets.symmetric(vertical: 8.0),
                          child: Text('لا يوجد تقييمات بعد. كن أول من يقيم!'),
                        )
                      else ...[
                        ...state.reviews.take(2).map((r) => ReviewTile(review: r)),
                      ],
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () {
                             showModalBottomSheet(
                               context: context,
                               isScrollControlled: true,
                               builder: (context) => AddReviewScreen(productId: product.id),
                             );
                          },
                           icon: const Icon(Icons.edit_note),
                           label: const Text('اكتب تقييمك'),
                        ),
                      ),
                      
                      const SizedBox(height: 24),

                      // Description
                      const Text('الوصف', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      const SizedBox(height: 8),
                      Text(
                        product.descriptionAr,
                        maxLines: _isDescriptionExpanded ? null : 3,
                        overflow: _isDescriptionExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                        style: const TextStyle(height: 1.5, color: Colors.black87),
                      ),
                      TextButton(
                        onPressed: () {
                          setState(() {
                            _isDescriptionExpanded = !_isDescriptionExpanded;
                          });
                        },
                        child: Text(_isDescriptionExpanded ? 'عرض أقل' : 'عرض المزيد'),
                      ),

                      const SizedBox(height: 24),

                      // Related Products
                      if (state.related.isNotEmpty) ...[
                        const Text('منتجات مشابهة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 240,
                          child: ListView.separated(
                            scrollDirection: Axis.horizontal,
                            itemCount: state.related.length,
                            separatorBuilder: (_, __) => const SizedBox(width: 16),
                            itemBuilder: (context, index) {
                              final related = state.related[index];
                              return ProductCard(
                                product: related,
                                onTap: () {
                                  context.push('/product/${related.id}');
                                },
                              );
                            },
                          ),
                        ),
                      ],
                      // Extra space for bottom bar
                      const SizedBox(height: 80),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
      bottomSheet: stateAsync.value != null ? _buildBottomBar(context, stateAsync.value!.product) : null,
    );
  }

  Widget _buildSliverAppBar(Product product) {
    return SliverAppBar(
      expandedHeight: 400,
      pinned: true,
      backgroundColor: Colors.white,
      leading: Container(
        margin: const EdgeInsets.all(8),
        decoration: const BoxDecoration(
          color: Colors.white70,
          shape: BoxShape.circle,
        ),
        child: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => context.pop(),
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          alignment: Alignment.bottomCenter,
          children: [
            PageView.builder(
              itemCount: product.imageUrls.length,
              onPageChanged: (index) {
                setState(() {
                  _selectedImageIndex = index;
                });
              },
              itemBuilder: (context, index) {
                // If we have a custom hero tag from navigation, use it for the first image
                // Otherwise fallback to default or generate unique one for gallery paging
                Object tag;
                if (index == 0 && widget.heroTag != null) {
                  tag = widget.heroTag!;
                } else {
                  tag = 'product_${product.id}_$index';
                }

                return Hero(
                  tag: tag, 
                  child: CachedNetworkImage(
                    imageUrl: product.imageUrls[index],
                    fit: BoxFit.cover,
                  ),
                );
              },
            ),
            // Dots indicator
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(product.imageUrls.length, (index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 8,
                    height: 8,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _selectedImageIndex == index ? AppTokens.damascusRose : Colors.white70,
                    ),
                  );
                }),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar(BuildContext context, Product product) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Qty Selector
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300]!),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: _qty > 1 ? () => setState(() => _qty--) : null,
                  ),
                  Text('$_qty', style: const TextStyle(fontWeight: FontWeight.bold)),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: () => setState(() => _qty++),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTokens.damascusRose,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: () {
                   if (product.variants.isNotEmpty && _selectedVariantId == null) {
                     ScaffoldMessenger.of(context).showSnackBar(
                       const SnackBar(content: Text('الرجاء اختيار أحد الخيارات')),
                     );
                     return;
                   }
                   
                   ref.read(cartControllerProvider.notifier).addToCart(
                     product,
                     variantId: _selectedVariantId,
                     qty: _qty,
                   );
                   
                   ScaffoldMessenger.of(context).showSnackBar(
                     const SnackBar(content: Text('تمت الإضافة للسلة')),
                   );
                },
                child: const Text('إضافة للسلة', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
