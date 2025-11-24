import google.generativeai as genai
from app.core.config import settings
from app.services.doc_gen_service import DocGenService

class GenService:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Use Gemini 2.5 Flash model which supports generateContent
        self.m = genai.GenerativeModel("gemini-2.5-flash")
        self.p = DocGenService()

    async def create_draft(self, prompt: str, type: str):
        fmt = "slides" if "slide" in type.lower() or "ppt" in type.lower() else "sections"
        
        p_text = f"""
        Generate a {type} document about: {prompt}.
        Return ONLY valid JSON in this format:
        {{
            "sections": [
                {{ "title": "Section/Slide Title", "content": "Detailed content here..." }}
            ]
        }}
        Create at least 5 {fmt}.
        """
        
        res = await self.m.generate_content_async(p_text)
        return self.p.parse_content(res.text)

    async def refine_content(self, txt: str, instr: str):
        p_text = f"Rewrite this text: '{txt}'\nInstructions: {instr}\nReturn ONLY the refined text."
        res = await self.m.generate_content_async(p_text)
        return res.text.strip()

    async def suggest_outline(self, title: str):
        """
        Generates section headers/outline for a document based on the title.
        Returns only section titles without content.
        """
        p_text = f"""
        Generate a document outline (section headers only) for a document titled: "{title}".
        Return ONLY valid JSON in this format:
        {{
            "sections": [
                {{ "title": "Section Title 1" }},
                {{ "title": "Section Title 2" }}
            ]
        }}
        Create 5-8 relevant section headers that would be appropriate for this document.
        Do not include content, only titles.
        """
        
        res = await self.m.generate_content_async(p_text)
        # Parse the response to extract just the section titles
        try:
            import json
            clean = res.text.strip()
            if clean.startswith("```"):
                lines = clean.split("\n")
                if len(lines) >= 2:
                    clean = "\n".join(lines[1:-1])
            
            data = json.loads(clean)
            sections_data = data.get("sections", []) if isinstance(data, dict) else data
            
            # Return sections with just titles (no content)
            sections = []
            for idx, item in enumerate(sections_data):
                sections.append({
                    "title": item.get("title", f"Section {idx + 1}"),
                    "content": ""  # Empty content for outline
                })
            
            return {"sections": sections}
        except Exception as e:
            # Fallback: return a simple outline
            return {
                "sections": [
                    {"title": "Introduction", "content": ""},
                    {"title": "Main Content", "content": ""},
                    {"title": "Conclusion", "content": ""}
                ]
            }