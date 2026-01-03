// lib/features/vendor/orders/vendor_order_details_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/vendor/orders/vendor_orders_controller.dart';
import 'package:yallabuy/shared/models/order_models.dart';
import 'package:yallabuy/shared/utils/formatters.dart';
import 'package:yallabuy/shared/mock/mock_data.dart'; // Import to look up product titles

class VendorOrderDetailsScreen extends ConsumerStatefulWidget {
  final String orderId;

  const VendorOrderDetailsScreen({super.key, required this.orderId});

  @override
  ConsumerState<VendorOrderDetailsScreen> createState() => _VendorOrderDetailsScreenState();
}

class _VendorOrderDetailsScreenState extends ConsumerState<VendorOrderDetailsScreen> {
  bool _isUpdating = false;

  Future<void> _updateStatus(OrderStatus status) async {
    setState(() => _isUpdating = true);
    try {
      await ref.read(vendorOrdersProvider.notifier).updateStatus(widget.orderId, status);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('تم تحديث حالة الطلب')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isUpdating = false);
    }
  }

  void _confirmCancel() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('تأكيد الرفض'),
        content: const Text('هل أنت متأكد من رفض هذا الطلب؟'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('إلغاء')),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _updateStatus(OrderStatus.cancelled);
            },
            child: const Text('رفض الطلب', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  // Helper to get product title since OrderItem only has ID
  String _getProductTitle(String productId) {
    final product = MockData.products.firstWhere(
      (p) => p.id == productId, 
      orElse: () => MockData.products.first // Fallback if mocked data is weird
    );
    return product.titleAr;
  }

  @override
  Widget build(BuildContext context) {
    final ordersAsync = ref.watch(vendorOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: Text('طلب #${widget.orderId}')),
      body: ordersAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
        data: (orders) {
          final order = orders.firstWhere(
            (o) => o.id == widget.orderId, 
            orElse: () => throw Exception('Order not found'),
          );

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(AppTokens.spaceM),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header Card
                      _buildInfoCard(
                        title: 'معلومات العميل',
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('العنوان: ${order.addressLine}'), // Fixed field name
                            const SizedBox(height: 8),
                            Text('تاريخ الطلب: ${Formatters.dateShort(order.createdAt)}'),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: _getStatusColor(order.status).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: _getStatusColor(order.status)),
                              ),
                              child: Text(
                                _getStatusText(order.status),
                                style: TextStyle(
                                  color: _getStatusColor(order.status),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Items
                      _buildInfoCard(
                        title: 'المنتجات',
                        child: Column(
                          children: order.items.map((item) => Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: Row(
                              children: [
                                Container(
                                  width: 40,
                                  height: 40,
                                  color: Colors.grey[200],
                                  child: const Icon(Icons.image, size: 20, color: Colors.grey),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(_getProductTitle(item.productId), maxLines: 1, overflow: TextOverflow.ellipsis),
                                      Text('${item.qty} x ${Formatters.currencySP(item.unitPrice)}', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    ],
                                  ),
                                ),
                                Text(Formatters.currencySP(item.unitPrice * item.qty)),
                              ],
                            ),
                          )).toList(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Total
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppTokens.damascusRose.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppTokens.damascusRose.withOpacity(0.3)),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('الإجمالي', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                            Text(Formatters.currencySP(order.total), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTokens.damascusRose)),
                          ],
                        ),
                      ),

                      const SizedBox(height: 24),
                      const Text('سجل النشاط', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                      const SizedBox(height: 16),
                      
                      // Timeline
                      ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: order.timeline.length,
                        itemBuilder: (context, index) {
                          final item = order.timeline[order.timeline.length - 1 - index]; // Reverse order
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Column(
                                  children: [
                                    Icon(Icons.circle, size: 12, color: index == 0 ? AppTokens.damascusRose : Colors.grey),
                                    if (index != order.timeline.length - 1)
                                      Container(width: 2, height: 30, color: Colors.grey[300]),
                                  ],
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(_getStatusText(item.status), style: const TextStyle(fontWeight: FontWeight.bold)),
                                      Text(item.note, style: const TextStyle(color: Colors.grey)),
                                      Text(DateFormat('hh:mm a').format(item.dateTime), style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 80), // Space for fab/bottom bar
                    ],
                  ),
                ),
              ),
              // Action Bar
              _buildActionBar(order),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoCard({required String title, required Widget child}) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTokens.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const Divider(height: 24),
          child,
        ],
      ),
    );
  }

  Widget _buildActionBar(Order order) {
    if (_isUpdating) return const Padding(padding: EdgeInsets.all(16.0), child: LinearProgressIndicator());
    if (order.status == OrderStatus.delivered || order.status == OrderStatus.cancelled) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: Row(
        children: [
          if (order.status == OrderStatus.pending) ...[
            Expanded(child: ElevatedButton(onPressed: () => _updateStatus(OrderStatus.confirmed), child: const Text('قبول الطلب'))),
            const SizedBox(width: 16),
            Expanded(child: OutlinedButton(onPressed: _confirmCancel, child: const Text('رفض', style: TextStyle(color: Colors.red)))),
          ] else if (order.status == OrderStatus.confirmed) ...[
            Expanded(child: ElevatedButton(onPressed: () => _updateStatus(OrderStatus.preparing), child: const Text('البدء بالتجهيز'))),
          ] else if (order.status == OrderStatus.preparing) ...[
            Expanded(child: ElevatedButton(onPressed: () => _updateStatus(OrderStatus.shipped), child: const Text('تم الشحن'))),
          ] else if (order.status == OrderStatus.shipped) ...[
            Expanded(child: ElevatedButton(onPressed: () => _updateStatus(OrderStatus.delivered), child: const Text('تم التسليم'))),
          ],
        ],
      ),
    );
  }

  String _getStatusText(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 'قيد الانتظار';
      case OrderStatus.confirmed: return 'مؤكد';
      case OrderStatus.preparing: return 'قيد التجهيز';
      case OrderStatus.shipped: return 'جاري التوصيل';
      case OrderStatus.delivered: return 'تم التسليم';
      case OrderStatus.cancelled: return 'ملغي';
    }
  }

  Color _getStatusColor(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return Colors.orange;
      case OrderStatus.confirmed: return Colors.blue;
      case OrderStatus.preparing: return Colors.purple;
      case OrderStatus.shipped: return Colors.indigo;
      case OrderStatus.delivered: return Colors.green;
      case OrderStatus.cancelled: return Colors.red;
    }
  }
}
