from typing import List

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.product import Product
from app.models.wishlist import WishlistItem


def _load_items(db: Session, user_id: int) -> List[WishlistItem]:
    stmt = (
        select(WishlistItem)
        .where(WishlistItem.user_id == user_id)
        .options(selectinload(WishlistItem.product).selectinload(Product.images))
        .order_by(WishlistItem.added_at.desc())
    )
    return list(db.scalars(stmt))


def _build_response(items: List[WishlistItem]) -> dict:
    lines = []
    product_ids = []
    for wi in items:
        product = wi.product
        if product is None:
            continue
        product_ids.append(product.id)
        lines.append(
            {
                "id": wi.id,
                "product_id": product.id,
                "product_name": product.name,
                "brand": product.brand,
                "thumbnail_url": product.images[0].url if product.images else None,
                "price": product.price,
                "mrp": product.mrp,
                "discount_percent": product.discount_percent,
                "in_stock": product.stock > 0,
            }
        )
    return {"items": lines, "product_ids": product_ids, "count": len(lines)}


def get_wishlist(db: Session, user_id: int) -> dict:
    return _build_response(_load_items(db, user_id))


def toggle(db: Session, user_id: int, product_id: int) -> dict:
    product = db.get(Product, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")

    existing = db.scalar(
        select(WishlistItem).where(
            WishlistItem.user_id == user_id, WishlistItem.product_id == product_id
        )
    )
    if existing:
        db.delete(existing)
    else:
        db.add(WishlistItem(user_id=user_id, product_id=product_id))
    db.commit()
    return get_wishlist(db, user_id)
