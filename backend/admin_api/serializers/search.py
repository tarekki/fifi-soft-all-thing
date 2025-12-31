"""
Admin Search Serializers
مسلسلات البحث للإدارة
"""

from rest_framework import serializers

class AdminGlobalSearchResultSerializer(serializers.Serializer):
    """
    Serializer for a single search result
    مسلسل لنتيجة بحث واحدة
    """
    id = serializers.CharField()
    type = serializers.CharField() # 'product', 'order', 'user', 'vendor'
    title = serializers.CharField()
    subtitle = serializers.CharField(required=False, allow_blank=True)
    image = serializers.CharField(required=False, allow_null=True)
    url = serializers.CharField() # Frontend URL to navigate to
    status = serializers.CharField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(required=False)

class AdminGlobalSearchResponseSerializer(serializers.Serializer):
    """
    Serializer for the global search response
    مسلسل لرد البحث العالمي
    """
    results = AdminGlobalSearchResultSerializer(many=True)
    count = serializers.IntegerField()
