// lib/features/reviews/add_review_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:yallabuy/app/theme/tokens.dart';
import 'package:yallabuy/shared/providers/providers.dart';
import 'package:yallabuy/shared/widgets/interactive_rating_stars.dart';

class AddReviewScreen extends ConsumerStatefulWidget {
  final String productId;

  const AddReviewScreen({super.key, required this.productId});

  @override
  ConsumerState<AddReviewScreen> createState() => _AddReviewScreenState();
}

class _AddReviewScreenState extends ConsumerState<AddReviewScreen> {
  double _rating = 0;
  final _commentController = TextEditingController();
  bool _isSubmitting = false;

  void _submit() async {
    if (_rating == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('الرجاء تحديد التقييم')),
      );
      return;
    }
    if (_commentController.text.length < 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('التعليق يجب أن يكون 10 أحرف على الأقل')),
      );
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    try {
      ref.read(reviewRepositoryProvider).addReview(
        productId: widget.productId,
        userName: 'أنا', // TODO: Get from auth
        rating: _rating,
        comment: _commentController.text,
      );

      // Force refresh of the reviews list
      ref.invalidate(productReviewsProvider(widget.productId));
      // Refresh my reviews (since I just added one)
      ref.invalidate(myReviewsProvider);
      // Refresh aggregation
      ref.invalidate(productRatingStatsProvider(widget.productId));

      if (mounted) {
        context.pop(); // Close sheet
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('شكراً! تم إرسال تقييمك'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('حدث خطأ: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'قيّم هذا المنتج',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          Center(
            child: InteractiveRatingStars(
              rating: _rating,
              size: 40,
              onRatingChanged: (val) {
                setState(() {
                  _rating = val;
                });
              },
            ),
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _commentController,
            decoration: const InputDecoration(
              labelText: 'اكتب تعليقك هنا',
              border: OutlineInputBorder(),
              hintText: 'ما رأيك في المنتج؟',
            ),
            maxLines: 4,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _isSubmitting ? null : _submit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTokens.damascusRose,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.all(16),
            ),
            child: _isSubmitting 
                ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                : const Text('إرسال التقييم'),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}
