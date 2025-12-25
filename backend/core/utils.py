"""
Core Utilities - Shared Helper Functions
أدوات أساسية - دوال مساعدة مشتركة

This module contains utility functions used across the application.
هذا الوحدة يحتوي على دوال مساعدة مستخدمة في جميع أنحاء التطبيق.
"""

from rest_framework.response import Response
from rest_framework import status


# ============================================================================
# Standard API Response Wrapper
# غلاف استجابة API موحد
# ============================================================================

def success_response(data=None, message="Success", status_code=status.HTTP_200_OK):
    """
    Create a standard success response
    إنشاء استجابة نجاح موحدة
    
    Args:
        data: Response data (dict, list, or any serializable object)
        message: Success message (string)
        status_code: HTTP status code (default: 200)
    
    Returns:
        Response object with standard format
    
    Example:
        return success_response(
            data={"user": user_data},
            message="User created successfully",
            status_code=201
        )
    """
    return Response(
        {
            "success": True,
            "data": data,
            "message": message,
            "errors": None,
        },
        status=status_code
    )


def error_response(message="An error occurred", errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """
    Create a standard error response
    إنشاء استجابة خطأ موحدة
    
    Args:
        message: Error message (string)
        errors: Detailed error information (dict, list, or None)
        status_code: HTTP status code (default: 400)
    
    Returns:
        Response object with standard format
    
    Example:
        return error_response(
            message="Validation failed",
            errors={"email": ["This field is required."]},
            status_code=400
        )
    """
    # Convert ErrorDetail objects to strings for JSON serialization
    # تحويل كائنات ErrorDetail إلى strings للـ JSON serialization
    if errors:
        def convert_error_detail(obj):
            if isinstance(obj, dict):
                return {key: convert_error_detail(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_error_detail(item) for item in obj]
            elif hasattr(obj, 'string'):
                # DRF ErrorDetail object
                return str(obj)
            else:
                return obj
        
        errors = convert_error_detail(errors)
    
    return Response(
        {
            "success": False,
            "data": None,
            "message": message,
            "errors": errors,
        },
        status=status_code
    )

