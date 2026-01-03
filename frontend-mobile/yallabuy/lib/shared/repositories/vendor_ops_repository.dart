// lib/shared/repositories/vendor_ops_repository.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/order_models.dart';
import '../models/product.dart';
import '../mock/mock_data.dart';
import '../providers/providers.dart'; // Import central providers

class VendorOpsRepository {
  final Ref _ref;

  VendorOpsRepository(this._ref);

  Future<Map<String, int>> fetchVendorStats(String vendorId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final products = MockData.products.where((p) => p.vendorId == vendorId).length;
    final allOrders = await _ref.read(ordersRepositoryProvider).fetchOrders();
    final orders = allOrders
        .where((o) => o.items.any((i) => i.vendorId == vendorId))
        .length;
    
    // Calculate simulated revenue
    int revenue = 0;
    // mock logic
    revenue = orders * 250000; 

    return {
      'orders': orders,
      'products': products,
      'revenue': revenue,
    };
  }

  Future<List<Order>> fetchVendorOrders(String vendorId) async {
    await Future.delayed(const Duration(milliseconds: 600));
    // In a real app we'd filter orders by vendor. 
    // MockData.orders might need a vendorId field or we check items.
    // For now returning all mock orders as if they belong to this vendor (for demo)
    // or filtering if possible.
    // MockData orders do not have vendorId directly on Order, but items do.
    // Let's check items.
    final allOrders = await _ref.read(ordersRepositoryProvider).fetchOrders();
    return allOrders.where((o) => 
      // PERMISSIVE: If vendor is v1, show EVERYTHING for demo purposes so user always sees orders
      vendorId == 'v1' || o.items.any((i) => i.vendorId == vendorId)
    ).toList();
  }

  Future<void> upsertProduct(Product product) async {
    await Future.delayed(const Duration(milliseconds: 800));
    
    final existingIndex = MockData.products.indexWhere((p) => p.id == product.id);
    if (existingIndex != -1) {
      MockData.products[existingIndex] = product;
    } else {
      MockData.products.insert(0, product);
    }
  }
}
