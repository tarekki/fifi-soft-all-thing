// lib/shared/repositories/orders_repository.dart
import '../mock/mock_data.dart';
import '../models/cart_item.dart';
import '../models/order_models.dart';

class OrdersRepository {
  // In-memory mock initialized with seed data
  final List<Order> _orders = List.from(MockData.orders);

  Future<List<Order>> fetchOrders() async {
    await Future.delayed(const Duration(milliseconds: 500));
    // Sort by Date Desc
    _orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return List.from(_orders);
  }

  Future<Order> fetchOrder(String orderId) async {
    await Future.delayed(const Duration(milliseconds: 300));
    return _orders.firstWhere((o) => o.id == orderId);
  }

  Future<Order> createOrderFromCart({
    required String cityId,
    required String areaId,
    required String addressLine,
    required List<CartItem> cart,
    required int total,
  }) async {
    await Future.delayed(const Duration(milliseconds: 1000));
    
    // Convert cart items to order items
    final items = cart.map((c) {
      final p = MockData.productById[c.productId]!;
      // Find variant name if any
      String? vName;
      if (c.selectedVariantId != null) {
        final v = p.variants.firstWhere((v) => v.id == c.selectedVariantId);
        vName = v.name;
      }
      
      return OrderItem(
        productId: p.id,
        vendorId: p.vendorId,
        qty: c.qty,
        unitPrice: p.finalPrice, // Simplified: price at time of order
        selectedVariantName: vName,
      );
    }).toList();

    final order = Order(
      id: 'ord_new_${DateTime.now().millisecondsSinceEpoch}',
      createdAt: DateTime.now(),
      status: OrderStatus.pending,
      cityId: cityId,
      areaId: areaId,
      addressLine: addressLine,
      items: items,
      timeline: [
        OrderTimelineItem(
          status: OrderStatus.pending,
          dateTime: DateTime.now(),
          note: 'تم استلام الطلب',
        ),
      ],
      total: total,
    );

    _orders.add(order);
    return order;
  }

  Future<void> updateOrderStatus(String orderId, OrderStatus newStatus) async {
    await Future.delayed(const Duration(milliseconds: 500));
    final index = _orders.indexWhere((o) => o.id == orderId);
    if (index != -1) {
      final oldOrder = _orders[index];
      
      // Create new timeline item
      final newItem = OrderTimelineItem(
        status: newStatus,
        dateTime: DateTime.now(), // Use dateTime, not timestamp
        note: _getStatusNote(newStatus),
      );

      // Create new list of timeline items (copy existing + new)
      final newTimeline = List<OrderTimelineItem>.from(oldOrder.timeline)..add(newItem);

      // Update the order in local list
      // Note: Since _orders is initialized from MockData.orders, we should also update MockData if we want global sync across app restarts (implied requirement)
      // But for now, updating _orders + MockData references
      final newOrder = oldOrder.copyWith(
        status: newStatus,
        timeline: newTimeline,
      );
      
      _orders[index] = newOrder;
      
      // Also update the MockData source of truth so other repos see it
      final mockIndex = MockData.orders.indexWhere((o) => o.id == orderId);
      if (mockIndex != -1) {
        MockData.orders[mockIndex] = newOrder;
      }
    }
  }

  String _getStatusNote(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 'تم استلام الطلب';
      case OrderStatus.confirmed: return 'تم تأكيد الطلب من قبل البائع';
      case OrderStatus.preparing: return 'جاري تجهيز الطلب';
      case OrderStatus.shipped: return 'تم شحن الطلب';
      case OrderStatus.delivered: return 'تم تسليم الطلب بنجاح';
      case OrderStatus.cancelled: return 'تم إلغاء الطلب';
    }
  }
}
