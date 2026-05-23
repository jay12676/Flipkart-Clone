from typing import Tuple

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.product import Product


def list_categories(db: Session) -> list[Category]:
    return list(db.scalars(select(Category).order_by(Category.id)))


def list_products(
    db: Session,
    *,
    search: str | None = None,
    category_slug: str | None = None,
    page: int = 1,
    page_size: int = 24,
) -> Tuple[list[dict], int]:
    stmt = select(Product)

    if search:
        like = f"%{search.strip()}%"
        stmt = stmt.where(Product.name.ilike(like))

    if category_slug:
        stmt = stmt.join(Category).where(Category.slug == category_slug)

    total = db.scalar(select(func.count()).select_from(stmt.subquery())) or 0

    page = max(1, page)
    page_size = max(1, min(page_size, 60))
    offset = (page - 1) * page_size

    stmt = (
        stmt.options(selectinload(Product.images))
        .order_by(Product.id)
        .offset(offset)
        .limit(page_size)
    )
    products = list(db.scalars(stmt))

    rows: list[dict] = []
    for p in products:
        rows.append(
            {
                "id": p.id,
                "name": p.name,
                "brand": p.brand,
                "price": p.price,
                "mrp": p.mrp,
                "discount_percent": p.discount_percent,
                "rating": p.rating,
                "rating_count": p.rating_count,
                "assured": p.assured,
                "category_id": p.category_id,
                "thumbnail_url": p.images[0].url if p.images else None,
            }
        )
    return rows, int(total)


def get_product_detail(db: Session, product_id: int) -> Product | None:
    stmt = (
        select(Product)
        .options(selectinload(Product.images))
        .where(Product.id == product_id)
    )
    return db.scalar(stmt)
