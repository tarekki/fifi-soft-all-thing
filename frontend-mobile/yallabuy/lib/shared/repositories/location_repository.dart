// lib/shared/repositories/location_repository.dart
import '../mock/mock_data.dart';
import '../models/area.dart';
import '../models/city.dart';

class LocationRepository {
  Future<List<City>> fetchCities() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return MockData.cities;
  }

  Future<List<Area>> fetchAreas(String cityId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    return MockData.areas[cityId] ?? [];
  }
}
