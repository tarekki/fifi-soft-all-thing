// lib/features/auth/auth_shell_screen.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../app/theme/tokens.dart';
import '../../shared/widgets/brand_logo.dart';
import '../../shared/widgets/patterned_background.dart';
import '../../app/localization/l10n.dart';

class AuthShellScreen extends StatelessWidget {
  const AuthShellScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PatternedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppTokens.s24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const BrandLogo(),
                const SizedBox(height: AppTokens.s64),
                
                // Placeholder Login Form
                const TextField(
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.email_outlined),
                    labelText: 'البريد الإلكتروني',
                  ),
                ),
                const SizedBox(height: AppTokens.s16),
                const TextField(
                  obscureText: true,
                  decoration: InputDecoration(
                    prefixIcon: Icon(Icons.lock_outline),
                    labelText: 'كلمة المرور',
                  ),
                ),
                const SizedBox(height: AppTokens.s32),
                
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => context.go('/location'),
                    child: Text(Strings.login),
                  ),
                ),
                const SizedBox(height: AppTokens.s16),
                TextButton(
                  onPressed: () => context.go('/c/home'),
                  child: Text(Strings.guest),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
