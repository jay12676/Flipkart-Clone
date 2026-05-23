from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cart import CartItem
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import ShippingAddressIn
from app.services import cart_service
from app.utils.order_id import generate_order_number


def place_order(db: Session, user_id: int, address: ShippingAddressIn) -> Order:
    cart_items = list(
        db.scalars(
            select(CartItem)
            .where(CartItem.user_id == user_id)
            .options(selectinload(CartItem.product))
        )
    )
    if not cart_items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    product_ids = [ci.product_id for ci in cart_items]

    locked_products: dict[int, Product] = {
        p.id: p
        for p in db.scalars(
            select(Product).where(Product.id.in_(product_ids)).with_for_update()
        )
    }

    for ci in cart_items:
        product = locked_products.get(ci.product_id)
        if product is None:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"Product {ci.product_id} no longer available",
            )
        if ci.quantity > product.stock:
            raise HTTPException(
                status.HTTP_409_CONFLICT,
                detail=f"'{product.name}' has only {product.stock} in stock",
            )

    subtotal = sum(
        (locked_products[ci.product_id].price * ci.quantity for ci in cart_items),
        Decimal("0.00"),
    )
    shipping_fee = (
        Decimal("0.00")
        if subtotal >= cart_service.FREE_SHIPPING_THRESHOLD
        else cart_service.FLAT_SHIPPING_FEE
    )
    total = (subtotal + shipping_fee).quantize(Decimal("0.01"))

    order = Order(
        order_number=generate_order_number(),
        user_id=user_id,
        full_name=address.full_name,
        phone=address.phone,
        address_line1=address.address_line1,
        address_line2=address.address_line2,
        city=address.city,
        state=address.state,
        pincode=address.pincode,
        subtotal=subtotal.quantize(Decimal("0.01")),
        shipping_fee=shipping_fee.quantize(Decimal("0.01")),
        total=total,
        status="PLACED",
    )
    db.add(order)
    db.flush()

    for ci in cart_items:
        product = locked_products[ci.product_id]
        line_total = (product.price * ci.quantity).quantize(Decimal("0.01"))
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=product.id,
                product_name=product.name,
                unit_price=product.price,
                quantity=ci.quantity,
                line_total=line_total,
            )
        )
        product.stock -= ci.quantity

    cart_service.clear_cart(db, user_id)

    db.commit()
    db.refresh(order)
    return order


def get_order_by_number(db: Session, order_number: str) -> Order | None:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.order_number == order_number)
    )
    return db.scalar(stmt)


def list_orders(db: Session, user_id: int) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
        .where(Order.user_id == user_id)
        .order_by(Order.created_at.desc())
    )
    return list(db.scalars(stmt))
