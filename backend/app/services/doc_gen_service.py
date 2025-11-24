import json
import re
import uuid
from app.models.document import Document, Section

class DocGenService:
    def parse_content(self, raw: str) -> Document:
        """
        Parses the raw string response from the LLM into a structured Document object.
        Handles JSON markdown stripping and validation.
        """
        try:
            # 1. Strip Markdown code blocks if present (e.g. ```json ... ```)
            clean = raw.strip()
            if clean.startswith("```"):
                # Remove first line (```json) and last line (```)
                lines = clean.split("\n")
                if len(lines) >= 2:
                    clean = "\n".join(lines[1:-1])
            
            # 2. Parse JSON string to Dict
            data = json.loads(clean)
            
            # 3. Validate and Structure
            # Expecting data to be a dict with "sections": [...] or just a list [...]
            if isinstance(data, list):
                # If LLM returned just a list of sections
                sections_data = data
            else:
                # If LLM returned { "sections": [...] }
                sections_data = data.get("sections", [])

            # 4. Convert to Pydantic Models
            sections = []
            for idx, item in enumerate(sections_data):
                # Ensure each section has a unique ID
                sec = Section(
                    id=str(uuid.uuid4()),
                    title=item.get("title", "Untitled Section"),
                    content=item.get("content", ""),
                    order=idx,
                    history=[] # Initialize empty history
                )
                sections.append(sec)

            return Document(sections=sections)

        except json.JSONDecodeError:
            # Fallback: validation failed or JSON is malformed
            # Return a simple error document or empty one
            return Document(sections=[
                Section(
                    id=str(uuid.uuid4()), 
                    title="Error Parsing Content", 
                    content=raw, 
                    order=0
                )
            ])
        except Exception as e:
            # General error handling
            print(f"Error parsing document: {e}")
            return Document(sections=[])