// lib/features/addresses/edit_address_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:uuid/uuid.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/features/addresses/address_controller.dart';
import 'package:yallabuy/shared/models/address.dart';
import 'package:yallabuy/shared/models/area.dart';
import 'package:yallabuy/shared/models/city.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/shared/widgets/form_field_card.dart';

class EditAddressScreen extends ConsumerStatefulWidget {
  final Address? addressToEdit; // If null, creating new

  const EditAddressScreen({super.key, this.addressToEdit});

  @override
  ConsumerState<EditAddressScreen> createState() => _EditAddressScreenState();
}

class _EditAddressScreenState extends ConsumerState<EditAddressScreen> {
  final _formKey = GlobalKey<FormState>();
  
  late TextEditingController _titleController;
  late TextEditingController _addressLineController;
  late TextEditingController _buildingController;
  late TextEditingController _floorController;
  late TextEditingController _notesController;
  
  City? _selectedCity;
  Area? _selectedArea;
  bool _isDefault = false;

  @override
  void initState() {
    super.initState();
    final address = widget.addressToEdit;
    
    _titleController = TextEditingController(text: address?.title ?? '');
    _addressLineController = TextEditingController(text: address?.addressLine ?? '');
    _buildingController = TextEditingController(text: address?.building ?? '');
    _floorController = TextEditingController(text: address?.floor ?? '');
    _notesController = TextEditingController(text: address?.notes ?? '');
    _isDefault = address?.isDefault ?? false;
    
    // Defer loading initial city/area logic until build or post-frame callback if strictly needed,
    // but for simple mock lists we can try to find them if we had access to the repo synchronously.
    // For now, we will rely on the user re-selecting or passing full objects if we had them.
    // Since we only passed 'cityId' and 'areaId', we'd need to fetch the full list to display correctly pre-selected.
    // To simplify: We'll fetch cities in build() and set initial values there if not set.
  }

  @override
  void dispose() {
    _titleController.dispose();
    _addressLineController.dispose();
    _buildingController.dispose();
    _floorController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Watch location repository to get cities
    final locationRepo = ref.watch(locationRepositoryProvider);
    // In a real app we would use a FutureBuilder or a provider for cities.
    // Since mock repo is async, let's just trigger a load or use a FutureBuilder.
    
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.addressToEdit == null ? 'إضافة عنوان جديد' : 'تعديل العنوان'),
      ),
      body: FutureBuilder<List<City>>(
        future: locationRepo.fetchCities(),
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          
          final cities = snapshot.data!;
          
          // Initialize selection if editing and not yet set
          if (widget.addressToEdit != null && _selectedCity == null) {
             try {
               // Find city
               _selectedCity = cities.firstWhere((c) => c.id == widget.addressToEdit!.cityId);
               // Find area
               _selectedArea = _selectedCity!.areas.firstWhere((a) => a.id == widget.addressToEdit!.areaId);
             } catch (_) {
               // If IDs changed or not found
             }
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(AppTokens.spaceL),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  FormFieldCard(
                    title: 'عنوان المكان (مثال: البيت، العمل)',
                    child: TextFormField(
                      controller: _titleController,
                      decoration: const InputDecoration(
                        hintText: 'البيت',
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'مطلوب' : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // City Picker
                  DropdownButtonFormField<City>(
                    decoration: InputDecoration(
                      labelText: 'المحافظة',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: AppTokens.surface,
                    ),
                    value: _selectedCity,
                    items: cities.map((city) => DropdownMenuItem(
                      value: city,
                      child: Text(city.nameAr),
                    )).toList(),
                    onChanged: (val) {
                      setState(() {
                         _selectedCity = val;
                         _selectedArea = null; // Reset area
                      });
                    },
                    validator: (v) => v == null ? 'مطلوب' : null,
                  ),
                  const SizedBox(height: 16),
                  
                  // Area Picker
                  DropdownButtonFormField<Area>(
                    decoration: InputDecoration(
                      labelText: 'المنطقة',
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                      filled: true,
                      fillColor: AppTokens.surface,
                    ),
                    value: _selectedArea,
                    items: _selectedCity?.areas.map((area) => DropdownMenuItem(
                      value: area,
                      child: Text(area.nameAr),
                    )).toList() ?? [],
                    onChanged: _selectedCity == null ? null : (val) {
                      setState(() {
                        _selectedArea = val;
                      });
                    },
                    validator: (v) => v == null ? 'مطلوب' : null,
                  ),
                  const SizedBox(height: 16),
                  
                  FormFieldCard(
                    title: 'اسم الشارع / تفاصيل العنوان',
                    child: TextFormField(
                      controller: _addressLineController,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        hintText: 'جانب حديقة تشرين...',
                        border: OutlineInputBorder(),
                      ),
                      validator: (v) => v == null || v.isEmpty ? 'مطلوب' : null,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  Row(
                    children: [
                      Expanded(
                        child: FormFieldCard(
                          title: 'البناء',
                          child: TextFormField(
                            controller: _buildingController,
                            decoration: const InputDecoration(
                              hintText: 'رقم 15',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: FormFieldCard(
                          title: 'الطابق',
                          child: TextFormField(
                            controller: _floorController,
                            decoration: const InputDecoration(
                              hintText: '3',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  FormFieldCard(
                    title: 'ملاحظات إضافية (اختياري)',
                    child: TextFormField(
                      controller: _notesController,
                      decoration: const InputDecoration(
                        hintText: 'قرب الدكان...',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  SwitchListTile(
                    title: const Text('تعيين كعنوان افتراضي'),
                    value: _isDefault,
                    onChanged: (val) => setState(() => _isDefault = val),
                    contentPadding: EdgeInsets.zero,
                  ),
                  
                  const SizedBox(height: 32),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTokens.primaryDamascusRose,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _saveAddress,
                      child: const Text('حفظ العنوان', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  void _saveAddress() {
    if (_formKey.currentState!.validate()) {
      final newAddress = Address(
        id: widget.addressToEdit?.id ?? const Uuid().v4(),
        title: _titleController.text,
        cityId: _selectedCity!.id,
        cityName: _selectedCity!.nameAr,
        areaId: _selectedArea!.id,
        areaName: _selectedArea!.nameAr,
        addressLine: _addressLineController.text,
        building: _buildingController.text,
        floor: _floorController.text,
        notes: _notesController.text,
        isDefault: _isDefault,
      );

      final notifier = ref.read(addressControllerProvider.notifier);
      if (widget.addressToEdit != null) {
        notifier.updateAddress(newAddress);
      } else {
        notifier.addAddress(newAddress);
      }
      
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('تم حفظ العنوان')));
      context.pop();
    }
  }
}
