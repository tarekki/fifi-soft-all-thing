// lib/shared/models/address.dart
class Address {
  final String id;
  final String title; // e.g., "Home", "Work"
  final String cityId;
  final String cityName; // Store name for easier display
  final String areaId;
  final String areaName; // Store name for easier display
  final String addressLine;
  final String? building;
  final String? floor;
  final String? notes;
  final bool isDefault;

  const Address({
    required this.id,
    required this.title,
    required this.cityId,
    required this.cityName,
    required this.areaId,
    required this.areaName,
    required this.addressLine,
    this.building,
    this.floor,
    this.notes,
    this.isDefault = false,
  });

  Address copyWith({
    String? id,
    String? title,
    String? cityId,
    String? cityName,
    String? areaId,
    String? areaName,
    String? addressLine,
    String? building,
    String? floor,
    String? notes,
    bool? isDefault,
  }) {
    return Address(
      id: id ?? this.id,
      title: title ?? this.title,
      cityId: cityId ?? this.cityId,
      cityName: cityName ?? this.cityName,
      areaId: areaId ?? this.areaId,
      areaName: areaName ?? this.areaName,
      addressLine: addressLine ?? this.addressLine,
      building: building ?? this.building,
      floor: floor ?? this.floor,
      notes: notes ?? this.notes,
      isDefault: isDefault ?? this.isDefault,
    );
  }
}
