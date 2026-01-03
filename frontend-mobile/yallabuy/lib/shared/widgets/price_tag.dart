// lib/shared/widgets/price_tag.dart
import 'package:flutter/material.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import '../utils/formatters.dart';

class PriceTag extends StatelessWidget {
  final int price;
  final int discountPercent;
  final double fontSize;

  const PriceTag({
    super.key,
    required this.price,
    this.discountPercent = 0,
    this.fontSize = 14,
  });

  @override
  Widget build(BuildContext context) {
    if (discountPercent > 0) {
      final finalPrice = price - (price * discountPercent ~/ 100);
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                Formatters.currencySP(finalPrice),
                style: TextStyle(
                  color: AppTokens.damascusRose,
                  fontWeight: FontWeight.bold,
                  fontSize: fontSize,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.red,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  Formatters.percent(discountPercent),
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: fontSize * 0.7,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          Text(
            Formatters.currencySP(price),
            style: TextStyle(
              decoration: TextDecoration.lineThrough,
              color: Colors.grey,
              fontSize: fontSize * 0.8,
            ),
          ),
        ],
      );
    }

    return Text(
      Formatters.currencySP(price),
      style: TextStyle(
        color: AppTokens.damascusRose,
        fontWeight: FontWeight.bold,
        fontSize: fontSize,
      ),
    );
  }
}
