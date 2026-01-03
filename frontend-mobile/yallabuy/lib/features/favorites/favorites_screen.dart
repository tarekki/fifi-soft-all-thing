// lib/features/favorites/favorites_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/favorites/favorites_controller.dart';
import 'package:yallabuy/shared/widgets/product_card.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoritesAsync = ref.watch(favoriteProductsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المفضلة')),
      body: favoritesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (products) {
          if (products.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.favorite_border, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('لسا ما ضفت شي للمفضلة', style: TextStyle(color: Colors.grey, fontSize: 18)),
                ],
              ),
            );
          }

          return GridView.builder(
            padding: const EdgeInsets.all(AppTokens.spaceM),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 0.7,
              crossAxisSpacing: AppTokens.spaceM,
              mainAxisSpacing: AppTokens.spaceM,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) {
              return ProductCard(product: products[index]);
            },
          );
        },
      ),
    );
  }
}
