// lib/features/checkout/checkout_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/cart/cart_controller.dart';
import 'package:yallabuy/features/orders/orders_controller.dart';
import 'package:yallabuy/shared/utils/async_value_ui.dart';
import 'package:yallabuy/shared/utils/formatters.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  final _addressController = TextEditingController(text: 'دمشق، المزة، شارع 14');
  bool _isLoading = false;

  @override
  Widget build(BuildContext context) {
    final cartAsync = ref.watch(cartControllerProvider);
    final totalAsync = ref.watch(cartTotalProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('إتمام الطلب')),
      body: cartAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (items) {
          if (items.isEmpty) return const Center(child: Text('السلة فارغة'));

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Order Summary
                const Text('ملخص الطلب', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppTokens.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('عدد المنتجات: ${items.length}'),
                          AsyncValueWidget(
                            value: totalAsync,
                            data: (total) => Text(
                              Formatters.currencySP(total),
                              style: const TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('الإجمالي', style: TextStyle(fontWeight: FontWeight.bold)),
                           AsyncValueWidget(
                            value: totalAsync,
                            data: (total) => Text(
                              Formatters.currencySP(total),
                              style: const TextStyle(fontWeight: FontWeight.bold, color: AppTokens.damascusRose, fontSize: 18),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // Address
                const Text('عنوان التوصيل', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 16),
                TextField(
                  controller: _addressController,
                  decoration: const InputDecoration(
                    labelText: 'العنوان بالتفصيل',
                    prefixIcon: Icon(Icons.location_on_outlined),
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                ),

                const SizedBox(height: 24),

                // Payment Method
                const Text('طريقة الدفع', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    border: Border.all(color: AppTokens.damascusRose),
                    borderRadius: BorderRadius.circular(12),
                    color: AppTokens.damascusRose.withOpacity(0.05),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.money, color: AppTokens.damascusRose),
                      SizedBox(width: 16),
                      Text('الدفع عند الاستلام', style: TextStyle(fontWeight: FontWeight.bold)),
                      Spacer(),
                      Icon(Icons.check_circle, color: AppTokens.damascusRose),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0, -5))],
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (_isLoading)
                const LinearProgressIndicator()
              else
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (_addressController.text.isEmpty) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('الرجاء إدخال العنوان')),
                        );
                        return;
                      }

                      setState(() => _isLoading = true);

                      final total = totalAsync.value ?? 0; // Should maintain value if loaded
                      final cartItems = cartAsync.value ?? [];

                      // Add artificial delay for UX
                      await Future.delayed(const Duration(seconds: 1));

                      final order = await ref.read(ordersControllerProvider.notifier).placeOrder(
                        cartItems: cartItems,
                        total: total,
                        address: _addressController.text,
                      );

                      setState(() => _isLoading = false);

                      if (order != null && context.mounted) {
                        context.go('/c/order_success/${order.id}');
                      } else if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('حدث خطأ أثناء إنشاء الطلب')),
                        );
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTokens.damascusRose,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: const Text('تأكيد الطلب', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
