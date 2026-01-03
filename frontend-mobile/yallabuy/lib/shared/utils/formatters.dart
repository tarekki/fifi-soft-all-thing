// lib/shared/utils/formatters.dart
import 'package:intl/intl.dart';

class Formatters {
  static String currencySP(int value) {
    final fmt = NumberFormat.decimalPattern('en');
    return '${fmt.format(value)} ل.س';
  }

  static String percent(int p) {
    return '%$p';
  }

  static String dateShort(DateTime dt) {
    return DateFormat('dd/MM/yyyy').format(dt);
  }
}
