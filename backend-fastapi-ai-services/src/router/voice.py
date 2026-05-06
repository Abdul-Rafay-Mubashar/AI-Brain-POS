from fastapi import APIRouter, UploadFile, File, Request

import shutil
import os

voiceRouter = APIRouter(prefix="/voice", tags=["voice"])

def clean_mongo(doc):
    if not doc:
        return None

    doc["_id"] = str(doc["_id"])
    return doc

@voiceRouter.post("/bill")
async def get_voice_to_product_list(
    request: Request,
    audio: UploadFile = File(...)
):
    try:
        engine = request.app.state.ai_engine

        # 1. save audio temp file
        file_path = f"temp_{audio.filename}"

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(audio.file, buffer)
        print("STEP 2: calling whisper")

        # 2. whisper transcription
        text = engine.transcribe_audio(file_path)
        print("STEP 3: whisper returned")
        print("[WHISPER TEXT]", text)

        # 3. LLM parsing (POS extraction)
        items = engine.parse_llm(text)

        print("[LLM ITEMS]", items)

        # 4. get products from DB
        products = await request.app.state.products_collection.find().to_list(length=1000)

        # normalize product names
        product_names = [p["name"] for p in products]

        # 5. fuzzy + embedding decision
        final_items = []

        for item in items:
            match = engine.decide_match(item["name"], product_names)

            if match:
                final_items.append({
                    "input": item,
                    "match": match
                })

        # cleanup file
        os.remove(file_path)
        enriched_items = []

        for fi in final_items:


            full_product = next(
                (p for p in products if p["name"] == fi['match']['item']),
                None
            )

            if full_product:
                enriched_items.append({
                    'item': clean_mongo(full_product),
                    'proposed_quantity': fi['input']['quantity'],
                    'proposed_price': fi['input']['price']
                })
        return {
            "success": True,
            "text": text,
            "items": items,
            "matched": final_items,
            "final": enriched_items
            # "matched": clean_mongo(enriched_items)
            
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }