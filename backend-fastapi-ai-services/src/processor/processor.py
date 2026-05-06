import chromadb
from sentence_transformers import SentenceTransformer
from rapidfuzz import fuzz
from openai import OpenAI
import os
import uuid


class AI_POS_Engine:
    def __init__(self, db_path="./chroma_db", collection_name="products"):

        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.db = chromadb.PersistentClient(path=db_path)
        self.collection = self.db.get_or_create_collection(
            name=collection_name
        )


    def embed(self, text: str):
        return self.embedder.encode(text).tolist()


    def add_product(self, product: dict):
        try:
            pid = str(uuid.uuid4())
            name = product["name"]

            self.collection.add(
                ids=[pid],
                documents=[name],
                embeddings=[self.embed(name)],
                metadatas=[{
                    "id": product.get("id"),
                    "name": name,
                }]
            )

            print(f"[SUCCESS] Product Added -> Name: {name} | ID: {pid}")
            return True

        except Exception as e:
            print(f"[ERROR] add_product failed -> {str(e)}")
            return None


    def delete_product(self, product_id: str):
        try:
            print(f"[INFO] Deleting product with ID: {product_id}")

            # ❌ WRONG: include=["metadatas", "ids"]
            data = self.collection.get(include=["metadatas"] )

            data = self.collection.get(
                include=["metadatas"]   # ✔ only valid fields
            )

            target_chroma_id = None

            for i, meta in enumerate(data["metadatas"]):
                if meta.get("id") == product_id:
                    print(f"Product found -> {product_id}")

                    target_chroma_id = data["ids"][i]  # ⚠️ ids still available without include
                    break

            if not target_chroma_id:
                print(f"[WARN] Product not found -> ID: {product_id}")
                return None

            self.collection.delete(ids=[target_chroma_id])

            print(f"[SUCCESS] Deleted -> {product_id}")
            return True

        except Exception as e:
            print(f"[ERROR] delete_product failed -> {str(e)}")
            return None


    def update_by_id(self, product_id: str, new_name: str):

        try:
            print(f"[INFO] Updating product by meta ID: {product_id}")
            data = self.collection.get(include=["metadatas"])

            target_chroma_id = None

            for i, m in enumerate(data["metadatas"]):

                if m.get("id") == product_id:
                    target_chroma_id = data["ids"][i]
                    break

            if not target_chroma_id:
                print(f"[WARN] Product not found: {product_id}")
                return None

            self.collection.delete(ids=[target_chroma_id])
            print(f"[INFO] Deleted old record: {target_chroma_id}")

            self.collection.add(
                ids=[target_chroma_id],  
                documents=[new_name],
                embeddings=[self.embed(new_name)],
                metadatas={
                    "name": new_name,
                    "id": product_id
                }
            )

            print(f"[SUCCESS] Updated product: {product_id} -> {new_name}")

            return True

        except Exception as e:
            print(f"[ERROR] update_by_id failed -> {str(e)}")
            return None


    def fuzzy_score(self, a: str, b: str):
        return fuzz.ratio(a.lower(), b.lower()) / 100

    # =========================================================
    # 🔥 FUZZY MATCHER (EXTERNAL LIST INPUT)
    # =========================================================
    def fuzzy_match_best(self, items: list, query: str):

        best_item = None
        best_score = 0

        for item in items:
            score = self.fuzzy_score(query, item)

            if score > best_score:
                best_score = score
                best_item = item

        return {
            "best_match": best_item,
            "score": best_score
        }

    # =========================================================
    # 🧠 DECISION ENGINE (90 / 60 RULE)
    # =========================================================
    def decide_match(self, query: str, items: list):
        try:

            fuzzy_result = self.fuzzy_match_best(items, query)

            score = fuzzy_result["score"]
            match = fuzzy_result["best_match"]

            if score >= 0.9:
                return {
                    "item": match,
                }

            elif 0.6 <= score < 0.9:
                # embedding search fallback
                emb = self.embed(query)

                res = self.collection.query(
                    query_embeddings=[emb],
                    n_results=1
                )

            if res["documents"]:
                meta = res["metadatas"][0][0]
                doc = res["documents"][0][0]

                match_id = meta.get("id")

                matched_item = next(
                    (item for item in items if str(item.get("id")) == str(match_id)),
                    None
                )

                if matched_item:
                    return {
                        "product": matched_item
                    }

            return None
        except:
            return None


    def transcribe_audio(self, file_path: str):
        print("🔥 ENTER FUNCTION")

        try:
            with open(file_path, "rb") as audio:
                print("📂 FILE OPENED")

                transcript = self.client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio,
                    language='en'
                )

            print("✅ API SUCCESS")
            print("📝 TEXT:", transcript.text)

            return transcript.text

        except Exception as e:
            print("❌ ERROR OCCURRED:")
            print(str(e))
            return ""

    def parse_llm(self, text: str):

        prompt = f"""
        You are a highly accurate POS (Point of Sale) extraction system.

        Your task is to extract items from natural language text and convert them into structured JSON.

        ---

        ### IMPORTANT RULES:
        - Output ONLY valid JSON array. No explanation, no extra text.
        - Each item must follow this structure:
        {{
            "name": string,
            "quantity": number,
            "price": number
        }}

        ---

        ### STRICT LANGUAGE FORMAT RULE:
        Natural language ALWAYS follows this order:

        👉 quantity → name → price

        Example:
        "2 burger 200" means:
        quantity = 2, name = "burger", price = 200

        ---

        ### EXTRACTION RULES:
        1. Quantity ALWAYS comes FIRST.
        2. Name ALWAYS comes AFTER quantity.
        3. Price ALWAYS comes LAST.
        4. Every item MUST have price (never null).
        5. If quantity missing → default = 1.
        6. Multiple items can exist in one sentence.
        7. Ignore filler words (please, add, give me, etc.)

        ---

        ### EXAMPLES:

        Input:
        "2 burger 200"
        Output:
        [
        {{"name": "burger", "quantity": 2, "price": 200}}
        ]

        ---

        Input:
        "1 pizza 500"
        Output:
        [
        {{"name": "pizza", "quantity": 1, "price": 500}}
        ]

        ---

        Input:
        "2 burger 200 1 pizza 500"
        Output:
        [
        {{"name": "burger", "quantity": 2, "price": 200}},
        {{"name": "pizza", "quantity": 1, "price": 500}}
        ]

        ---

        Input:
        "3 coke 150 2 fries 100"
        Output:
        [
        {{"name": "coke", "quantity": 3, "price": 150}},
        {{"name": "fries", "quantity": 2, "price": 100}}
        ]

        ---

        Input:
        "burger 200"
        Output:
        [
        {{"name": "burger", "quantity": 1, "price": 200}}
        ]

        ---

        Input:
        "2 zinger burger 350 1 chicken roll 180"
        Output:
        [
        {{"name": "zinger burger", "quantity": 2, "price": 350}},
        {{"name": "chicken roll", "quantity": 1, "price": 180}}
        ]

        ---

        Input:
        "please add 2 shawarma 250 and 1 juice 120"
        Output:
        [
        {{"name": "shawarma", "quantity": 2, "price": 250}},
        {{"name": "juice", "quantity": 1, "price": 120}}
        ]

        ---

        Now extract from this text:
        {text}
        """

        response = self.client.responses.create(
            model="gpt-4o-mini",
            input=[
                {"role": "system", "content": "Extract structured POS data."},
                {"role": "user", "content": prompt}
            ]
        )

        import json

        try:
            return json.loads(response.output[0].content[0].text)
        except:
            return []