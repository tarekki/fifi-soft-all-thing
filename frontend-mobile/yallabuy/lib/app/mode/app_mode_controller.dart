// lib/app/mode/app_mode_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum AppMode {
  customer,
  vendor,
}

class AppModeNotifier extends StateNotifier<AppMode> {
  AppModeNotifier() : super(AppMode.customer);

  void switchToVendor() {
    state = AppMode.vendor;
  }

  void switchToCustomer() {
    state = AppMode.customer;
  }
}

final appModeProvider = StateNotifierProvider<AppModeNotifier, AppMode>((ref) {
  return AppModeNotifier();
});
