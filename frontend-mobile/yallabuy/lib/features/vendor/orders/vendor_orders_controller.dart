// lib/features/vendor/orders/vendor_orders_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:yallabuy/features/notifications/notifications_controller.dart';
import 'package:yallabuy/shared/models/notification_item.dart';
import 'package:yallabuy/shared/models/order_models.dart';
import 'package:yallabuy/shared/providers/providers.dart';

// Convert to AsyncNotifier to allow methods
final vendorOrdersProvider = AsyncNotifierProvider<VendorOrdersController, List<Order>>(
  VendorOrdersController.new,
);

class VendorOrdersController extends AsyncNotifier<List<Order>> {
  @override
  Future<List<Order>> build() async {
    final vendorId = ref.watch(currentVendorIdProvider);
    return ref.watch(vendorOpsRepositoryProvider).fetchVendorOrders(vendorId);
  }

  Future<void> updateStatus(String orderId, OrderStatus newStatus) async {
    // 1. Call Repository
    await ref.read(ordersRepositoryProvider).updateOrderStatus(orderId, newStatus);
    
    // Trigger Notification
    final notif = NotificationItem(
      id: const Uuid().v4(),
      type: NotificationType.order,
      title: 'تحديث حالة الطلب #$orderId',
      body: 'أصبحت حالة طلبك الآن: ${_getStatusText(newStatus)}',
      createdAt: DateTime.now(),
      deepLinkRoute: '/c/orders',
    );
    await ref.read(notificationRepositoryProvider).addNotification(notif);
    ref.invalidate(notificationsControllerProvider);
    
    // 2. Invalidate self to reload list
    ref.invalidateSelf();
    
    // 3. Wait for new state
    await future;
    
    // 4. Invalidate main orders provider so Customer View updates too
    ref.invalidate(ordersRepositoryProvider);
  }

  String _getStatusText(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 'قيد الانتظار';
      case OrderStatus.confirmed: return 'تم التأكيد';
      case OrderStatus.preparing: return 'قيد التجهيز';
      case OrderStatus.shipped: return 'تم الشحن';
      case OrderStatus.delivered: return 'تم التوصيل';
      case OrderStatus.cancelled: return 'ملغى';
    }
  }
}
