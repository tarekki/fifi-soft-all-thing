// lib/features/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/tokens.dart';
import '../../app/mode/app_mode_controller.dart';
import '../../app/localization/l10n.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text(Strings.cProfile)),
      body: ListView(
        padding: const EdgeInsets.all(AppTokens.s16),
        children: [
          const CircleAvatar(
            radius: 50,
            backgroundColor: AppTokens.primaryDamascusRose,
            child: Icon(Icons.person, size: 50, color: Colors.white),
          ),
          const SizedBox(height: 16),
          const Center(child: Text('اسم المستخدم', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold))),
          const SizedBox(height: 32),
          
          ListTile(
            leading: const Icon(Icons.settings),
            title: const Text('الإعدادات'),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.rate_review_outlined),
            title: const Text('مراجعاتي'),
            onTap: () => context.push('/c/my-reviews'),
          ),
          ListTile(
            leading: const Icon(Icons.favorite_border),
            title: const Text('المفضلة'),
            onTap: () => context.push('/c/favorites'),
          ),
          ListTile(
            leading: const Icon(Icons.location_on_outlined),
            title: const Text('عناويني'),
            onTap: () => context.push('/c/addresses'),
          ),
           ListTile(
            leading: const Icon(Icons.language),
            title: const Text('اللغة / Language'),
            onTap: () {},
          ),
          
          const Divider(),
          
          // Switch to Vendor Mode
          ListTile(
            leading: const Icon(Icons.store, color: AppTokens.accentMosaicTeal),
            title: const Text(Strings.switchToVendor, style: TextStyle(color: AppTokens.accentMosaicTeal, fontWeight: FontWeight.bold)),
            onTap: () {
              ref.read(appModeProvider.notifier).switchToVendor();
              context.go('/v/dashboard');
            },
          ),
        ],
      ),
    );
  }
}
