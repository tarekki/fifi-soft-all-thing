# Generated migration for adding vendor fields to Order and OrderItem
# Migration شاملة لإضافة حقول vendor إلى Order و OrderItem

import django.db.models.deletion
from django.db import migrations, models


def populate_vendor_fields(apps, schema_editor):
    """
    Populate vendor fields for existing Order and OrderItem records
    ملء حقول vendor للطلبات والعناصر الموجودة
    
    Strategy:
    - OrderItem.vendor: from order_item → product_variant → product → vendor
    - Order.vendor: from first OrderItem of the order
    """
    Order = apps.get_model('orders', 'Order')
    OrderItem = apps.get_model('orders', 'OrderItem')
    ProductVariant = apps.get_model('products', 'ProductVariant')
    Product = apps.get_model('products', 'Product')
    
    # Step 1: Populate OrderItem.vendor
    # الخطوة 1: ملء OrderItem.vendor
    print("Populating OrderItem.vendor fields...")
    order_items_updated = 0
    order_items_without_vendor = 0
    
    for order_item in OrderItem.objects.all():
        try:
            # Get vendor through: product_variant → product → vendor
            # الحصول على vendor من خلال: product_variant → product → vendor
            if not order_item.product_variant_id:
                order_items_without_vendor += 1
                print(f"Warning: OrderItem {order_item.id} has no product_variant_id")
                continue
            
            # Get product from variant
            try:
                product_variant = ProductVariant.objects.get(id=order_item.product_variant_id)
            except ProductVariant.DoesNotExist:
                order_items_without_vendor += 1
                print(f"Warning: ProductVariant {order_item.product_variant_id} does not exist")
                continue
            
            if not product_variant.product_id:
                order_items_without_vendor += 1
                print(f"Warning: ProductVariant {product_variant.id} has no product_id")
                continue
            
            # Get product
            try:
                product = Product.objects.get(id=product_variant.product_id)
            except Product.DoesNotExist:
                order_items_without_vendor += 1
                print(f"Warning: Product {product_variant.product_id} does not exist")
                continue
            
            # Get vendor from product
            vendor_id = product.vendor_id
            if not vendor_id:
                order_items_without_vendor += 1
                print(f"Warning: Product {product.id} has no vendor_id")
                continue
            
            # Update OrderItem
            order_item.vendor_id = vendor_id
            order_item.save(update_fields=['vendor_id'])
            order_items_updated += 1
            
        except Exception as e:
            order_items_without_vendor += 1
            print(f"Error processing OrderItem {order_item.id}: {str(e)}")
            raise
    
    print(f"Updated {order_items_updated} OrderItems with vendor")
    if order_items_without_vendor > 0:
        raise ValueError(
            f"Migration failed: {order_items_without_vendor} OrderItems could not be assigned a vendor. "
            f"All OrderItems must have a valid product_variant → product → vendor chain."
        )
    
    # Step 2: Populate Order.vendor from first OrderItem
    # الخطوة 2: ملء Order.vendor من أول OrderItem
    print("Populating Order.vendor fields...")
    orders_updated = 0
    orders_without_items = 0
    
    for order in Order.objects.all():
        # Get first OrderItem for this order
        first_item = OrderItem.objects.filter(order_id=order.id).first()
        
        if not first_item:
            orders_without_items += 1
            print(f"Warning: Order {order.id} has no items")
            continue
        
        if not first_item.vendor_id:
            orders_without_items += 1
            print(f"Warning: First OrderItem of Order {order.id} has no vendor")
            continue
        
        # Update Order with vendor from first item
        order.vendor_id = first_item.vendor_id
        order.save(update_fields=['vendor_id'])
        orders_updated += 1
    
    print(f"Updated {orders_updated} Orders with vendor")
    if orders_without_items > 0:
        raise ValueError(
            f"Migration failed: {orders_without_items} Orders have no items or items without vendor. "
            f"All Orders must have at least one OrderItem with a valid vendor."
        )
    
    # Step 3: Final validation - ensure no NULL values
    # الخطوة 3: التحقق النهائي - التأكد من عدم وجود قيم NULL
    print("Validating data integrity...")
    
    orders_with_null = Order.objects.filter(vendor_id__isnull=True).count()
    order_items_with_null = OrderItem.objects.filter(vendor_id__isnull=True).count()
    
    if orders_with_null > 0 or order_items_with_null > 0:
        raise ValueError(
            f"Migration validation failed: "
            f"{orders_with_null} Orders and {order_items_with_null} OrderItems still have NULL vendor. "
            f"This should not happen. Please check the data migration logic."
        )
    
    print("✓ All vendor fields populated successfully!")


def reverse_populate_vendor_fields(apps, schema_editor):
    """
    Reverse migration - set vendor fields to NULL
    Migration عكسي - تعيين حقول vendor إلى NULL
    """
    Order = apps.get_model('orders', 'Order')
    OrderItem = apps.get_model('orders', 'OrderItem')
    
    Order.objects.all().update(vendor_id=None)
    OrderItem.objects.all().update(vendor_id=None)


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0004_alter_order_created_at_alter_order_customer_address_and_more'),
        ('vendors', '0001_initial'),
        ('products', '0001_initial'),
    ]

    operations = [
        # Step 1: Add vendor field to OrderItem with null=True (temporary)
        # الخطوة 1: إضافة حقل vendor إلى OrderItem مع null=True (مؤقت)
        migrations.AddField(
            model_name='orderitem',
            name='vendor',
            field=models.ForeignKey(
                'vendors.Vendor',
                on_delete=models.DO_NOTHING,
                related_name='order_items',
                db_index=True,
                null=True,
                blank=True,
                verbose_name='Vendor',
                help_text='Vendor associated with this order item / البائع المرتبط بهذا العنصر'
            ),
        ),
        
        # Step 2: Add vendor field to Order with null=True (temporary)
        # الخطوة 2: إضافة حقل vendor إلى Order مع null=True (مؤقت)
        migrations.AddField(
            model_name='order',
            name='vendor',
            field=models.ForeignKey(
                'vendors.Vendor',
                on_delete=models.DO_NOTHING,
                related_name='orders',
                db_index=True,
                null=True,
                blank=True,
                verbose_name='Vendor',
                help_text='Vendor associated with this order / البائع المرتبط بهذا الطلب'
            ),
        ),
        
        # Step 3: Populate vendor fields from existing relationships
        # الخطوة 3: ملء حقول vendor من العلاقات الموجودة
        migrations.RunPython(
            populate_vendor_fields,
            reverse_code=reverse_populate_vendor_fields,
        ),
        
        # Step 4: Remove null=True from OrderItem.vendor (make it required)
        # الخطوة 4: إزالة null=True من OrderItem.vendor (جعله مطلوب)
        migrations.AlterField(
            model_name='orderitem',
            name='vendor',
            field=models.ForeignKey(
                'vendors.Vendor',
                on_delete=models.DO_NOTHING,
                related_name='order_items',
                db_index=True,
                null=False,
                verbose_name='Vendor',
                help_text='Vendor associated with this order item / البائع المرتبط بهذا العنصر'
            ),
        ),
        
        # Step 5: Remove null=True from Order.vendor (make it required)
        # الخطوة 5: إزالة null=True من Order.vendor (جعله مطلوب)
        migrations.AlterField(
            model_name='order',
            name='vendor',
            field=models.ForeignKey(
                'vendors.Vendor',
                on_delete=models.DO_NOTHING,
                related_name='orders',
                db_index=True,
                null=False,
                verbose_name='Vendor',
                help_text='Vendor associated with this order / البائع المرتبط بهذا الطلب'
            ),
        ),
        
        # Step 6: Add index for vendor field in OrderItem (if not already added by db_index=True)
        # الخطوة 6: إضافة index لحقل vendor في OrderItem (إذا لم يُضف بالفعل بواسطة db_index=True)
        # Note: db_index=True already creates the index, but we can add composite indexes if needed
        # ملاحظة: db_index=True ينشئ index بالفعل، لكن يمكننا إضافة indexes مركبة إذا لزم الأمر
    ]

