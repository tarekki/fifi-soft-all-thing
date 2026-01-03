// lib/features/orders/orders_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../app/theme/tokens.dart';
import '../../shared/utils/async_value_ui.dart';
import '../../shared/utils/formatters.dart'; // import formatters
import 'orders_controller.dart';

class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final ordersAsync = ref.watch(myOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('طلباتي')),
      body: AsyncValueWidget(
        value: ordersAsync,
        data: (orders) {
          if (orders.isEmpty) {
            return const Center(child: Text('لا يوجد طلبات سابقة'));
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
                child: ExpansionTile(
                  title: Text('#${order.id}'),
                  subtitle: Text('${Formatters.dateShort(order.createdAt)} • ${order.status.name}'),
                  trailing: Text(
                    Formatters.currencySP(order.total),
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppTokens.damascusRose),
                  ),
                  children: order.items.map((item) {
                    return ListTile(
                      dense: true,
                      title: Text('Product ID: ${item.productId}'), // In real app: fetch name
                      subtitle: Text('${item.qty}x'),
                      trailing: Text(Formatters.currencySP(item.unitPrice)),
                    );
                  }).toList(),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
