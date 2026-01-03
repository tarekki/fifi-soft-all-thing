// lib/features/home/home_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/notifications/notifications_controller.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/widgets/product_card.dart';
import 'home_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sectionsAsync = ref.watch(homeSectionsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('YallaBuy'),
        actions: [
          // Notification Badge
          Consumer(
            builder: (context, ref, _) {
              final unreadCount = ref.watch(unreadNotificationCountProvider);
              return Stack(
                children: [
                  IconButton(
                    icon: const Icon(Icons.notifications_outlined),
                    onPressed: () => context.push('/c/notifications'),
                  ),
                  if (unreadCount > 0)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: Text(
                          '$unreadCount',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              );
            },
          ),
          IconButton(
            onPressed: () {
              context.push('/search');
            }, 
            icon: const Icon(Icons.search),
          ),
        ],
      ),
      body: sectionsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, st) => Center(child: Text('Error: $err')),
        data: (sections) {
          if (sections.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text('الرجاء اختيار الموقع لعرض المنتجات', style: TextStyle(fontSize: 16)),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.go('/location'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTokens.damascusRose,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('تحديد الموقع'),
                  ),
                ],
              ),
            );
          }
          return ListView(
            padding: const EdgeInsets.symmetric(vertical: AppTokens.spaceL),
            children: [
              _buildSection(context, 'الأكثر طلباً', sections['popular'] ?? []),
              const SizedBox(height: AppTokens.spaceL),
              _buildSection(context, 'وصل حديثاً', sections['new'] ?? []),
              const SizedBox(height: AppTokens.spaceL),
              _buildSection(context, 'عروض مميزة', sections['deals'] ?? []),
            ],
          );
        },
      ),
    );
  }

  Widget _buildSection(BuildContext context, String title, List<Product> products) {
    if (products.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppTokens.spaceL),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              TextButton(onPressed: () {}, child: const Text('عرض الكل')),
            ],
          ),
        ),
        const SizedBox(height: AppTokens.spaceM),
        SizedBox(
          height: 240,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: AppTokens.spaceL),
            scrollDirection: Axis.horizontal,
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(width: AppTokens.spaceM),
            itemBuilder: (context, index) {
              final product = products[index];
              final heroTag = '${title}_${product.id}';
              return ProductCard(
                product: product,
                heroTag: heroTag,
                onTap: () {
                  context.push('/product/${product.id}', extra: {'heroTag': heroTag});
                },
              );
            },
          ),
        ),
      ],
    );
  }
}
