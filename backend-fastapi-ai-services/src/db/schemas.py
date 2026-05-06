from pydantic import BaseModel
from typing import Optional

class ProductIn(BaseModel):
    id: str
    name: str
    price: Optional[float] = 0
    quantity: Optional[int] = 1
    category: Optional[str] = None


class UpdateProductIn(BaseModel):
    product_id: str  
    new_name: str
    price: Optional[float] = None
    quantity: Optional[int] = None
    category: Optional[str] = None


class DeleteProductIn(BaseModel):
    product_id: str
