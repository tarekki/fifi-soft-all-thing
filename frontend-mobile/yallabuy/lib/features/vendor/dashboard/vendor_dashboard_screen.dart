// lib/features/vendor/dashboard/vendor_dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/shared/utils/async_value_ui.dart';
import 'package:yallabuy/shared/utils/formatters.dart';
import 'vendor_dashboard_controller.dart';

class VendorDashboardScreen extends ConsumerWidget {
  const VendorDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(vendorStatsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('لوحة التحكم')),
      body: AsyncValueWidget(
        value: statsAsync,
        data: (stats) {
          return ListView(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            children: [
              _buildStatCard(
                'الطلبات النشطة',
                '${stats['orders']}',
                Icons.shopping_bag_outlined,
                Colors.orange,
              ),
              const SizedBox(height: AppTokens.spaceL),
              _buildStatCard(
                'المنتجات',
                '${stats['products']}',
                Icons.inventory_2_outlined,
                Colors.blue,
              ),
              const SizedBox(height: AppTokens.spaceL),
              _buildStatCard(
                'الإيرادات',
                Formatters.currencySP(stats['revenue'] ?? 0),
                Icons.attach_money,
                Colors.green,
              ),
              const SizedBox(height: AppTokens.spaceL),
              GestureDetector(
                onTap: () => context.push('/v/reviews'),
                child: _buildStatCard(
                  'تقييمات المتجر',
                  'عرض التفاصيل',
                  Icons.star,
                  Colors.amber,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Card(
      elevation: 0,
      color: AppTokens.surface,
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.spaceL),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 30),
            ),
            const SizedBox(width: AppTokens.spaceL),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.grey)),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
