// lib/shared/widgets/rating_distribution.dart
import 'package:flutter/material.dart';
import '../../app/theme/tokens.dart';

class RatingDistribution extends StatelessWidget {
  final Map<int, int> distribution; // e.g. {5: 10, 4: 5...}
  final int totalReviews;

  const RatingDistribution({
    super.key,
    required this.distribution,
    required this.totalReviews,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(5, (index) {
        final star = 5 - index;
        final count = distribution[star] ?? 0;
        final percentage = totalReviews == 0 ? 0.0 : count / totalReviews;

        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 2),
          child: Row(
            children: [
              Text('$star', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const Icon(Icons.star, size: 12, color: Colors.amber),
              const SizedBox(width: 8),
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: percentage,
                    minHeight: 8,
                    backgroundColor: Colors.grey[200],
                    valueColor: AlwaysStoppedAnimation<Color>(AppTokens.damascusRose),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              SizedBox(
                width: 30,
                child: Text(
                  '$count',
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                  textAlign: TextAlign.end,
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
