from datetime import datetime
from decimal import Decimal
from typing import List

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ShippingAddressIn(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    phone: str = Field(..., min_length=10, max_length=10)
    address_line1: str = Field(..., min_length=3, max_length=200)
    address_line2: str | None = Field(None, max_length=200)
    city: str = Field(..., min_length=2, max_length=80)
    state: str = Field(..., min_length=2, max_length=80)
    pincode: str = Field(..., min_length=6, max_length=10)

    @field_validator("phone")
    @classmethod
    def _digits_only(cls, v: str) -> str:
        cleaned = "".join(ch for ch in v if ch.isdigit())
        if len(cleaned) != 10:
            raise ValueError("phone must be exactly 10 digits")
        return cleaned

    @field_validator("pincode")
    @classmethod
    def _pincode_digits(cls, v: str) -> str:
        if not v.isdigit() or len(v) != 6:
            raise ValueError("pincode must be exactly 6 digits")
        return v


class PlaceOrderIn(BaseModel):
    address: ShippingAddressIn


class OrderItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int | None
    product_name: str
    unit_price: Decimal
    quantity: int
    line_total: Decimal


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    full_name: str
    phone: str
    address_line1: str
    address_line2: str | None
    city: str
    state: str
    pincode: str
    subtotal: Decimal
    shipping_fee: Decimal
    total: Decimal
    status: str
    created_at: datetime
    items: List[OrderItemOut]
