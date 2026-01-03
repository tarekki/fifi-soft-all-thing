// lib/features/cart/cart_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/cart_item.dart';
import '../../shared/models/product.dart';
import '../../shared/providers/providers.dart';

class CartController extends AsyncNotifier<List<CartItem>> {
  @override
  Future<List<CartItem>> build() async {
    return ref.watch(cartRepositoryProvider).getCart();
  }

  Future<void> addToCart(Product product, {String? variantId, int qty = 1}) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(cartRepositoryProvider).addToCart(product, variantId: variantId, qty: qty);
      return ref.read(cartRepositoryProvider).getCart();
    });
  }

  Future<void> updateQty(String itemId, int qty) async {
    // Optimistic update could be done here, but kept simple
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(cartRepositoryProvider).updateQty(itemId, qty);
      return ref.read(cartRepositoryProvider).getCart();
    });
  }

  Future<void> removeItem(String itemId) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(cartRepositoryProvider).remove(itemId);
      return ref.read(cartRepositoryProvider).getCart();
    });
  }
  
  Future<void> clearCart() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(cartRepositoryProvider).clear();
      return [];
    });
  }
}

final cartControllerProvider = AsyncNotifierProvider<CartController, List<CartItem>>(() {
  return CartController();
});

// Helper for total price
final cartTotalProvider = FutureProvider<int>((ref) async {
  final cartItems = ref.watch(cartControllerProvider).valueOrNull ?? [];
  if (cartItems.isEmpty) return 0;

  int total = 0;
  final productRepo = ref.read(productRepositoryProvider);
  
  // Fetch all products in parallel to calculate total
  await Future.wait(cartItems.map((item) async {
    try {
      final product = await productRepo.fetchProduct(item.productId);
      total += product.finalPrice * item.qty;
    } catch (e) {
      // Ignore missing products in total
    }
  }));
  
  return total;
});
