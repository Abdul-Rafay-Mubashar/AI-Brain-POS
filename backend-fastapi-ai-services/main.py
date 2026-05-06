from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.mongo import products_collection
from src.router.product import productRouter
from src.router.voice import voiceRouter
from src.db.mongo import products_collection

from src.processor.processor import AI_POS_Engine
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
app.state.products_collection = products_collection
# AI Engine (single source of truth)
app.state.ai_engine = AI_POS_Engine()

# Router
app.include_router(productRouter, prefix="/api")
app.include_router(voiceRouter, prefix="/api")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/voice/products")
async def get_all_products():
    products = await products_collection.find().to_list(length=1000)

    for p in products:
        p["_id"] = str(p["_id"])

    return {
        "success": True,
        "count": len(products),
        "data": products
    }


@app.on_event("startup")
async def startup():
    print("Server start")