from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class CartItemIn(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(1, ge=1, le=10)


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1, le=10)


class CartLineOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str
    brand: str
    thumbnail_url: str | None
    unit_price: Decimal
    mrp: Decimal
    discount_percent: int
    quantity: int
    line_total: Decimal
    in_stock: bool
    stock: int


class CartOut(BaseModel):
    items: List[CartLineOut]
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    item_count: int
