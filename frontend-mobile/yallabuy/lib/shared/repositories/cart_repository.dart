// lib/shared/repositories/cart_repository.dart
import '../models/cart_item.dart';
import '../models/product.dart';

class CartRepository {
  // In-memory mock
  final List<CartItem> _items = [];
  int _idCounter = 1;

  Future<List<CartItem>> getCart() async {
    await Future.delayed(const Duration(milliseconds: 200));
    return List.from(_items);
  }

  Future<void> addToCart(Product product,
      {String? variantId, int qty = 1}) async {
    await Future.delayed(const Duration(milliseconds: 200));
    
    // Check if already exists
    final index = _items.indexWhere((i) =>
        i.productId == product.id && i.selectedVariantId == variantId);

    if (index != -1) {
      final existing = _items[index];
      _items[index] = existing.copyWith(qty: existing.qty + qty);
    } else {
      _items.add(CartItem(
        id: 'cart_${_idCounter++}',
        productId: product.id,
        vendorId: product.vendorId,
        qty: qty,
        selectedVariantId: variantId,
      ));
    }
  }

  Future<void> updateQty(String cartItemId, int qty) async {
    await Future.delayed(const Duration(milliseconds: 200));
    final index = _items.indexWhere((i) => i.id == cartItemId);
    if (index != -1) {
      if (qty <= 0) {
        _items.removeAt(index);
      } else {
        _items[index] = _items[index].copyWith(qty: qty);
      }
    }
  }

  Future<void> remove(String cartItemId) async {
    await Future.delayed(const Duration(milliseconds: 200));
    _items.removeWhere((i) => i.id == cartItemId);
  }

  Future<void> clear() async {
    await Future.delayed(const Duration(milliseconds: 100));
    _items.clear();
  }
}
