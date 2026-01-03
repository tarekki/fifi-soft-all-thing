// lib/features/vendor/dashboard/vendor_dashboard_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/shared/providers/providers.dart';

final vendorStatsProvider = FutureProvider<Map<String, int>>((ref) async {
  final vendorId = ref.watch(currentVendorIdProvider);
  return ref.watch(vendorOpsRepositoryProvider).fetchVendorStats(vendorId);
});
