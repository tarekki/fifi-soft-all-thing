// lib/shared/mock/mock_data.dart
import 'dart:math';

import 'package:flutter/material.dart';
import '../models/area.dart';
import '../models/category.dart';
import '../models/city.dart';
import '../models/order_models.dart';
import '../models/product.dart';
import '../models/product_variant.dart';
import '../models/review.dart';
import '../models/vendor.dart';
import 'mock_images.dart';

class MockData {
  static final Random _rnd = Random(42);

  // --- 1. Locations --
  static const List<City> cities = [
    City(id: 'c1', nameAr: 'دمشق', nameEn: 'Damascus'),
    City(id: 'c2', nameAr: 'حلب', nameEn: 'Aleppo'),
    City(id: 'c3', nameAr: 'حمص', nameEn: 'Homs'),
    City(id: 'c4', nameAr: 'حماة', nameEn: 'Hama'),
    City(id: 'c5', nameAr: 'اللاذقية', nameEn: 'Latakia'),
    City(id: 'c6', nameAr: 'طرطوس', nameEn: 'Tartus'),
  ];

  static Map<String, List<Area>> get areas {
    final map = <String, List<Area>>{};
    for (var city in cities) {
      map[city.id] = List.generate(4, (i) {
        return Area(
          id: '${city.id}_a$i',
          cityId: city.id,
          nameAr: 'منطقة ${city.nameAr} $i',
          nameEn: '${city.nameEn} Area $i',
        );
      });
    }
    return map;
  }

  // --- 2. Categories ---
  static const List<Category> categories = [
    Category(id: 'cat1', nameAr: 'أزياء', nameEn: 'Fashion', icon: Icons.checkroom),
    Category(id: 'cat2', nameAr: 'إلكترونيات', nameEn: 'Electronics', icon: Icons.phone_android),
    Category(id: 'cat3', nameAr: 'موبايلات', nameEn: 'Mobiles', icon: Icons.smartphone),
    Category(id: 'cat4', nameAr: 'منزل وديكور', nameEn: 'Home', icon: Icons.home),
    Category(id: 'cat5', nameAr: 'مطبخ', nameEn: 'Kitchen', icon: Icons.kitchen),
    Category(id: 'cat6', nameAr: 'ألعاب', nameEn: 'Toys', icon: Icons.toys),
    Category(id: 'cat7', nameAr: 'جمال', nameEn: 'Beauty', icon: Icons.brush),
    Category(id: 'cat8', nameAr: 'رياضة', nameEn: 'Sports', icon: Icons.fitness_center),
    Category(id: 'cat9', nameAr: 'قرطاسية', nameEn: 'Stationery', icon: Icons.book),
    Category(id: 'cat10', nameAr: 'سوبر ماركت', nameEn: 'Supermarket', icon: Icons.shopping_cart),
    Category(id: 'cat11', nameAr: 'كتب', nameEn: 'Books', icon: Icons.menu_book),
    Category(id: 'cat12', nameAr: 'سيارات', nameEn: 'Auto', icon: Icons.directions_car),
  ];

  static List<Category> _generateSubCategories() {
    final subs = <Category>[];
    for (var p in categories) {
      for (int i = 1; i <= 3; i++) {
        subs.add(Category(
          id: '${p.id}_sub$i',
          parentId: p.id,
          nameAr: '${p.nameAr} فرعي $i',
          nameEn: '${p.nameEn} Sub $i',
          icon: p.icon,
        ));
      }
    }
    return subs;
  }

  static late final List<Category> subCategories = _generateSubCategories();

  // --- 3. Vendors ---
  static final List<Vendor> vendors = List.generate(12, (index) {
    final id = 'v${index + 1}';
    return Vendor(
      id: id,
      name: 'متجر ${index + 1}',
      rating: 3.5 + _rnd.nextDouble() * 1.5,
      cityId: cities[index % cities.length].id,
      logoUrl: MockImages.pic(100 + index, size: 200),
      coverUrl: MockImages.pic(200 + index, size: 800),
      tags: ['سريع', 'موثوق', 'جملة', 'جديد'].sublist(0, 2 + _rnd.nextInt(2)),
      policies: 'سياسة الاستبدال خلال 3 أيام. التوصيل خلال 24 ساعة.',
    );
  });

  // --- 4. Products ---
  static List<Product> _generateProducts() {
    final list = <Product>[];
    int pIndex = 0;
    for (var vendor in vendors) {
      for (int i = 0; i < 7; i++) {
        // 7 products per vendor approx
        pIndex++;
        final cat = categories[pIndex % categories.length];
        
        // Variants for some fashion items
        final hasVariants = cat.id == 'cat1' || cat.id == 'cat8';
        final variants = hasVariants
            ? [
                ProductVariant(id: 'pv_${pIndex}_1', name: 'S / أحمر', priceDelta: 0),
                ProductVariant(id: 'pv_${pIndex}_2', name: 'M / أحمر', priceDelta: 0),
                ProductVariant(id: 'pv_${pIndex}_3', name: 'L / أحمر', priceDelta: 500),
              ]
            : <ProductVariant>[];

        final price = (1000 + _rnd.nextInt(500)) * 50; // 50,000 to 75,000 roughly
        final discount = _rnd.nextBool() ? 10 + _rnd.nextInt(40) : 0;
        
        list.add(Product(
          id: 'p$pIndex',
          vendorId: vendor.id,
          categoryId: cat.id,
          titleAr: 'منتج رائع $pIndex من ${cat.nameAr}',
          titleEn: 'Awesome Product $pIndex from ${cat.nameEn}',
          descriptionAr: 'هذا وصف تجريبي للمنتج رقم $pIndex. يتميز بالجودة العالية والسعر المناسب. مناسب لجميع الاستخدامات.',
          price: price,
          discountPercent: discount,
          rating: 3.0 + _rnd.nextDouble() * 2.0,
          stock: _rnd.nextInt(50),
          imageUrls: [
            MockImages.pic(1000 + pIndex),
            MockImages.pic(2000 + pIndex),
            MockImages.pic(3000 + pIndex),
          ],
          variants: variants,
          isFeatured: _rnd.nextInt(10) < 2, // 20% featured
        ));
      }
    }
    return list;
  }

  static late final List<Product> products = _generateProducts();

  // --- 5. Reviews ---
  static List<Review> _generateReviews() {
    final revs = <Review>[];
    for (var p in products.take(20)) { // reviews for first 20 products
      for (int i = 0; i < 3; i++) {
        revs.add(Review(
          id: 'r_${p.id}_$i',
          productId: p.id,
          userName: 'User $i',
          rating: 4.0 + _rnd.nextDouble(),
          comment: 'منتج ممتاز جداً وأنصح به بشدة!',
          createdAt: DateTime.now().subtract(Duration(days: _rnd.nextInt(30))),
        ));
      }
    }
    return revs;
  }
  
  static late final List<Review> reviews = _generateReviews();

  // --- 6. Orders ---
  static final List<Order> orders = List.generate(8, (i) {
    final status = OrderStatus.values[i % OrderStatus.values.length];
    return Order(
      id: 'ord${1000+i}',
      createdAt: DateTime.now().subtract(Duration(days: i)),
      status: status,
      cityId: cities[0].id,
      areaId: areas[cities[0].id]![0].id,
      addressLine: 'شارع الثورة، بناء 5',
      items: [
         OrderItem(
           productId: products[i].id,
           vendorId: products[i].vendorId,
           qty: 1 + i,
           unitPrice: products[i].finalPrice,
         )
      ],
      timeline: [
        OrderTimelineItem(status: OrderStatus.pending, dateTime: DateTime.now().subtract(Duration(days: i, hours: 5)), note: 'تم الطلب'),
        if (status != OrderStatus.pending)
           OrderTimelineItem(status: status, dateTime: DateTime.now().subtract(Duration(days: i, hours: 2)), note: 'تحديث الحالة'),
      ],
      total: products[i].finalPrice * (1 + i),
    );
  });

  // --- Lookup Maps ---
  static Map<String, Product> get productById => { for (var p in products) p.id: p };
  static Map<String, Vendor> get vendorById => { for (var v in vendors) v.id: v };
  static Map<String, Category> get categoryById => { for (var c in categories) c.id: c };
}
