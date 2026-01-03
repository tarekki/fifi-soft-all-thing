// lib/features/vendor/products/vendor_products_screen.dart
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/utils/async_value_ui.dart';
import 'vendor_products_controller.dart';

class VendorProductsScreen extends ConsumerWidget {
  const VendorProductsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(vendorProductsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('منتجاتي'),
        actions: [
          IconButton(
            onPressed: () => context.push('/v/product/new'),
            icon: const Icon(Icons.add),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/v/product/new'),
        backgroundColor: AppTokens.damascusRose,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: AsyncValueWidget(
        value: productsAsync,
        data: (products) {
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            itemCount: products.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                elevation: 0,
                color: AppTokens.surface,
                child: ListTile(
                  onTap: () {
                    context.push('/v/product/${product.id}/edit');
                  },
                  contentPadding: const EdgeInsets.all(8),
                  leading: ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: CachedNetworkImage(
                      imageUrl: product.imageUrls.first,
                      width: 60,
                      height: 60,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: Colors.grey[200]),
                      errorWidget: (_, __, ___) => const Icon(Icons.broken_image),
                    ),
                  ),
                  title: Text(product.titleAr),
                  subtitle: Text('${product.price} ل.س • المخزون: ${product.stock}'),
                  trailing: IconButton(
                    icon: const Icon(Icons.edit, size: 20),
                    onPressed: () => context.push('/v/product/${product.id}/edit'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
