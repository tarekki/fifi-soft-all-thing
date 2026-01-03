// lib/shared/widgets/app_scaffold_vendor.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/localization/l10n.dart';
import '../../app/theme/tokens.dart';

class AppScaffoldVendor extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const AppScaffoldVendor({
    super.key,
    required this.navigationShell,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: NavigationBar(
        selectedIndex: navigationShell.currentIndex,
        backgroundColor: AppTokens.surfaceWhite,
        indicatorColor: AppTokens.secondaryAleppoOlive.withOpacity(0.2),
        onDestinationSelected: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: Strings.vDashboard,
          ),
          NavigationDestination(
            icon: Icon(Icons.list_alt),
            selectedIcon: Icon(Icons.list_alt),
            label: Strings.vOrders,
          ),
          NavigationDestination(
            icon: Icon(Icons.inventory_2_outlined),
            selectedIcon: Icon(Icons.inventory_2),
            label: Strings.vProducts,
          ),
          NavigationDestination(
            icon: Icon(Icons.storefront_outlined),
            selectedIcon: Icon(Icons.storefront),
            label: Strings.vProfile,
          ),
        ],
      ),
    );
  }
}
