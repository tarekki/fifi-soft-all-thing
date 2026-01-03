// lib/shared/widgets/variant_editor.dart
import 'package:flutter/material.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/models/product_variant.dart';

class VariantEditor extends StatefulWidget {
  final List<ProductVariant> variants;
  final ValueChanged<List<ProductVariant>> onChanged;

  const VariantEditor({
    super.key,
    required this.variants,
    required this.onChanged,
  });

  @override
  State<VariantEditor> createState() => _VariantEditorState();
}

class _VariantEditorState extends State<VariantEditor> {
  void _addVariant() {
    final newVariant = ProductVariant(
      id: 'v_${DateTime.now().millisecondsSinceEpoch}',
      name: 'وحدة جديدة',
      priceDelta: 0,
    );
    widget.onChanged([...widget.variants, newVariant]);
  }

  void _removeVariant(int index) {
    final updated = List<ProductVariant>.from(widget.variants);
    updated.removeAt(index);
    widget.onChanged(updated);
  }

  void _updateVariant(int index, ProductVariant variant) {
    final updated = List<ProductVariant>.from(widget.variants);
    updated[index] = variant;
    widget.onChanged(updated);
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
         ...widget.variants.asMap().entries.map((entry) {
           final i = entry.key;
           final v = entry.value;
           return Padding(
             padding: const EdgeInsets.only(bottom: 8.0),
             child: Row(
               children: [
                 Expanded(
                   flex: 2,
                   child: TextFormField(
                     initialValue: v.name,
                     decoration: const InputDecoration(labelText: 'الاسم'),
                     onChanged: (val) => _updateVariant(i, v.copy(name: val)),
                   ),
                 ),
                 const SizedBox(width: 8),
                 Expanded(
                   child: TextFormField(
                     initialValue: v.priceDelta.toString(),
                     decoration: const InputDecoration(labelText: 'فرق السعر'),
                     keyboardType: TextInputType.number,
                     onChanged: (val) => _updateVariant(i, v.copy(priceDelta: int.tryParse(val) ?? 0)),
                   ),
                 ),
                 IconButton(
                   icon: const Icon(Icons.delete, color: Colors.red),
                   onPressed: () => _removeVariant(i),
                 ),
               ],
             ),
           );
         }),
         ElevatedButton.icon(
           onPressed: _addVariant,
           icon: const Icon(Icons.add),
           label: const Text('إضافة خيار'),
         ),
      ],
    );
  }
}

extension ProductVariantCopy on ProductVariant {
  ProductVariant copy({String? name, int? priceDelta}) {
    return ProductVariant(
      id: id,
      name: name ?? this.name,
      priceDelta: priceDelta ?? this.priceDelta,
    );
  }
}
