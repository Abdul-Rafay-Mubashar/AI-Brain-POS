from fastapi import APIRouter, HTTPException, Request
from src.db import schemas


productRouter = APIRouter(prefix="/product", tags=["product"])


def get_ai_engine(request: Request):
    return request.app.state.ai_engine


@productRouter.post("/add-product")
def add_product(product: schemas.ProductIn, request: Request):

    try:
        AI_ENGINE = get_ai_engine(request)

        print(f"[INFO] ADD REQUEST -> {product.dict()}")

        result = AI_ENGINE.add_product(product.dict())

        print(f"[SUCCESS] Product added -> {product.name}")

        return {
            "status": "success",
            "message": "Product added successfully",
            "data": result
        }

    except Exception as e:
        print(f"[ERROR] add-product -> {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }


@productRouter.put("/update-product")
def update_product(product: schemas.UpdateProductIn, request: Request):

    try:
        AI_ENGINE = get_ai_engine(request)

        print(f"[INFO] UPDATE REQUEST -> {product.dict()}")

        result = AI_ENGINE.update_by_id(
            product_id=product.product_id,
            new_name=product.new_name,
        )

        if not result:
            return {
                "status": "not_found",
                "message": "Product not found"
            }

        return {
            "status": "success",
            "message": "Product updated successfully",
            "data": result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


@productRouter.delete("/delete-product")
def delete_product(product: schemas.DeleteProductIn, request: Request):

    try:
        AI_ENGINE = get_ai_engine(request)

        result = AI_ENGINE.delete_product(product.product_id)

        if not result:
            return {
                "status": "not_found",
                "message": "Product not found"
            }

        return {
            "status": "success",
            "message": "Product deleted successfully",
            "data": result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
