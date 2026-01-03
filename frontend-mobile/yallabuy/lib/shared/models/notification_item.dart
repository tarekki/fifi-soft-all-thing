// lib/shared/models/notification_item.dart
enum NotificationType { order, promo, system }

class NotificationItem {
  final String id;
  final NotificationType type;
  final String title;
  final String body;
  final DateTime createdAt;
  final bool isRead;
  final String? deepLinkRoute;
  final Map<String, dynamic>? meta;

  const NotificationItem({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.createdAt,
    this.isRead = false,
    this.deepLinkRoute,
    this.meta,
  });

  NotificationItem copyWith({
    String? id,
    NotificationType? type,
    String? title,
    String? body,
    DateTime? createdAt,
    bool? isRead,
    String? deepLinkRoute,
    Map<String, dynamic>? meta,
  }) {
    return NotificationItem(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      body: body ?? this.body,
      createdAt: createdAt ?? this.createdAt,
      isRead: isRead ?? this.isRead,
      deepLinkRoute: deepLinkRoute ?? this.deepLinkRoute,
      meta: meta ?? this.meta,
    );
  }
}
