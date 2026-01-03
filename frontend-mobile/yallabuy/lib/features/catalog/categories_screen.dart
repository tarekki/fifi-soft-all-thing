// lib/features/catalog/categories_screen.dart
import 'package:flutter/material.dart';
import '../../app/theme/tokens.dart';

class CategoriesScreen extends StatelessWidget {
  const CategoriesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('التصنيفات')),
      body: ListView.separated(
        padding: const EdgeInsets.all(AppTokens.s16),
        itemCount: 10,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          return Card(
            child: ExpansionTile(
              leading: const Icon(Icons.checkroom),
              title: Text('تصنيف رئيسي $index'),
              children: List.generate(3, (i) => ListTile(title: Text('تصنيف فرعي $i'))),
            ),
          );
        },
      ),
    );
  }
}
