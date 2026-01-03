// lib/features/cart/cart_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import '../cart/cart_controller.dart';
import '../../shared/providers/providers.dart';

class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final cartAsync = ref.watch(cartControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('السلة')),
      body: cartAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (items) {
          if (items.isEmpty) {
            return const Center(child: Text('سلة التسوق فارغة'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            itemCount: items.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final item = items[index];
              // Fetch product details for each item (simple fetch)
              final productAsync = ref.watch(productByIdProvider(item.productId));
              
              return productAsync.when(
                loading: () => const SizedBox(height: 80, child: Center(child: CircularProgressIndicator())),
                error: (_, __) => const SizedBox.shrink(),
                data: (product) {
                  return Card(
                    child: ListTile(
                      leading: Container(
                        width: 60,
                        height: 60,
                        color: Colors.grey[200],
                        // Use cached image in real app
                        child: const Icon(Icons.image),
                      ),
                      title: Text(product.titleAr),
                      subtitle: Text('${product.finalPrice} ل.س  x${item.qty}'),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red),
                        onPressed: () {
                          ref.read(cartControllerProvider.notifier).removeItem(item.id);
                        },
                      ),
                    ),
                  );
                },
              );
            },
          );
        },
      ),
      bottomNavigationBar: cartAsync.hasValue && cartAsync.value!.isNotEmpty
          ? Padding(
              padding: const EdgeInsets.all(AppTokens.spaceL),
              child: ElevatedButton(
                onPressed: () {
                  context.push('/c/checkout');
                },
                child: const Text('إتمام الطلب'),
              ),
            )
          : null,
    );
  }
}
