from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class ProductImageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    position: int


class ProductSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str
    price: Decimal
    mrp: Decimal
    discount_percent: int
    rating: Decimal
    rating_count: int
    assured: bool
    category_id: int
    thumbnail_url: str | None = None


class ProductDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    brand: str
    description: str
    price: Decimal
    mrp: Decimal
    discount_percent: int
    rating: Decimal
    rating_count: int
    stock: int
    assured: bool
    category_id: int
    images: List[ProductImageOut] = Field(default_factory=list)


class PaginatedProducts(BaseModel):
    items: List[ProductSummary]
    total: int
    page: int
    page_size: int
