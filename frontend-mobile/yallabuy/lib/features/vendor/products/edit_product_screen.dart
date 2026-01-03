// lib/features/vendor/products/edit_product_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/models/category.dart';
import 'package:yallabuy/shared/models/product.dart';
import 'package:yallabuy/shared/models/product_variant.dart';
import 'package:yallabuy/shared/providers/providers.dart';
// import 'package:yallabuy/shared/repositories/vendor_ops_repository.dart'; // Removed to fix conflict
import 'package:yallabuy/shared/widgets/category_picker_sheet.dart';
import 'package:yallabuy/shared/widgets/form_field_card.dart';
import 'package:yallabuy/shared/widgets/image_picker_mock_sheet.dart';
import 'package:yallabuy/shared/widgets/variant_editor.dart';
import 'vendor_products_controller.dart';

class EditProductScreen extends ConsumerStatefulWidget {
  final String? productId; // Null = Create

  const EditProductScreen({super.key, this.productId});

  @override
  ConsumerState<EditProductScreen> createState() => _EditProductScreenState();
}

class _EditProductScreenState extends ConsumerState<EditProductScreen> {
  final _formKey = GlobalKey<FormState>();
  
  // Form Fields
  String _titleAr = '';
  String _titleEn = '';
  String _descAr = '';
  int _price = 0;
  int _stock = 10;
  int _discount = 0;
  List<String> _images = [];
  List<ProductVariant> _variants = [];
  Category? _selectedCategory;

  bool _isLoading = false;
  bool _isInit = true;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_isInit && widget.productId != null) {
      _loadProduct();
    }
    _isInit = false;
  }

  Future<void> _loadProduct() async {
    setState(() => _isLoading = true);
    try {
      final product = await ref.read(productRepositoryProvider).fetchProduct(widget.productId!);
      setState(() {
        _titleAr = product.titleAr;
        _titleEn = product.titleEn;
        _descAr = product.descriptionAr;
        _price = product.price;
        _stock = product.stock;
        _discount = product.discountPercent;
        _images = List.from(product.imageUrls);
        _variants = List.from(product.variants);
        // ideally we fetch category object, for now mock
        _selectedCategory = Category(id: product.categoryId, nameAr: 'الفئة الحالية', nameEn: '', parentId: null, icon: Icons.category);
      });
    } catch (e) {
      // Error handling
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_images.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرجاء إضافة صورة واحدة على الأقل')));
      return;
    }
    if (_selectedCategory == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('الرجاء اختيار الفئة')));
      return;
    }

    _formKey.currentState!.save();
    setState(() => _isLoading = true);

    final product = Product(
      id: widget.productId ?? 'p_${DateTime.now().millisecondsSinceEpoch}',
      vendorId: ref.read(currentVendorIdProvider),
      categoryId: _selectedCategory!.id,
      titleAr: _titleAr,
      titleEn: _titleEn,
      descriptionAr: _descAr,
      price: _price,
      stock: _stock,
      discountPercent: _discount,
      rating: 0, // Reset rating on new/edit or keep
      imageUrls: _images,
      variants: _variants,
      isFeatured: false,
    );

    await ref.read(vendorOpsRepositoryProvider).upsertProduct(product);
    
    // Invalidate list to refresh
    ref.invalidate(vendorProductsProvider);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ المنتج بنجاح')));
      context.pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading && widget.productId != null && _titleAr.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.productId == null ? 'إضافة منتج' : 'تعديل منتج'),
        actions: [
          IconButton(
            icon: const Icon(Icons.check),
            onPressed: _isLoading ? null : _save,
          )
        ],
      ),
      body: Form(
        key: _formKey,
        child: CustomScrollView(
          slivers: [
            SliverPadding(
              padding: const EdgeInsets.all(AppTokens.spaceL),
              sliver: SliverList(
                delegate: SliverChildListDelegate(
                  [
                    // Images
                    FormFieldCard(
                    title: 'الصور',
                    required: true,
                    child: SizedBox(
                      height: 100,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        children: [
                          ..._images.asMap().entries.map((e) {
                            return Stack(
                              children: [
                                Container(
                                  margin: const EdgeInsets.only(left: 8),
                                  width: 100,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(8),
                                    image: DecorationImage(image: NetworkImage(e.value), fit: BoxFit.cover),
                                  ),
                                ),
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: IconButton(
                                    icon: const Icon(Icons.close, color: Colors.red),
                                    onPressed: () => setState(() => _images.removeAt(e.key)),
                                  ),
                                ),
                              ],
                            );
                          }),
                          InkWell(
                            onTap: () async {
                              final result = await showModalBottomSheet<String>(
                                context: context,
                                isScrollControlled: true,
                                builder: (_) => const ImagePickerMockSheet(),
                              );
                              if (result != null) {
                                setState(() => _images.add(result));
                              }
                            },
                            child: Container(
                              width: 100,
                              decoration: BoxDecoration(
                                color: Colors.grey[200],
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(color: Colors.grey[400]!),
                              ),
                              child: const Icon(Icons.add_a_photo, color: Colors.grey),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Basic Info
                  FormFieldCard(
                    title: 'معلومات أساسية',
                    required: true,
                    child: Column(
                      children: [
                        TextFormField(
                          initialValue: _titleAr,
                          decoration: const InputDecoration(labelText: 'اسم المنتج (عربي)'),
                          validator: (v) => v!.isEmpty ? 'مطلوب' : null,
                          onSaved: (v) => _titleAr = v!,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          initialValue: _titleEn,
                          decoration: const InputDecoration(labelText: 'اسم المنتج (إنجليزي - اختياري)'),
                          onSaved: (v) => _titleEn = v ?? '',
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          initialValue: _descAr,
                          decoration: const InputDecoration(labelText: 'الوصف'),
                          maxLines: 3,
                          validator: (v) => v!.isEmpty ? 'مطلوب' : null,
                          onSaved: (v) => _descAr = v!,
                        ),
                      ],
                    ),
                  ),

                  // Pricing & Stock
                  FormFieldCard(
                    title: 'السعر والمخزون',
                    required: true,
                    child: Column(
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                initialValue: _price > 0 ? _price.toString() : '',
                                decoration: const InputDecoration(labelText: 'السعر (ل.س)'),
                                keyboardType: TextInputType.number,
                                validator: (v) => v!.isEmpty ? 'مطلوب' : null,
                                onSaved: (v) => _price = int.tryParse(v!) ?? 0,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: TextFormField(
                                initialValue: _stock.toString(),
                                decoration: const InputDecoration(labelText: 'الكمية'),
                                keyboardType: TextInputType.number,
                                onSaved: (v) => _stock = int.tryParse(v!) ?? 0,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 16),
                         TextFormField(
                          initialValue: _discount.toString(),
                          decoration: const InputDecoration(labelText: 'نسبة الخصم %'),
                          keyboardType: TextInputType.number,
                          onSaved: (v) => _discount = int.tryParse(v!) ?? 0,
                        ),
                      ],
                    ),
                  ),

                  // Category
                  FormFieldCard(
                    title: 'التصنيف',
                    required: true,
                    child: InkWell(
                      onTap: () async {
                         final result = await showModalBottomSheet<Category>(
                           context: context,
                           isScrollControlled: true,
                           builder: (_) => const CategoryPickerSheet(),
                         );
                         if (result != null) {
                           setState(() => _selectedCategory = result);
                         }
                      },
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey[400]!),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              _selectedCategory != null 
                                  ? _selectedCategory!.icon
                                  : Icons.category,
                            ),
                            const SizedBox(width: 16),
                            Text(_selectedCategory?.nameAr ?? 'اختر الفئة'),
                            const Spacer(),
                            const Icon(Icons.arrow_forward_ios, size: 16),
                          ],
                        ),
                      ),
                    ),
                  ),

                  // Variants
                  FormFieldCard(
                    title: 'الخيارات (الألوان/المقاسات)',
                    child: VariantEditor(
                      variants: _variants,
                      onChanged: (updated) => setState(() => _variants = updated),
                    ),
                  ),

                  if (_isLoading)
                     const Padding(
                       padding: EdgeInsets.all(16.0),
                       child: Center(child: CircularProgressIndicator()),
                     ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
