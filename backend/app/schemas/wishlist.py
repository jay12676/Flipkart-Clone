from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class WishlistLineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    brand: str
    thumbnail_url: str | None
    price: Decimal
    mrp: Decimal
    discount_percent: int
    in_stock: bool


class WishlistOut(BaseModel):
    items: List[WishlistLineOut]
    product_ids: List[int]
    count: int


class WishlistToggleIn(BaseModel):
    product_id: int = Field(..., gt=0)
