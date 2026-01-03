// lib/shared/widgets/review_tile.dart
import 'package:flutter/material.dart';
import '../models/review.dart';
import '../../app/theme/tokens.dart';
import 'package:intl/intl.dart';

class ReviewTile extends StatelessWidget {
  final Review review;

  const ReviewTile({super.key, required this.review});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: AppTokens.damascusRose.withOpacity(0.1),
                backgroundImage: review.avatarUrl != null ? NetworkImage(review.avatarUrl!) : null,
                child: review.avatarUrl == null
                    ? Text(review.userName.characters.first, 
                        style: TextStyle(color: AppTokens.damascusRose))
                    : null,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  review.userName,
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
              Text(
                DateFormat.yMMMd().format(review.createdAt),
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (index) {
              return Icon(
                index < review.rating ? Icons.star : Icons.star_border,
                color: Colors.amber,
                size: 16,
              );
            }),
          ),
          const SizedBox(height: 8),
          Text(review.comment),
        ],
      ),
    );
  }
}
