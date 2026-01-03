// lib/app/router/app_router.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/auth/auth_shell_screen.dart';
import '../../features/location/location_selector_screen.dart';
import '../../features/uikit/uikit_screen.dart';
import '../../shared/widgets/app_scaffold_customer.dart';
import '../../shared/widgets/app_scaffold_vendor.dart';

// Customer Screens
import '../../features/home/home_screen.dart';
import '../../features/catalog/categories_screen.dart';
import '../../features/cart/cart_screen.dart';
import '../../features/checkout/checkout_screen.dart';
import '../../features/checkout/order_success_screen.dart';
import '../../features/orders/orders_screen.dart';
import '../../features/product/product_details_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/favorites/favorites_controller.dart'; // Just ensuring imports
import '../../features/favorites/favorites_screen.dart';
import '../../features/addresses/addresses_screen.dart';
import '../../features/addresses/edit_address_screen.dart';
import '../../shared/models/address.dart';
import '../../features/reviews/product_reviews_screen.dart';
import '../../features/reviews/my_reviews_screen.dart';

// Vendor Screens
import '../../features/vendor/dashboard/vendor_dashboard_screen.dart';
import '../../features/vendor/reviews/vendor_reviews_screen.dart';
import '../../features/vendor/orders/vendor_orders_screen.dart';
import '../../features/vendor/orders/vendor_orders_screen.dart';
import '../../features/vendor/orders/vendor_order_details_screen.dart';
import '../../features/vendor/products/vendor_products_screen.dart';
import '../../features/vendor/products/edit_product_screen.dart';
import '../../features/vendor/profile/vendor_profile_screen.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final GlobalKey<NavigatorState> _customerShellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'customerShell');
final GlobalKey<NavigatorState> _vendorShellNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'vendorShell');

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    GoRoute(
      path: '/splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/auth',
      builder: (context, state) => const AuthShellScreen(),
    ),
    GoRoute(
      path: '/location',
      builder: (context, state) => const LocationSelectorScreen(),
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/uikit',
      builder: (context, state) => const UIKitScreen(),
    ),
    
    GoRoute(
      path: '/product/:id',
      pageBuilder: (context, state) {
        final id = state.pathParameters['id']!;
        final extra = state.extra as Map<String, dynamic>?;
        final heroTag = extra?['heroTag'] as String?;
        return _buildPage(context, state, ProductDetailsScreen(productId: id, heroTag: heroTag));
      },
      routes: [
        GoRoute(
          path: 'reviews',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return ProductReviewsScreen(productId: id);
          },
        ),
      ],
    ),
    
    // Customer Shell
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return AppScaffoldCustomer(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          navigatorKey: _customerShellNavigatorKey,
          routes: [
            GoRoute(
              path: '/c/home', // Base path for this branch
              pageBuilder: (context, state) => _buildPage(context, state, const HomeScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/c/categories',
               pageBuilder: (context, state) => _buildPage(context, state, const CategoriesScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/c/cart',
              pageBuilder: (context, state) => _buildPage(context, state, const CartScreen()),
            ),
            GoRoute(
              path: '/c/checkout',
              pageBuilder: (context, state) => _buildPage(context, state, const CheckoutScreen()),
            ),
            GoRoute(
              path: '/c/order_success/:id',
              pageBuilder: (context, state) {
                final id = state.pathParameters['id']!;
                 return _buildPage(context, state, OrderSuccessScreen(orderId: id));
              },
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/c/orders',
              pageBuilder: (context, state) => _buildPage(context, state, const OrdersScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/c/profile',
              pageBuilder: (context, state) => _buildPage(context, state, const ProfileScreen()),
            ),
            GoRoute(
              path: '/c/notifications',
              pageBuilder: (context, state) => _buildPage(context, state, const NotificationsScreen()),
            ),
            GoRoute(
              path: '/c/favorites',
              pageBuilder: (context, state) => _buildPage(context, state, const FavoritesScreen()),
            ),
            GoRoute(
              path: '/c/addresses',
              pageBuilder: (context, state) => _buildPage(context, state, const AddressesScreen()),
            ),
            GoRoute(
              path: '/c/address/new',
              pageBuilder: (context, state) => _buildPage(context, state, const EditAddressScreen()),
            ),
            GoRoute(
              path: '/c/address/:id/edit',
              pageBuilder: (context, state) {
                 final address = state.extra as Address?;
                 return _buildPage(context, state, EditAddressScreen(addressToEdit: address));
              },
            ),
            GoRoute(
              path: '/c/my-reviews',
              pageBuilder: (context, state) => _buildPage(context, state, const MyReviewsScreen()),
            ),
          ],
        ),
      ],
    ),
    
    // Vendor Shell
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return AppScaffoldVendor(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          navigatorKey: _vendorShellNavigatorKey,
          routes: [
            GoRoute(
              path: '/v/dashboard',
              pageBuilder: (context, state) => _buildPage(context, state, const VendorDashboardScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/v/orders',
              pageBuilder: (context, state) => _buildPage(context, state, const VendorOrdersScreen()),
            ),
            GoRoute(
              path: '/v/orders/:id',
              pageBuilder: (context, state) {
                final id = state.pathParameters['id']!;
                return _buildPage(context, state, VendorOrderDetailsScreen(orderId: id));
              },
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/v/products',
              pageBuilder: (context, state) => _buildPage(context, state, const VendorProductsScreen()),
            ),
             GoRoute(
              path: '/v/product/new',
              pageBuilder: (context, state) => _buildPage(context, state, const EditProductScreen()),
            ),
             GoRoute(
              path: '/v/product/:id/edit',
              pageBuilder: (context, state) {
                final id = state.pathParameters['id']!;
                 return _buildPage(context, state, EditProductScreen(productId: id));
              },
            ),
            GoRoute(
              path: '/v/reviews',
              pageBuilder: (context, state) => _buildPage(context, state, const VendorReviewsScreen()),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: '/v/profile',
              pageBuilder: (context, state) => _buildPage(context, state, const VendorProfileScreen()),
            ),
          ],
        ),
      ],
    ),
  ],
);

// Custom Transition Page (Fade + Slight Slide)
CustomTransitionPage _buildPage(BuildContext context, GoRouterState state, Widget child) {
  return CustomTransitionPage(
    key: state.pageKey,
    child: child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: CurveTween(curve: Curves.easeIn).animate(animation),
        child: SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0.05, 0), // Slight slide from right
            end: Offset.zero,
          ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOut)),
          child: child,
        ),
      );
    },
    transitionDuration: const Duration(milliseconds: 300),
  );
}
