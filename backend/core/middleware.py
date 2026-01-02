"""
Custom Middleware - Request/Response Processing
Middleware مخصص - معالجة الطلبات والاستجابات

This module contains custom middleware for:
- Request logging
- Error handling
- Response formatting
- Performance monitoring

هذا الوحدة يحتوي على middleware مخصص لـ:
- تسجيل الطلبات
- معالجة الأخطاء
- تنسيق الاستجابات
- مراقبة الأداء
"""

import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.http import JsonResponse
from django.conf import settings

logger = logging.getLogger(__name__)


# ============================================================================
# Proxy HTTPS Middleware
# Middleware للتعامل مع HTTPS خلف البروكسي
# ============================================================================

class ProxyHTTPSMiddleware(MiddlewareMixin):
    """
    Middleware to handle HTTPS behind proxy.
    Sets request._is_secure_override and wsgi.url_scheme when X-Forwarded-Proto is 'https'.
    Middleware للتعامل مع HTTPS خلف البروكسي.
    يضبط request._is_secure_override و wsgi.url_scheme عندما يكون X-Forwarded-Proto هو 'https'.
    """
    
    def process_request(self, request):
        """
        Set request security flags based on X-Forwarded-Proto header.
        ضبط علامات أمان الطلب بناءً على رأس X-Forwarded-Proto.
        """
        # Check if X-Forwarded-Proto header exists and is 'https'
        # التحقق من وجود رأس X-Forwarded-Proto وأنه 'https'
        forwarded_proto = request.META.get('HTTP_X_FORWARDED_PROTO', '').lower()
        if forwarded_proto == 'https':
            # Set is_secure override for Django's internal use
            # ضبط is_secure override للاستخدام الداخلي في Django
            request._is_secure_override = True
            # Also update wsgi.url_scheme for build_absolute_uri()
            # أيضاً تحديث wsgi.url_scheme لـ build_absolute_uri()
            request.META['wsgi.url_scheme'] = 'https'
        
        return None
    
    def process_response(self, request, response):
        """
        Process response (no changes needed).
        معالجة الاستجابة (لا حاجة لتغييرات).
        """
        return response


# ============================================================================
# Request Logging Middleware
# Middleware لتسجيل الطلبات
# ============================================================================


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Log all API requests for monitoring and debugging
    تسجيل جميع طلبات API للمراقبة والتشخيص
    
    Logs:
    - Request method and path
    - Response status code
    - Processing time
    - User information (if authenticated)
    """
    
    def process_request(self, request):
        """
        Store request start time
        تخزين وقت بداية الطلب
        """
        request._start_time = time.time()
        return None
    
    def process_response(self, request, response):
        """
        Log request and response information
        تسجيل معلومات الطلب والاستجابة
        """
        # Calculate processing time
        # حساب وقت المعالجة
        if hasattr(request, '_start_time'):
            duration = time.time() - request._start_time
        else:
            duration = 0
        
        # Log API requests only (skip static files, admin, etc.)
        # تسجيل طلبات API فقط (تخطي الملفات الثابتة، admin، إلخ)
        if request.path.startswith('/api/'):
            # Get user info if authenticated
            # الحصول على معلومات المستخدم إذا كان مسجلاً
            user_info = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_info = {
                    "id": request.user.id,
                    "email": request.user.email,
                    "role": request.user.role,
                }
            
            # Log request
            # تسجيل الطلب
            logger.info(
                f"API Request: {request.method} {request.path} | "
                f"Status: {response.status_code} | "
                f"Duration: {duration:.3f}s | "
                f"User: {user_info}"
            )
        
        return response


# ============================================================================
# Error Handling Middleware
# Middleware لمعالجة الأخطاء
# ============================================================================

class ErrorHandlingMiddleware(MiddlewareMixin):
    """
    Handle exceptions and return standardized error responses
    معالجة الاستثناءات وإرجاع استجابات خطأ موحدة
    
    Catches unhandled exceptions and returns JSON error response
    with standard format.
    """
    
    def process_exception(self, request, exception):
        """
        Handle exceptions and return standard error response
        معالجة الاستثناءات وإرجاع استجابة خطأ موحدة
        """
        # Log the exception
        # تسجيل الاستثناء
        logger.error(
            f"Unhandled exception: {exception} | "
            f"Path: {request.path} | "
            f"Method: {request.method}",
            exc_info=True
        )
        
        # Return standard error response for API requests
        # إرجاع استجابة خطأ موحدة لطلبات API
        if request.path.startswith('/api/'):
            return JsonResponse(
                {
                    "success": False,
                    "data": None,
                    "message": "An internal server error occurred. Please try again later.",
                    "errors": {
                        "detail": str(exception) if settings.DEBUG else "Internal server error"
                    }
                },
                status=500
            )
        
        # For non-API requests, let Django handle it
        # لطلبات غير API، دع Django يتعامل معها
        return None

