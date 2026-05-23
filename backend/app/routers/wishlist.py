from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.routers.deps import current_user_id
from app.schemas.wishlist import WishlistOut, WishlistToggleIn
from app.services import wishlist_service

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=WishlistOut)
def get_wishlist(
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return wishlist_service.get_wishlist(db, user_id)


@router.post("/items", response_model=WishlistOut)
def toggle_wishlist_item(
    payload: WishlistToggleIn,
    db: Session = Depends(get_db),
    user_id: int = Depends(current_user_id),
):
    return wishlist_service.toggle(db, user_id, payload.product_id)
