// lib/shared/mock/mock_images.dart
class MockImages {
  static String pic(int seed, {int size = 800}) {
    return "https://picsum.photos/seed/$seed/$size/$size";
  }
}
