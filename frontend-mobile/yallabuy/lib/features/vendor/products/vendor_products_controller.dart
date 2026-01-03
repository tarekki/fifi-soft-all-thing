// lib/features/vendor/products/vendor_products_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/providers/providers.dart';

final vendorProductsProvider = FutureProvider<List<Product>>((ref) async {
  final vendorId = ref.watch(currentVendorIdProvider);
  return ref.watch(vendorRepositoryProvider).fetchVendorProducts(vendorId);
});

class VendorProductsNotifier extends AsyncNotifier<List<Product>> {
  @override
  Future<List<Product>> build() async {
    final vendorId = ref.watch(currentVendorIdProvider);
    return ref.watch(vendorRepositoryProvider).fetchVendorProducts(vendorId);
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => build());
  }
}

