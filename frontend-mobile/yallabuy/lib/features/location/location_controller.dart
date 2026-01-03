// lib/features/location/location_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/area.dart';
import '../../shared/models/city.dart';
import '../../shared/providers/providers.dart';

class LocationState {
  final City? selectedCity;
  final Area? selectedArea;
  
  const LocationState({this.selectedCity, this.selectedArea});
  
  LocationState copyWith({City? selectedCity, Area? selectedArea}) {
    return LocationState(
      selectedCity: selectedCity ?? this.selectedCity,
      selectedArea: selectedArea ?? this.selectedArea,
    );
  }
}

class LocationController extends Notifier<LocationState> {
  @override
  LocationState build() {
    return const LocationState();
  }

  void setCity(City city) {
    state = state.copyWith(selectedCity: city, selectedArea: null);
  }

  void setArea(Area area) {
    state = state.copyWith(selectedArea: area);
  }
}

final locationControllerProvider = NotifierProvider<LocationController, LocationState>(() {
  return LocationController();
});

final citiesProvider = FutureProvider<List<City>>((ref) async {
  return ref.watch(locationRepositoryProvider).fetchCities();
});

final areasProvider = FutureProvider.family<List<Area>, String>((ref, cityId) async {
  return ref.watch(locationRepositoryProvider).fetchAreas(cityId);
});
