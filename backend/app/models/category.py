from typing import List

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    icon_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    products: Mapped[List["Product"]] = relationship(  # noqa: F821
        back_populates="category", cascade="all, delete-orphan"
    )
