// lib/features/addresses/addresses_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/addresses/address_controller.dart';
import 'package:yallabuy/shared/models/address.dart';

class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final addressesAsync = ref.watch(addressControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('عناويني')),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/c/address/new'),
        child: const Icon(Icons.add),
      ),
      body: addressesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('حدث خطأ: $e')),
        data: (addresses) {
          if (addresses.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.location_off, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('ما عندك عناوين… ضيف عنوان هلأ', style: TextStyle(color: Colors.grey, fontSize: 18)),
                ],
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceM),
            itemCount: addresses.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final address = addresses[index];
              return _AddressCard(address: address);
            },
          );
        },
      ),
    );
  }
}

class _AddressCard extends ConsumerWidget {
  final Address address;

  const _AddressCard({required this.address});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: address.isDefault
            ? const BorderSide(color: AppTokens.primaryDamascusRose, width: 1.5)
            : BorderSide.none,
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(
                  address.title.contains('البيت') ? Icons.home : Icons.work,
                  color: AppTokens.primaryDamascusRose,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  address.title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                if (address.isDefault) ...[
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTokens.primaryDamascusRose.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Text('الافتراضي', style: TextStyle(color: AppTokens.primaryDamascusRose, fontSize: 12)),
                  )
                ],
              ],
            ),
            const Divider(),
            Text('${address.cityName} - ${address.areaName}', style: const TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(address.addressLine, style: TextStyle(color: Colors.grey[700])),
            if (address.building != null || address.floor != null)
              Text('بناية: ${address.building ?? '-'}، طابق: ${address.floor ?? '-'}', style: TextStyle(color: Colors.grey[600], fontSize: 13)),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                if (!address.isDefault)
                  TextButton(
                    onPressed: () {
                      ref.read(addressControllerProvider.notifier).setDefault(address.id);
                    },
                    child: const Text('تعيين كافتراضي'),
                  ),
                IconButton(
                  icon: const Icon(Icons.edit, size: 20),
                  onPressed: () {
                    context.push('/c/address/${address.id}/edit', extra: address);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, size: 20, color: Colors.red),
                  onPressed: () {
                    // Show confirmation
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('حذف العنوان'),
                        content: const Text('هل أنت متأكد من حذف هذا العنوان؟'),
                        actions: [
                          TextButton(onPressed: () => context.pop(), child: const Text('إلغاء')),
                          TextButton(
                            onPressed: () {
                              ref.read(addressControllerProvider.notifier).removeAddress(address.id);
                              context.pop();
                            },
                            child: const Text('حذف', style: TextStyle(color: Colors.red)),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
