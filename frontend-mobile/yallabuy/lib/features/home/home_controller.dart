// lib/features/home/home_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/product.dart';
import '../../shared/providers/providers.dart';
import '../location/location_controller.dart';

final homeSectionsProvider = FutureProvider<Map<String, List<Product>>>((ref) async {
  final locationState = ref.watch(locationControllerProvider);
  if (locationState.selectedCity == null || locationState.selectedArea == null) {
    return {};
  }
  
  final repo = ref.watch(catalogRepositoryProvider);
  return repo.fetchHomeSections(
    cityId: locationState.selectedCity!.id,
    areaId: locationState.selectedArea!.id,
  );
});
