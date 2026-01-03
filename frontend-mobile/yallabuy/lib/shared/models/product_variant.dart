// lib/shared/models/product_variant.dart
class ProductVariant {
  final String id;
  final String name;
  final int priceDelta;

  const ProductVariant({
    required this.id,
    required this.name,
    required this.priceDelta,
  });
}
