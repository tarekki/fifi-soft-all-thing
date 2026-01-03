// lib/shared/models/order_models.dart
enum OrderStatus {
  pending,
  confirmed,
  preparing,
  shipped,
  delivered,
  cancelled,
}

class OrderTimelineItem {
  final OrderStatus status;
  final DateTime dateTime;
  final String note;

  const OrderTimelineItem({
    required this.status,
    required this.dateTime,
    required this.note,
  });
}

class OrderItem {
  final String productId;
  final String vendorId;
  final int qty;
  final int unitPrice;
  final String? selectedVariantName;

  const OrderItem({
    required this.productId,
    required this.vendorId,
    required this.qty,
    required this.unitPrice,
    this.selectedVariantName,
  });
}

class Order {
  final String id;
  final DateTime createdAt;
  final OrderStatus status;
  final String cityId;
  final String areaId;
  final String addressLine;
  final List<OrderItem> items;
  final List<OrderTimelineItem> timeline;
  final int total;

  const Order({
    required this.id,
    required this.createdAt,
    required this.status,
    required this.cityId,
    required this.areaId,
    required this.addressLine,
    required this.items,
    required this.timeline,
    required this.total,
  });

  Order copyWith({
    String? id,
    String? customerId,
    List<OrderItem>? items,
    int? total,
    OrderStatus? status,
    DateTime? createdAt,
    List<OrderTimelineItem>? timeline,
    String? addressLine,
  }) {
    return Order(
      id: id ?? this.id,
      cityId: cityId,
      areaId: areaId,
      items: items ?? this.items,
      total: total ?? this.total,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      timeline: timeline ?? this.timeline,
      addressLine: addressLine ?? this.addressLine,
    );
  }
}
