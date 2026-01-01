"""
Vendor Application Views
عروض طلب انضمام البائع

هذا الملف يحتوي على views لطلب انضمام البائعين.
This file contains views for vendor applications.
"""

from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.utils.translation import gettext_lazy as _
from drf_spectacular.utils import extend_schema, OpenApiResponse

from vendor_api.serializers.application import VendorApplicationSerializer
from vendor_api.throttling import VendorUserRateThrottle
from core.utils import success_response, error_response
from vendors.models import VendorApplication


# =============================================================================
# Vendor Application View (Public)
# عرض طلب انضمام البائع (عام)
# =============================================================================

class VendorApplicationView(APIView):
    """
    Public endpoint for submitting vendor applications.
    نقطة نهاية عامة لتقديم طلبات انضمام البائعين.
    
    This endpoint allows:
    - Authenticated users to submit applications (linked to their account)
    - Unauthenticated users to submit applications (no account link)
    
    Security:
    - Rate limiting (throttling)
    - Validates store name uniqueness
    - Validates email format
    - Prevents duplicate applications
    
    هذه النقطة تسمح بـ:
    - المستخدمين المسجلين بتقديم طلبات (مرتبطة بحسابهم)
    - المستخدمين غير المسجلين بتقديم طلبات (بدون ربط حساب)
    
    الأمان:
    - تحديد معدل الطلبات (throttling)
    - التحقق من تفرد اسم المتجر
    - التحقق من صيغة البريد الإلكتروني
    - منع الطلبات المكررة
    """
    
    permission_classes = [AllowAny]  # Public endpoint
    throttle_classes = [VendorUserRateThrottle]
    parser_classes = [MultiPartParser, FormParser, JSONParser]  # Support file uploads
    
    @extend_schema(
        summary='Submit Vendor Application',
        description='Submit a new vendor application (public endpoint)',
        request=VendorApplicationSerializer,
        responses={
            201: OpenApiResponse(
                description='Application submitted successfully',
                response=VendorApplicationSerializer
            ),
            400: OpenApiResponse(description='Invalid data or validation error'),
            429: OpenApiResponse(description='Too many requests'),
        },
        tags=['Vendor Applications'],
    )
    def post(self, request):
        """
        Submit vendor application.
        تقديم طلب انضمام بائع.
        
        Request Body:
            - applicant_name: Applicant full name
            - applicant_email: Applicant email
            - applicant_phone: Applicant phone
            - store_name: Proposed store name
            - store_description: Store description (optional)
            - store_logo: Store logo image (optional)
            - business_type: Business type (individual/company/brand/other)
            - business_address: Business address (optional)
            - business_license: Business license document (optional)
        
        Returns:
            Application data with status 'pending'
        """
        serializer = VendorApplicationSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            # Log validation errors (for monitoring)
            # تسجيل أخطاء التحقق (للمراقبة)
            logger.warning(f'Vendor application validation failed: {serializer.errors}')
            
            return error_response(
                message=_('بيانات غير صالحة / Invalid data'),
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Create application
        # إنشاء الطلب
        try:
            application = serializer.save()
            
            # Log successful application submission
            # تسجيل تقديم الطلب الناجح
            applicant_email = application.applicant_email
            store_name = application.store_name
            user_info = f" (User: {request.user.email})" if request.user.is_authenticated else " (Guest)"
            logger.info(f'Vendor application submitted: {store_name} by {applicant_email}{user_info}')
            
        except Exception as e:
            # Log creation errors
            # تسجيل أخطاء الإنشاء
            logger.error(f'Error creating vendor application: {str(e)}', exc_info=True)
            
            return error_response(
                message=_('حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى / An error occurred while creating the application. Please try again'),
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Return application data
        # إرجاع بيانات الطلب
        return success_response(
            data={
                'id': application.id,
                'store_name': application.store_name,
                'applicant_name': application.applicant_name,
                'applicant_email': application.applicant_email,
                'status': application.status,
                'created_at': application.created_at.isoformat(),
                'message': _('تم تقديم طلب الانضمام بنجاح. سيتم مراجعته من قبل الإدارة / Application submitted successfully. It will be reviewed by the administration')
            },
            message=_('تم تقديم طلب الانضمام بنجاح / Application submitted successfully'),
            status_code=status.HTTP_201_CREATED
        )

