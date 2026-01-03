// lib/shared/widgets/form_field_card.dart
import 'package:flutter/material.dart';
import 'package:yallabuy/app/theme/tokens.dart';

class FormFieldCard extends StatelessWidget {
  final String title;
  final Widget child;
  final bool required;

  const FormFieldCard({
    super.key,
    required this.title,
    required this.child,
    this.required = false,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: AppTokens.surface,
      margin: const EdgeInsets.only(bottom: AppTokens.spaceL),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTokens.radiusL)),
      child: Padding(
        padding: const EdgeInsets.all(AppTokens.spaceL),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                if (required) const Text(' *', style: TextStyle(color: Colors.red)),
              ],
            ),
            const SizedBox(height: AppTokens.spaceM),
            child,
          ],
        ),
      ),
    );
  }
}
