// lib/shared/repositories/notification_repository.dart
import '../models/notification_item.dart';

class NotificationRepository {
  final List<NotificationItem> _notifications = [
    NotificationItem(
      id: 'welcome_1',
      type: NotificationType.system,
      title: 'أهلاً بك في يلا شوب!',
      body: 'استمتع بأفضل تجربة تسوق في سوريا. تصفح آلاف المنتجات الآن.',
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      isRead: false,
    ),
    NotificationItem(
      id: 'promo_1',
      type: NotificationType.promo,
      title: 'خصم خاص لك',
      body: 'استخدم الكود YALLA20 للحصول على خصم 20% على طلبك الأول.',
      createdAt: DateTime.now().subtract(const Duration(hours: 5)),
      isRead: false,
    ),
  ];

  Future<List<NotificationItem>> fetchNotifications() async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 300));
    // Return copy sorted by date desc
    return List.from(_notifications)..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  Future<void> addNotification(NotificationItem item) async {
    _notifications.insert(0, item);
  }

  Future<void> markRead(String id) async {
    final index = _notifications.indexWhere((item) => item.id == id);
    if (index != -1) {
      _notifications[index] = _notifications[index].copyWith(isRead: true);
    }
  }

  Future<void> markAllRead() async {
    for (var i = 0; i < _notifications.length; i++) {
        _notifications[i] = _notifications[i].copyWith(isRead: true);
    }
  }

  Future<void> removeNotification(String id) async {
    _notifications.removeWhere((item) => item.id == id);
  }
}
