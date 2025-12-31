"""
Admin Global Search View
واجهة البحث العالمي للإدارة
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from products.models import Product
from orders.models import Order
from users.models import User
from vendors.models import Vendor
from admin_api.serializers.search import AdminGlobalSearchResponseSerializer
from admin_api.permissions import IsAdminUser

class AdminGlobalSearchView(APIView):
    """
    Global search for the Admin Dashboard
    البحث العالمي للوحة تحكم المسؤول
    
    Searches across Products, Orders, Users, and Vendors.
    يبحث في المنتجات، والطلبات، والمستخدمين، والبائعين.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response({"results": [], "count": 0})

        results = []

        # 1. Search Products
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(slug__icontains=query) | Q(description__icontains=query)
        ).select_related('vendor').prefetch_related('variants')[:5]
        
        for p in products:
            variant = p.variants.first()
            results.append({
                "id": str(p.id),
                "type": "product",
                "title": p.name,
                "subtitle": f"Vendor: {p.vendor.name} | Base Price: {p.base_price}",
                "image": variant.image.url if variant and variant.image else None,
                "url": f"/admin/products/{p.id}",
                "status": "active" if p.is_active else "inactive",
                "created_at": p.created_at
            })

        # 2. Search Orders
        orders = Order.objects.filter(
            Q(order_number__icontains=query) | Q(customer_name__icontains=query) | Q(customer_phone__icontains=query)
        ).select_related('user')[:5]
        
        for o in orders:
            results.append({
                "id": str(o.id),
                "type": "order",
                "title": f"Order {o.order_number}",
                "subtitle": f"Customer: {o.customer_name} | Total: {o.total}",
                "url": f"/admin/orders/{o.id}",
                "status": o.status,
                "created_at": o.created_at
            })

        # 3. Search Users
        users = User.objects.filter(
            Q(full_name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query)
        )[:5]
        
        for u in users:
            results.append({
                "id": str(u.id),
                "type": "user",
                "title": u.full_name or u.email,
                "subtitle": f"Email: {u.email} | Phone: {u.phone}",
                "url": f"/admin/users/{u.id}",
                "status": "active" if u.is_active else "inactive",
                "created_at": u.created_at
            })

        # 4. Search Vendors
        vendors = Vendor.objects.filter(
            Q(name__icontains=query) | Q(email__icontains=query) | Q(phone__icontains=query)
        )[:5]
        
        for v in vendors:
            results.append({
                "id": str(v.id),
                "type": "vendor",
                "title": v.name,
                "subtitle": f"Email: {v.email} | Phone: {v.phone}",
                "url": f"/admin/vendors/{v.id}",
                "status": v.status,
                "created_at": v.created_at
            })

        serializer = AdminGlobalSearchResponseSerializer({"results": results, "count": len(results)})
        return Response(serializer.data)
