// lib/shared/widgets/brand_logo.dart
import 'package:flutter/material.dart';
import '../../app/theme/tokens.dart';
import '../../app/localization/l10n.dart';

class BrandLogo extends StatelessWidget {
  final bool animate;
  final double size;

  const BrandLogo({
    super.key, 
    this.animate = false,
    this.size = 1.0, 
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
             Text(
              'YallaBuy',
              style: TextStyle(
                fontFamily: 'Roboto', // Or custom font
                fontSize: 48 * size,
                fontWeight: FontWeight.w900,
                color: AppTokens.primaryDamascusRose,
                letterSpacing: -1.0,
              ),
            ),
            Container(
              width: 12 * size,
              height: 12 * size,
              margin: EdgeInsets.symmetric(horizontal: 4 * size),
              decoration: const BoxDecoration(
                color: AppTokens.accentMosaicTeal,
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
        if (size > 0.6) ...[
          SizedBox(height: AppTokens.s8 * size),
          Text(
            Strings.appName, // "يلا باي"
            style: TextStyle(
              fontSize: 24 * size,
              fontWeight: FontWeight.bold,
              color: AppTokens.textBasalt,
            ),
          ),
        ]
      ],
    );
  }
}
