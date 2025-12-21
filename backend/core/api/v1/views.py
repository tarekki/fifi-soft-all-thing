"""
API v1 Views
عروض API الإصدار الأول

This module provides views for API v1 endpoints.
هذا الوحدة يوفر عروض لـ endpoints API الإصدار الأول.
"""

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt


# ============================================================================
# API v1 Home View
# عرض الصفحة الرئيسية لـ API v1
# ============================================================================

@require_http_methods(["GET"])
def api_v1_home(request):
    """
    API v1 Home Endpoint
    نقطة نهاية الصفحة الرئيسية لـ API v1
    
    Returns information about API v1 endpoints
    إرجاع معلومات عن endpoints API v1
    """
    return JsonResponse({
        "success": True,
        "message": "Welcome to Trendyol-SY API v1",
        "data": {
            "version": "1.0.0",
            "description": "Multi-vendor e-commerce platform API for Syrian market",
            "endpoints": {
                "auth": {
                    "register": "/api/v1/auth/register/",
                    "login": "/api/v1/auth/login/",
                    "refresh": "/api/v1/auth/refresh/",
                    "verify_email": "/api/v1/auth/verify-email/",
                    "resend_verification": "/api/v1/auth/resend-verification/",
                },
                "users": {
                    "profile": "/api/v1/users/profile/",
                    "change_password": "/api/v1/users/profile/change_password/",
                },
                "vendors": {
                    "list": "/api/v1/vendors/",
                    "detail": "/api/v1/vendors/{id}/",
                },
                "products": {
                    "list": "/api/v1/products/",
                    "detail": "/api/v1/products/{id}/",
                    "variants": "/api/v1/products/{id}/variants/",
                },
            },
            "documentation": {
                "swagger_ui": "/api/schema/swagger-ui/",
                "redoc": "/api/schema/redoc/",
                "schema": "/api/schema/",
            },
            "note": "All endpoints use standard response format: {success, data, message, errors}"
        },
        "errors": None
    })

