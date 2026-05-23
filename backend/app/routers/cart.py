from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers.deps import current_user_id
from app.schemas.cart import CartItemIn, CartItemUpdate, CartOut
from app.services import cart_service

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartOut)
def get_cart(
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return cart_service.get_cart(db, user_id)


@router.post("/items", response_model=CartOut, status_code=status.HTTP_201_CREATED)
def add_to_cart(
    payload: CartItemIn,
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return cart_service.add_to_cart(db, user_id, payload.product_id, payload.quantity)


@router.patch("/items/{cart_item_id}", response_model=CartOut)
def update_quantity(
    cart_item_id: int,
    payload: CartItemUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return cart_service.update_quantity(db, user_id, cart_item_id, payload.quantity)


@router.delete("/items/{cart_item_id}", response_model=CartOut)
def remove_item(
    cart_item_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return cart_service.remove_item(db, user_id, cart_item_id)
