# Order API - Future Modifications for Inventory Sync
# API الطلبات - التعديلات المستقبلية لـ Inventory Sync

## Overview
## نظرة عامة

This document details the modifications that will be needed when the Inventory Sync system is implemented.

هذا المستند يوضح التعديلات التي ستكون مطلوبة عند تنفيذ نظام Inventory Sync.

---

## Current Implementation (Without Inventory Sync)
## التنفيذ الحالي (بدون Inventory Sync)

### What Works Now:
### ما يعمل الآن:

1. ✅ **Order Creation** - Users can create orders
2. ✅ **Order Listing** - Filtered by user role
3. ✅ **Order Details** - Full order information
4. ✅ **Status Management** - Vendors/Admins can update status
5. ✅ **Commission Calculation** - Automatic 10% commission
6. ✅ **Guest Orders** - Support for unauthenticated users

### What's Missing (Will be added with Inventory Sync):
### ما هو مفقود (سيُضاف مع Inventory Sync):

1. ❌ **Automatic Stock Reduction** - Stock is not reduced when order is created
2. ❌ **Stock Validation** - No check if sufficient stock exists
3. ❌ **Real-time Stock Sync** - Stock quantities are not synced from accounting system
4. ❌ **Stock Reservation** - No temporary stock reservation during checkout

---

## Required Modifications for Inventory Sync
## التعديلات المطلوبة لـ Inventory Sync

### 1. Order Creation API (`OrderCreateSerializer.create()`)
### 1. API إنشاء الطلب

**Current Code Location:**
`backend/orders/serializers.py` - `OrderCreateSerializer.create()`

**Current Implementation:**
```python
# Create order item
OrderItem.objects.create(
    order=order,
    product_variant=variant,
    quantity=quantity,
    price=price,
)

# TODO: When Inventory Sync is implemented, reduce stock here:
# variant.stock_quantity -= quantity
# variant.save()
```

**Required Modifications:**

#### A. Add Stock Validation Before Order Creation
#### أ. إضافة التحقق من المخزون قبل إنشاء الطلب

```python
# In OrderCreateSerializer.validate() method
# في طريقة OrderCreateSerializer.validate()

# Check stock availability for each item
# التحقق من توفر المخزون لكل عنصر
for item_data in data['items']:
    variant = ProductVariant.objects.get(id=item_data['variant_id'])
    quantity = item_data['quantity']
    
    # NEW: Check if sufficient stock exists
    # جديد: التحقق من وجود مخزون كافٍ
    if variant.stock_quantity < quantity:
        raise serializers.ValidationError(
            f"Insufficient stock for {variant}. Available: {variant.stock_quantity}, Requested: {quantity}"
        )
```

#### B. Add Stock Reduction in Order Creation
#### ب. إضافة تقليل المخزون في إنشاء الطلب

```python
# In OrderCreateSerializer.create() method
# في طريقة OrderCreateSerializer.create()

for item_data in items_data:
    variant = ProductVariant.objects.get(id=item_data['variant_id'])
    quantity = item_data['quantity']
    price = variant.final_price
    
    # Create order item
    OrderItem.objects.create(...)
    
    # NEW: Reduce stock quantity
    # جديد: تقليل كمية المخزون
    variant.stock_quantity -= quantity
    
    # NEW: Mark as unavailable if stock reaches zero
    # جديد: وضع علامة غير متاح إذا وصل المخزون إلى الصفر
    if variant.stock_quantity == 0:
        variant.is_available = False
    
    variant.save()
```

#### C. Add Stock Reservation (Optional - for better UX)
#### ج. إضافة حجز المخزون (اختياري - لتحسين تجربة المستخدم)

```python
# NEW: Reserve stock during checkout process
# جديد: حجز المخزون أثناء عملية الدفع

# Step 1: Reserve stock (with expiration time)
# الخطوة 1: حجز المخزون (مع وقت انتهاء)
# This prevents other users from buying the same item
# هذا يمنع المستخدمين الآخرين من شراء نفس العنصر

# Step 2: When order is confirmed, reduce stock
# الخطوة 2: عند تأكيد الطلب، تقليل المخزون

# Step 3: If order is cancelled, release reserved stock
# الخطوة 3: إذا تم إلغاء الطلب، إطلاق المخزون المحجوز
```

---

### 2. Order Cancellation API
### 2. API إلغاء الطلب

**Current Status:** Not implemented (orders can be cancelled via status update)

**Required Implementation:**

```python
# NEW: Add order cancellation endpoint
# جديد: إضافة endpoint لإلغاء الطلب

@action(detail=True, methods=['post'])
def cancel(self, request, pk=None):
    """
    Cancel order and restore stock
    إلغاء الطلب واستعادة المخzون
    """
    order = self.get_object()
    
    # Check if order can be cancelled
    # التحقق من إذا كان يمكن إلغاء الطلب
    if order.status in ['delivered', 'cancelled']:
        return error_response(
            message='Cannot cancel a delivered or already cancelled order.',
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    # Restore stock for each item
    # استعادة المخزون لكل عنصر
    for item in order.items.all():
        variant = item.product_variant
        variant.stock_quantity += item.quantity
        
        # Mark as available if stock is restored
        # وضع علامة متاح إذا تم استعادة المخزون
        if variant.stock_quantity > 0:
            variant.is_available = True
        
        variant.save()
    
    # Update order status
    # تحديث حالة الطلب
    order.status = 'cancelled'
    order.save()
    
    return success_response(
        data=OrderSerializer(order).data,
        message='Order cancelled and stock restored.',
        status_code=status.HTTP_200_OK
    )
```

---

### 3. Stock Sync Integration
### 3. تكامل مزامنة المخزون

**Current Status:** Stock is managed manually in Django Admin

**Required Implementation:**

#### A. Create Stock Sync Service
#### أ. إنشاء خدمة مزامنة المخزون

```python
# NEW: backend/orders/services.py
# جديد: backend/orders/services.py

class StockSyncService:
    """
    Service for syncing stock from accounting systems
    خدمة لمزامنة المخزون من الأنظمة المحاسبية
    """
    
    @staticmethod
    def sync_stock_from_accounting_system(vendor_id):
        """
        Sync stock quantities from vendor's accounting system
        مزامنة كميات المخزون من النظام المحاسبي للبائع
        
        This will be implemented when accounting system adapters are ready
        سيتم تنفيذ هذا عندما تكون محولات النظام المحاسبي جاهزة
        """
        # TODO: Implement SQL adapter pattern
        # TODO: Connect to vendor's accounting database
        # TODO: Update ProductVariant.stock_quantity from accounting system
        pass
```

#### B. Add Scheduled Stock Sync
#### ب. إضافة مزامنة مخزون مجدولة

```python
# NEW: Use Celery or Django management command
# جديد: استخدام Celery أو Django management command

# Sync stock every X minutes/hours
# مزامنة المخزون كل X دقائق/ساعات

# This ensures stock quantities are always up-to-date
# هذا يضمن أن كميات المخزون دائماً محدثة
```

---

### 4. Order Status Update - Stock Impact
### 4. تحديث حالة الطلب - تأثير المخزون

**Current Implementation:**
- Status can be updated by vendors/admins
- No stock impact when status changes

**Required Modifications:**

```python
# In OrderViewSet.update_status() method
# في طريقة OrderViewSet.update_status()

def update_status(self, request, pk=None):
    order = self.get_object()
    old_status = order.status
    new_status = request.data.get('status')
    
    # ... existing validation ...
    
    # NEW: Handle stock when status changes
    # جديد: التعامل مع المخزون عند تغيير الحالة
    
    # If order is cancelled, restore stock
    # إذا تم إلغاء الطلب، استعادة المخزون
    if new_status == 'cancelled' and old_status != 'cancelled':
        for item in order.items.all():
            variant = item.product_variant
            variant.stock_quantity += item.quantity
            if variant.stock_quantity > 0:
                variant.is_available = True
            variant.save()
    
    # If order moves from cancelled to active, reduce stock again
    # إذا انتقل الطلب من ملغى إلى نشط، تقليل المخزون مرة أخرى
    if old_status == 'cancelled' and new_status != 'cancelled':
        for item in order.items.all():
            variant = item.product_variant
            if variant.stock_quantity < item.quantity:
                return error_response(
                    message=f'Insufficient stock for {variant}. Cannot reactivate order.',
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            variant.stock_quantity -= item.quantity
            if variant.stock_quantity == 0:
                variant.is_available = False
            variant.save()
    
    serializer.save()
    return success_response(...)
```

---

### 5. Product Variant Model Updates
### 5. تحديثات نموذج Product Variant

**Current Implementation:**
- `stock_quantity` field exists
- Stock is managed manually

**Required Modifications:**

#### A. Add Stock Sync Fields
#### أ. إضافة حقول مزامنة المخزون

```python
# In ProductVariant model
# في نموذج ProductVariant

# NEW: Add fields for stock sync tracking
# جديد: إضافة حقول لتتبع مزامنة المخزون

last_synced_at = models.DateTimeField(
    null=True,
    blank=True,
    help_text='Last time stock was synced from accounting system'
)

sync_source = models.CharField(
    max_length=50,
    blank=True,
    help_text='Source of stock sync (e.g., "fifi_accounting", "soft_accounting")'
)

is_auto_synced = models.BooleanField(
    default=False,
    help_text='True if stock is automatically synced from accounting system'
)
```

#### B. Add Stock History (Optional)
#### ب. إضافة تاريخ المخزون (اختياري)

```python
# NEW: Track stock changes for auditing
# جديد: تتبع تغييرات المخزون للمراجعة

class StockHistory(models.Model):
    """
    Track stock quantity changes
    تتبع تغييرات كمية المخزون
    """
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    old_quantity = models.PositiveIntegerField()
    new_quantity = models.PositiveIntegerField()
    change_reason = models.CharField(max_length=100)  # 'order', 'sync', 'manual', etc.
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## Migration Strategy
## استراتيجية الهجرة

### Phase 1: Prepare for Sync (Current)
### المرحلة 1: التحضير للمزامنة (الحالي)

- ✅ Order APIs work without stock validation
- ✅ Stock can be managed manually
- ✅ Orders can be created and managed

### Phase 2: Add Stock Validation (When Sync is Ready)
### المرحلة 2: إضافة التحقق من المخزون (عندما تكون المزامنة جاهزة)

1. Add stock validation in `OrderCreateSerializer.validate()`
2. Add stock reduction in `OrderCreateSerializer.create()`
3. Add stock restoration in order cancellation
4. Add stock sync service
5. Add scheduled sync tasks

### Phase 3: Full Integration (Future)
### المرحلة 3: التكامل الكامل (المستقبل)

1. Real-time stock sync from accounting systems
2. Stock reservation during checkout
3. Stock history tracking
4. Automated stock alerts

---

## Testing Checklist for Future Modifications
## قائمة التحقق من الاختبار للتعديلات المستقبلية

When implementing Inventory Sync, test:

1. ✅ Order creation with sufficient stock
2. ✅ Order creation with insufficient stock (should fail)
3. ✅ Stock reduction when order is created
4. ✅ Stock restoration when order is cancelled
5. ✅ Stock sync from accounting system
6. ✅ Concurrent orders (race conditions)
7. ✅ Order status changes and stock impact

---

## Files That Will Need Modification
## الملفات التي ستحتاج تعديل

1. `backend/orders/serializers.py`
   - `OrderCreateSerializer.validate()` - Add stock validation
   - `OrderCreateSerializer.create()` - Add stock reduction

2. `backend/orders/views.py`
   - `OrderViewSet.update_status()` - Add stock restoration on cancel
   - `OrderViewSet.cancel()` - New method for order cancellation

3. `backend/products/models.py`
   - `ProductVariant` - Add sync tracking fields

4. `backend/orders/services.py` (NEW)
   - Stock sync service implementation

5. `backend/orders/models.py` (Optional)
   - `StockHistory` model for tracking

---

## Summary
## الملخص

**Current State:**
- Order APIs work without automatic stock management
- Stock must be managed manually
- Orders can be created regardless of stock quantity

**Future State (After Inventory Sync):**
- Automatic stock validation before order creation
- Automatic stock reduction when order is created
- Automatic stock restoration when order is cancelled
- Real-time stock sync from accounting systems
- Stock history tracking

**Migration Path:**
1. Current implementation (manual stock) ✅
2. Add stock validation and reduction (when sync is ready)
3. Add stock sync service (when adapters are ready)
4. Full integration with accounting systems

