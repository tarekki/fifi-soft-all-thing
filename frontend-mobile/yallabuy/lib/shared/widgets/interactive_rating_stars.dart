// lib/shared/widgets/interactive_rating_stars.dart
import 'package:flutter/material.dart';

class InteractiveRatingStars extends StatelessWidget {
  final double rating;
  final ValueChanged<double>? onRatingChanged;
  final double size;
  final Color color;

  const InteractiveRatingStars({
    super.key,
    required this.rating,
    this.onRatingChanged,
    this.size = 32,
    this.color = Colors.amber,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starIndex = index + 1;
        final isSelected = rating >= starIndex;
        return GestureDetector(
          onTap: onRatingChanged != null ? () => onRatingChanged!(starIndex.toDouble()) : null,
          child: Icon(
            isSelected ? Icons.star : Icons.star_border,
            color: color,
            size: size,
          ),
        );
      }),
    );
  }
}
