// lib/shared/widgets/category_picker_sheet.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yallabuy/features/catalog/catalog_controller.dart';
import 'package:yallabuy/shared/models/category.dart';

class CategoryPickerSheet extends ConsumerWidget {
  const CategoryPickerSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categoriesAsync = ref.watch(topCategoriesProvider);

    return DraggableScrollableSheet(
      initialChildSize: 0.8,
      minChildSize: 0.5,
      maxChildSize: 0.9,
      expand: false,
      builder: (context, scrollController) {
        return Column(
          children: [
            AppBar(
              title: const Text('اختر التصنيف'),
              automaticallyImplyLeading: false,
              actions: [
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                )
              ],
            ),
            Expanded(
              child: categoriesAsync.when(
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, __) => Center(child: Text('Error: $e')),
                data: (categories) {
                  return ListView.builder(
                    controller: scrollController,
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final category = categories[index];
                      return ListTile(
                        leading: Icon(category.icon),
                        title: Text(category.nameAr),
                        onTap: () => Navigator.pop(context, category),
                      );
                    },
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
