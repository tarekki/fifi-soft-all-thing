// lib/shared/models/city.dart
import 'area.dart';

class City {
  final String id;
  final String nameAr;
  final String nameEn;
  final List<Area> areas;

  const City({
    required this.id,
    required this.nameAr,
    required this.nameEn,
    this.areas = const [],
  });
}
