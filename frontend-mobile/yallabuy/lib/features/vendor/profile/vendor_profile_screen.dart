// lib/features/vendor/profile/vendor_profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/theme/tokens.dart';
import '../../../../app/mode/app_mode_controller.dart';
import '../../../../app/localization/l10n.dart';


class VendorProfileScreen extends ConsumerWidget {
  const VendorProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text(Strings.vProfile)),
      body: ListView(
        padding: const EdgeInsets.all(AppTokens.s16),
        children: [
          const Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                children: [
                  CircleAvatar(radius: 40, child: Icon(Icons.store)),
                  SizedBox(height: 8),
                  Text('متجر الأناقة', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
           ListTile(
            leading: const Icon(Icons.palette),
            title: const Text('تخصيص المتجر'),
            onTap: () {},
          ),
           ListTile(
            leading: const Icon(Icons.payment),
            title: const Text('المدفوعات'),
            onTap: () {},
          ),
          const Divider(),
          
          ListTile(
            leading: const Icon(Icons.person, color: AppTokens.primaryDamascusRose),
            title: const Text(Strings.switchToCustomer, style: TextStyle(color: AppTokens.primaryDamascusRose, fontWeight: FontWeight.bold)),
            onTap: () {
              ref.read(appModeProvider.notifier).switchToCustomer();
              context.go('/c/home');
            },
          ),
        ],
      ),
    );
  }
}
