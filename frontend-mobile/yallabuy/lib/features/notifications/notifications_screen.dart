// lib/features/notifications/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/notifications/notifications_controller.dart';
import 'package:yallabuy/shared/models/notification_item.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notificationsAsync = ref.watch(notificationsControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('الإشعارات'),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all),
            tooltip: 'تحديد الكل كمقروء',
            onPressed: () {
               ref.read(notificationsControllerProvider.notifier).markAllRead();
            },
          ),
        ],
      ),
      body: notificationsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('حدث خطأ: $e')),
        data: (notifications) {
          if (notifications.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.notifications_off_outlined, size: 64, color: Colors.grey[300]),
                  const SizedBox(height: 16),
                  const Text('لا يوجد إشعارات حالياً', style: TextStyle(color: Colors.grey, fontSize: 18)),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: notifications.length,
            padding: const EdgeInsets.symmetric(vertical: 8),
            itemBuilder: (context, index) {
              final notification = notifications[index];
              return Dismissible(
                key: Key(notification.id),
                direction: DismissDirection.endToStart,
                background: Container(
                  color: Colors.red,
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.only(left: 20),
                  child: const Icon(Icons.delete, color: Colors.white),
                ),
                onDismissed: (_) {
                  ref.read(notificationsControllerProvider.notifier).removeNotification(notification.id);
                },
                child: _NotificationTile(notification: notification),
              );
            },
          );
        },
      ),
    );
  }
}

class _NotificationTile extends ConsumerWidget {
  final NotificationItem notification;

  const _NotificationTile({required this.notification});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    IconData icon;
    Color color;

    switch (notification.type) {
      case NotificationType.order:
        icon = Icons.local_shipping;
        color = Colors.blue;
        break;
      case NotificationType.promo:
        icon = Icons.local_offer;
        color = Colors.orange;
        break;
      case NotificationType.system:
        icon = Icons.info;
        color = Colors.grey;
        break;
    }

    return ListTile(
      tileColor: notification.isRead ? Colors.transparent : AppTokens.primaryDamascusRose.withOpacity(0.05),
      leading: CircleAvatar(
        backgroundColor: color.withOpacity(0.1),
        child: Icon(icon, color: color, size: 20),
      ),
      title: Text(
        notification.title,
        style: TextStyle(
          fontWeight: notification.isRead ? FontWeight.normal : FontWeight.bold,
        ),
      ),
      subtitle: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),
          Text(notification.body),
          const SizedBox(height: 4),
          Text(
            DateFormat('yyyy-MM-dd – hh:mm a').format(notification.createdAt),
            style: TextStyle(fontSize: 11, color: Colors.grey[600]),
          ),
        ],
      ),
      onTap: () {
        ref.read(notificationsControllerProvider.notifier).markRead(notification.id);
        if (notification.deepLinkRoute != null) {
          context.push(notification.deepLinkRoute!);
        }
      },
    );
  }
}
