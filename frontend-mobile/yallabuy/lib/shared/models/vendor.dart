// lib/shared/models/vendor.dart
class Vendor {
  final String id;
  final String name;
  final double rating;
  final String cityId;
  final String logoUrl;
  final String coverUrl;
  final List<String> tags;
  final String policies;

  const Vendor({
    required this.id,
    required this.name,
    required this.rating,
    required this.cityId,
    required this.logoUrl,
    required this.coverUrl,
    required this.tags,
    required this.policies,
  });
}
