// lib/features/location/location_selector_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/tokens.dart';
import '../../shared/utils/async_value_ui.dart';
import 'location_controller.dart';

class LocationSelectorScreen extends ConsumerStatefulWidget {
  const LocationSelectorScreen({super.key});

  @override
  ConsumerState<LocationSelectorScreen> createState() => _LocationSelectorScreenState();
}

class _LocationSelectorScreenState extends ConsumerState<LocationSelectorScreen> {
  String? _selectedCityId;

  @override
  Widget build(BuildContext context) {
    // If city is selected, show areas, else show cities
    if (_selectedCityId != null) {
      return _buildAreaSelection(context);
    }
    return _buildCitySelection(context);
  }

  Widget _buildCitySelection(BuildContext context) {
    final citiesAsync = ref.watch(citiesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('اختر مدينتك')),
      body: AsyncValueWidget(
        value: citiesAsync,
        data: (cities) {
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            itemCount: cities.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final city = cities[index];
              return Card(
                elevation: 0,
                color: AppTokens.surface,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTokens.radiusL),
                  side: BorderSide(color: AppTokens.sand.withOpacity(0.5)),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.all(16),
                  title: Text(city.nameAr, style: const TextStyle(fontWeight: FontWeight.bold)),
                  subtitle: Text(city.nameEn),
                  trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                  onTap: () {
                    setState(() {
                      _selectedCityId = city.id;
                    });
                    ref.read(locationControllerProvider.notifier).setCity(city);
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }

  Widget _buildAreaSelection(BuildContext context) {
    final areasAsync = ref.watch(areasProvider(_selectedCityId!));

    return Scaffold(
      appBar: AppBar(
        title: const Text('اختر المنطقة'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            setState(() {
              _selectedCityId = null;
            });
          },
        ),
      ),
      body: AsyncValueWidget(
        value: areasAsync,
        data: (areas) {
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            itemCount: areas.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final area = areas[index];
              return Card(
                elevation: 0,
                color: AppTokens.surface,
                child: ListTile(
                  title: Text(area.nameAr),
                  subtitle: Text(area.nameEn),
                  trailing: const Icon(Icons.check_circle_outline),
                  onTap: () {
                    ref.read(locationControllerProvider.notifier).setArea(area);
                    context.go('/c/home');
                  },
                ),
              );
            },
          );
        },
      ),
    );
  }
}
