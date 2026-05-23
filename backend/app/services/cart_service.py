from decimal import Decimal
from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.cart import CartItem
from app.models.product import Product

FREE_SHIPPING_THRESHOLD = Decimal("500.00")
FLAT_SHIPPING_FEE = Decimal("40.00")


def _load_cart_items(db: Session, user_id: int) -> List[CartItem]:
    stmt = (
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(selectinload(CartItem.product).selectinload(Product.images))
        .order_by(CartItem.added_at.desc())
    )
    return list(db.scalars(stmt))


def _build_cart_response(items: List[CartItem]) -> dict:
    lines = []
    subtotal = Decimal("0.00")
    item_count = 0

    for ci in items:
        product = ci.product
        if product is None:
            continue
        line_total = (product.price * ci.quantity).quantize(Decimal("0.01"))
        subtotal += line_total
        item_count += ci.quantity
        lines.append(
            {
                "id": ci.id,
                "product_id": product.id,
                "product_name": product.name,
                "brand": product.brand,
                "thumbnail_url": product.images[0].url if product.images else None,
                "unit_price": product.price,
                "mrp": product.mrp,
                "discount_percent": product.discount_percent,
                "quantity": ci.quantity,
                "line_total": line_total,
                "in_stock": product.stock > 0,
                "stock": product.stock,
            }
        )

    shipping_fee = (
        Decimal("0.00") if subtotal >= FREE_SHIPPING_THRESHOLD or subtotal == 0 else FLAT_SHIPPING_FEE
    )
    total = (subtotal + shipping_fee).quantize(Decimal("0.01"))

    return {
        "items": lines,
        "subtotal": subtotal.quantize(Decimal("0.01")),
        "shipping_fee": shipping_fee.quantize(Decimal("0.01")),
        "total": total,
        "item_count": item_count,
    }


def get_cart(db: Session, user_id: int) -> dict:
    return _build_cart_response(_load_cart_items(db, user_id))


def add_to_cart(db: Session, user_id: int, product_id: int, quantity: int) -> dict:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.scalar(
        select(CartItem).where(
            CartItem.user_id == user_id, CartItem.product_id == product_id
        )
    )
    new_qty = (existing.quantity if existing else 0) + quantity
    if new_qty > product.stock:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=f"Only {product.stock} in stock",
        )

    if existing:
        existing.quantity = new_qty
    else:
        db.add(CartItem(user_id=user_id, product_id=product_id, quantity=quantity))

    db.commit()
    return get_cart(db, user_id)


def update_quantity(db: Session, user_id: int, cart_item_id: int, quantity: int) -> dict:
    ci = db.scalar(
        select(CartItem).where(CartItem.id == cart_item_id, CartItem.user_id == user_id)
    )
    if ci is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Cart item not found")

    product = db.get(Product, ci.product_id)
    if product and quantity > product.stock:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            detail=f"Only {product.stock} in stock",
        )

    ci.quantity = quantity
    db.commit()
    return get_cart(db, user_id)


def remove_item(db: Session, user_id: int, cart_item_id: int) -> dict:
    ci = db.scalar(
        select(CartItem).where(CartItem.id == cart_item_id, CartItem.user_id == user_id)
    )
    if ci is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    db.delete(ci)
    db.commit()
    return get_cart(db, user_id)


def clear_cart(db: Session, user_id: int) -> None:
    for ci in _load_cart_items(db, user_id):
        db.delete(ci)
