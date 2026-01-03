// lib/features/addresses/address_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:yallabuy/shared/models/address.dart';
import 'package:yallabuy/shared/providers/providers.dart';

class AddressController extends AsyncNotifier<List<Address>> {
  @override
  Future<List<Address>> build() async {
    return ref.watch(addressRepositoryProvider).fetchAddresses();
  }

  Future<void> addAddress(Address address) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(addressRepositoryProvider).addAddress(address);
      return ref.read(addressRepositoryProvider).fetchAddresses();
    });
  }

  Future<void> updateAddress(Address address) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(addressRepositoryProvider).updateAddress(address);
      return ref.read(addressRepositoryProvider).fetchAddresses();
    });
  }

  Future<void> removeAddress(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(addressRepositoryProvider).removeAddress(id);
      return ref.read(addressRepositoryProvider).fetchAddresses();
    });
  }

  Future<void> setDefault(String id) async {
    // Optimistic update could be done here, but sticking to simple refetch for now
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      await ref.read(addressRepositoryProvider).setDefault(id);
      return ref.read(addressRepositoryProvider).fetchAddresses();
    });
  }
  
  Address? getDefaultAddress() {
    return state.valueOrNull?.cast<Address?>().firstWhere(
      (a) => a?.isDefault == true,
      orElse: () => null,
    );
  }
}

final addressControllerProvider = AsyncNotifierProvider<AddressController, List<Address>>(AddressController.new);
