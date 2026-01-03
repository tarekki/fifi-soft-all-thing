// lib/shared/repositories/vendor_repository.dart
import '../mock/mock_data.dart';
import '../models/product.dart';
import '../models/vendor.dart';

class VendorRepository {
  Future<Vendor> fetchVendor(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final v = MockData.vendorById[id];
    if (v == null) throw Exception('Vendor not found');
    return v;
  }

  Future<List<Product>> fetchVendorProducts(String vendorId,
      {String sort = "all"}) async {
    await Future.delayed(const Duration(milliseconds: 600));
    return MockData.products.where((p) => p.vendorId == vendorId).toList();
  }
}
