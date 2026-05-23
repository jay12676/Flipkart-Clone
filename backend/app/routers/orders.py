from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers.deps import current_user_id
from app.schemas.order import OrderOut, PlaceOrderIn
from app.services import order_service

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def place_order(
    payload: PlaceOrderIn,
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return order_service.place_order(db, user_id, payload.address)


@router.get("", response_model=list[OrderOut])
def list_orders(
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return order_service.list_orders(db, user_id)


@router.get("/{order_number}", response_model=OrderOut)
def get_order(order_number: str, db: Session = Depends(get_db)):
    order = order_service.get_order_by_number(db, order_number)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Order not found")
    return order
