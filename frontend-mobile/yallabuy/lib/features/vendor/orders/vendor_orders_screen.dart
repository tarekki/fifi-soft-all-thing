// lib/features/vendor/orders/vendor_orders_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/utils/async_value_ui.dart';
import 'package:yallabuy/shared/utils/formatters.dart';
import 'vendor_orders_controller.dart';

class VendorOrdersScreen extends ConsumerWidget {
  const VendorOrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(vendorOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('طلبات المتجر')),
      body: AsyncValueWidget(
        value: ordersAsync,
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text('لا يوجد طلبات حالياً'));
          }
          return ListView.separated(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            itemCount: orders.length,
            separatorBuilder: (_, __) => const SizedBox(height: 16),
            itemBuilder: (context, index) {
              final order = orders[index];
              return Card(
                elevation: 0,
                color: AppTokens.surface,
                child: ListTile(
                  title: Text('#${order.id}'),
                  subtitle: Text('${Formatters.dateShort(order.createdAt)} • ${order.status.name}'),
                  trailing: Text(Formatters.currencySP(order.total)),
                  onTap: () {
                    context.push('/v/orders/${order.id}');
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
