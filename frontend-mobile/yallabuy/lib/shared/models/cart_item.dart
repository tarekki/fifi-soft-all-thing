// lib/shared/models/cart_item.dart
class CartItem {
  final String id;
  final String productId;
  final String vendorId;
  final int qty;
  final String? selectedVariantId;

  const CartItem({
    required this.id,
    required this.productId,
    required this.vendorId,
    required this.qty,
    this.selectedVariantId,
  });

  CartItem copyWith({
    String? id,
    String? productId,
    String? vendorId,
    int? qty,
    String? selectedVariantId,
  }) {
    return CartItem(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      vendorId: vendorId ?? this.vendorId,
      qty: qty ?? this.qty,
      selectedVariantId: selectedVariantId ?? this.selectedVariantId,
    );
  }
}
