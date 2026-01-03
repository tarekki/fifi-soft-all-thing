import 'package:flutter/widgets.dart';

class Category {
  final String id;
  final String? parentId;
  final String nameAr;
  final String nameEn;
  final IconData icon;

  const Category({
    required this.id,
    this.parentId,
    required this.nameAr,
    required this.nameEn,
    required this.icon,
  });
}
