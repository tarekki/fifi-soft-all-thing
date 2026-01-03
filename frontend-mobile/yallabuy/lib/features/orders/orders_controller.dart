// lib/features/orders/orders_controller.dart
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/models/cart_item.dart';
import '../../shared/models/order_models.dart';
import '../../shared/providers/providers.dart';
import 'package:uuid/uuid.dart';
import 'package:yallabuy/features/notifications/notifications_controller.dart';
import 'package:yallabuy/shared/models/notification_item.dart';
import '../location/location_controller.dart';

final myOrdersProvider = FutureProvider<List<Order>>((ref) async {
  return ref.watch(ordersRepositoryProvider).fetchOrders();
});

class OrdersController extends AsyncNotifier<void> {
  @override
  FutureOr<void> build() {}

  Future<Order?> placeOrder({
    required List<CartItem> cartItems,
    required int total,
    required String address,
  }) async {
    state = const AsyncValue.loading();
    
    final loc = ref.read(locationControllerProvider);
    if (loc.selectedCity == null || loc.selectedArea == null) {
       state = AsyncValue.error('Location not selected', StackTrace.current);
       return null;
    }

    try {
      final order = await ref.read(ordersRepositoryProvider).createOrderFromCart(
        cityId: loc.selectedCity!.id,
        areaId: loc.selectedArea!.id,
        addressLine: address,
        cart: cartItems,
        total: total,
      );
      
      // Clear cart on success
      ref.read(cartRepositoryProvider).clear();
      // Refresh orders list
      ref.invalidate(myOrdersProvider);
      
      
      // Trigger Notification
      final notif = NotificationItem(
        id: const Uuid().v4(),
        type: NotificationType.order,
        title: 'تم استلام طلبك بنجاح',
        body: 'رقم الطلب #${order.id}. سنقوم بتجهيزه قريباً.',
        createdAt: DateTime.now(),
        deepLinkRoute: '/c/orders',
      );
      await ref.read(notificationRepositoryProvider).addNotification(notif);
      ref.invalidate(notificationsControllerProvider);

      state = const AsyncValue.data(null);
      return order;
    } catch (e, st) {
      state = AsyncValue.error(e, st);
      return null;
    }
  }
}

final ordersControllerProvider = AsyncNotifierProvider<OrdersController, void>(() {
  return OrdersController();
});
