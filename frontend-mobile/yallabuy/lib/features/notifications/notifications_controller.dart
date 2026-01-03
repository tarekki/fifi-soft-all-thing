// lib/features/notifications/notifications_controller.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/shared/models/notification_item.dart';
import 'package:yallabuy/shared/providers/providers.dart';

// Controller
class NotificationsController extends AsyncNotifier<List<NotificationItem>> {
  @override
  Future<List<NotificationItem>> build() async {
    return ref.watch(notificationRepositoryProvider).fetchNotifications();
  }

  Future<void> addNotification(NotificationItem item) async {
    // We update state optimistically or re-fetch
    await ref.read(notificationRepositoryProvider).addNotification(item);
    ref.invalidateSelf(); // Simple refresh
  }

  Future<void> markRead(String id) async {
    await ref.read(notificationRepositoryProvider).markRead(id);
     // Optimistic update
    state = state.whenData((list) {
      return list.map((item) => item.id == id ? item.copyWith(isRead: true) : item).toList();
    });
  }

  Future<void> markAllRead() async {
    await ref.read(notificationRepositoryProvider).markAllRead();
    state = state.whenData((list) {
      return list.map((item) => item.copyWith(isRead: true)).toList();
    });
  }

  Future<void> removeNotification(String id) async {
    await ref.read(notificationRepositoryProvider).removeNotification(id);
    state = state.whenData((list) {
      return list.where((item) => item.id != id).toList();
    });
  }
}

final notificationsControllerProvider = AsyncNotifierProvider<NotificationsController, List<NotificationItem>>(NotificationsController.new);

// Computed Unread Count
final unreadNotificationCountProvider = Provider<int>((ref) {
  final state = ref.watch(notificationsControllerProvider);
  return state.maybeWhen(
    data: (list) => list.where((item) => !item.isRead).length,
    orElse: () => 0,
  );
});
