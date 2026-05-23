from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.product import PaginatedProducts, ProductDetail
from app.services import product_service

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("", response_model=PaginatedProducts)
def list_products(
    search: str | None = Query(None, max_length=100, description="Case-insensitive name match"),
    category: str | None = Query(None, max_length=80, description="Category slug filter"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=60),
    db: Session = Depends(get_db),
):
    rows, total = product_service.list_products(
        db, search=search, category_slug=category, page=page, page_size=page_size
    )
    return {"items": rows, "total": total, "page": page, "page_size": page_size}


@router.get("/{product_id}", response_model=ProductDetail)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product_detail(db, product_id)
    if product is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Product not found")
    return product
