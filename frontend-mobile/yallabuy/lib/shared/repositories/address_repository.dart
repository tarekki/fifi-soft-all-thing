// lib/shared/repositories/address_repository.dart
import '../models/address.dart';

class AddressRepository {
  final List<Address> _addresses = [
    // Seed with one dummy address for testing
    const Address(
      id: '1',
      title: 'البيت',
      cityId: 'damascus',
      cityName: 'دمشق',
      areaId: 'area_1',
      areaName: 'الميدان',
      addressLine: 'جانب جامع الحسن',
      building: 'بناية الأمل',
      floor: '3',
      isDefault: true,
    ),
  ];

  Future<List<Address>> fetchAddresses() async {
    await Future.delayed(const Duration(milliseconds: 300));
    return List.from(_addresses);
  }

  Future<void> addAddress(Address address) async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (address.isDefault) {
      _unsetDefault();
    }
    _addresses.add(address);
  }

  Future<void> updateAddress(Address address) async {
    await Future.delayed(const Duration(milliseconds: 300));
    final index = _addresses.indexWhere((a) => a.id == address.id);
    if (index != -1) {
      if (address.isDefault) {
        _unsetDefault();
      }
      _addresses[index] = address;
    }
  }

  Future<void> removeAddress(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _addresses.removeWhere((a) => a.id == id);
  }

  Future<void> setDefault(String id) async {
    await Future.delayed(const Duration(milliseconds: 300));
    _unsetDefault();
    final index = _addresses.indexWhere((a) => a.id == id);
    if (index != -1) {
      _addresses[index] = _addresses[index].copyWith(isDefault: true);
    }
  }

  void _unsetDefault() {
    for (var i = 0; i < _addresses.length; i++) {
      if (_addresses[i].isDefault) {
        _addresses[i] = _addresses[i].copyWith(isDefault: false);
      }
    }
  }
}
