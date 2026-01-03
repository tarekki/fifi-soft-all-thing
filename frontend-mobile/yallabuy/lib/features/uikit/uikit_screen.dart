// lib/features/uikit/uikit_screen.dart
import 'package:flutter/material.dart';
import '../../app/theme/tokens.dart';
import '../../shared/widgets/brand_logo.dart';
import '../../shared/widgets/patterned_background.dart';

class UIKitScreen extends StatelessWidget {
  const UIKitScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return PatternedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(title: const Text('UI Kit Component Gallery')),
        body: ListView(
          padding: const EdgeInsets.all(AppTokens.s24),
          children: [
            const _SectionHeader('Typography'),
            Text('Display Large', style: Theme.of(context).textTheme.displayLarge),
            Text('Headline Medium', style: Theme.of(context).textTheme.headlineMedium),
            Text('Body Large', style: Theme.of(context).textTheme.bodyLarge),
            Text('Label Small', style: Theme.of(context).textTheme.labelSmall),
            
            const SizedBox(height: AppTokens.s24),
            const _SectionHeader('Colors'),
            _ColorRow('Primary', AppTokens.primaryDamascusRose),
            _ColorRow('Secondary', AppTokens.secondaryAleppoOlive),
            _ColorRow('Teal', AppTokens.accentMosaicTeal),
            _ColorRow('Gold', AppTokens.brassGold),
            
            const SizedBox(height: AppTokens.s24),
            const _SectionHeader('Branding'),
            const Center(child: BrandLogo()),
            
            const SizedBox(height: AppTokens.s24),
            const _SectionHeader('Buttons'),
            ElevatedButton(onPressed: () {}, child: const Text('Primary Action')),
            const SizedBox(height: 8),
            const FilledButton(onPressed: null, child: Text('Disabled Action')),
            const SizedBox(height: 8),
            OutlinedButton(onPressed: () {}, child: const Text('Secondary Action')),
            
             const SizedBox(height: AppTokens.s24),
            const _SectionHeader('Inputs'),
            const TextField(decoration: InputDecoration(labelText: 'Email Address')),
            const SizedBox(height: 8),
            const TextField(decoration: InputDecoration(labelText: 'Password', suffixIcon: Icon(Icons.visibility))),
            
            const SizedBox(height: AppTokens.s24),
            const _SectionHeader('Cards'),
            const Card(
              child: ListTile(
                leading: Icon(Icons.shopping_bag_outlined),
                title: Text('Product Card'),
                subtitle: Text('Details go here'),
                trailing: Icon(Icons.arrow_forward_ios, size: 16),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppTokens.s12),
      child: Text(
        title,
        style: Theme.of(context).textTheme.titleMedium?.copyWith(
          color: AppTokens.secondaryAleppoOlive,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

class _ColorRow extends StatelessWidget {
  final String name;
  final Color color;
  const _ColorRow(this.name, this.color);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(8)),
          ),
          const SizedBox(width: 16),
          Text(name, style: const TextStyle(fontWeight: FontWeight.bold)),
          const Spacer(),
          Text(color.value.toRadixString(16).toUpperCase()),
        ],
      ),
    );
  }
}
