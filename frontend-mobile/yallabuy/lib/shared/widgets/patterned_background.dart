// lib/shared/widgets/patterned_background.dart
import 'package:flutter/material.dart';
import '../../app/theme/tokens.dart';

class PatternedBackground extends StatelessWidget {
  final Widget? child;
  final double opacity;

  const PatternedBackground({
    super.key, 
    this.child,
    this.opacity = 0.05,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: _MosaicPainter(
              color: AppTokens.primaryDamascusRose.withOpacity(opacity),
            ),
          ),
        ),
        if (child != null) Positioned.fill(child: child!),
      ],
    );
  }
}

class _MosaicPainter extends CustomPainter {
  final Color color;

  _MosaicPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    const double step = 60.0;

    for (double x = 0; x < size.width; x += step) {
      for (double y = 0; y < size.height; y += step) {
        if ((x + y) % (step * 2) == 0) {
           _drawMotif(canvas, x, y, step, paint);
        }
      }
    }
  }
  
  void _drawMotif(Canvas canvas, double x, double y, double size, Paint paint) {
    // Simple geometric motif drawing
    canvas.drawRect(Rect.fromLTWH(x + 10, y + 10, size - 20, size - 20), paint);
    canvas.drawLine(Offset(x, y), Offset(x + size, y + size), paint);
    canvas.drawLine(Offset(x + size, y), Offset(x, y + size), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
