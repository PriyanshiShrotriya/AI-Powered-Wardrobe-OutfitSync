"""
Outfit assembly module using Groq for intelligent selection.

Uses a Groq-hosted large language model to combine wardrobe candidates into a
cohesive, styled outfit based on occasion, weather, style preference, and formality.
"""

import json
import os
from typing import Dict, List
from dotenv import load_dotenv
from groq import Groq
from app.models import ClothingItem, OutfitRequest, OutfitSuggestion


# Load environment variables from .env so the Groq API key is available locally.
load_dotenv()


class OutfitAssembler:
    """
    Assembles a complete outfit from candidate wardrobe items using Groq.
    
    Leverages a Groq-hosted model's understanding of fashion, color theory, and occasion
    appropriateness to select a cohesive outfit from pre-filtered candidates.
    """

    def __init__(self):
        """
        Initialize the assembler with Groq client.
        
        Requires GROQ_API_KEY environment variable to be set.
        Raises ValueError if the API key is not configured.
        """
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY environment variable is not set. "
                "Please configure it in .env or system environment."
            )
        self.client = Groq(api_key=api_key)
        self.model = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")

    def _format_candidates_for_prompt(
        self, candidates: Dict[str, List[ClothingItem]]
    ) -> str:
        """
        Format candidate items into a readable string for the GPT prompt.
        
        Args:
            candidates: Dictionary of category -> list of items
            
        Returns:
            Formatted string representation of candidates
        """
        formatted = {}
        for category, items in candidates.items():
            if items:
                items_str = "\n  ".join(
                    [
                        f"- ID: {item.id}, Name: {item.name}, Colors: {', '.join(item.colors)}, "
                        f"Style: {', '.join(item.style_tags)}, Fit: {item.fit or 'N/A'}"
                        for item in items
                    ]
                )
                formatted[category] = items_str
            else:
                formatted[category] = "  (no suitable items)"
        return json.dumps(formatted, indent=2)

    def assemble(
        self, request: OutfitRequest, candidates: Dict[str, List[ClothingItem]]
    ) -> OutfitSuggestion:
        """
        Assemble the best outfit from candidate items using Groq.
        
        Sends a carefully crafted prompt to the Groq-hosted model with the user's preferences
        and candidate items, then parses the response into an OutfitSuggestion.
        
        Args:
            request: The outfit request with weather, occasion, and preferences
            candidates: Pre-filtered and ranked candidate items per category
            
        Returns:
            OutfitSuggestion with selected items and reasoning
            
        Raises:
            ValueError: If the outfit is incomplete or items are not found
        """
        # System prompt: enforce strict adherence to available candidates
        system_prompt = (
            "You are an expert personal stylist. Assemble the best outfit using ONLY items "
            "from the candidate list provided. Never suggest items not in the list. "
            "Consider color harmony, occasion, weather, and user style preference. "
            "Return ONLY valid JSON with no extra text or markdown."
        )

        # Build the user prompt with all context
        candidates_formatted = self._format_candidates_for_prompt(candidates)

        user_prompt = f"""Occasion: {request.occasion}
Weather: {request.temperature_celsius}°C, {request.weather_condition}
Style preference: {request.style_preference}
Formality: {request.formality_level}/5
Avoid colors: {', '.join(request.avoid_colors) if request.avoid_colors else 'none'}

Candidates:
{candidates_formatted}

Return JSON with keys: top_id, bottom_id, shoes_id, outerwear_id (null if none), 
accessory_id (null if none), reasoning (2-3 sentences), style_score (0.0 to 1.0)"""

        try:
            # Call the Groq-hosted model with a structured request.
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.4,
                max_tokens=320,
            )

            # Parse the response.
            response_text = (response.choices[0].message.content or "").strip()

            if not response_text:
                raise ValueError("Groq returned an empty response")

            # Extract JSON (handle potential markdown code blocks)
            if response_text.startswith("```"):
                json_str = response_text.split("```")[1].removeprefix("json").strip()
            else:
                json_str = response_text

            response_json = json.loads(json_str)

            # Extract IDs from response
            top_id = response_json.get("top_id")
            bottom_id = response_json.get("bottom_id")
            shoes_id = response_json.get("shoes_id")
            outerwear_id = response_json.get("outerwear_id")
            accessory_id = response_json.get("accessory_id")
            reasoning = response_json.get("reasoning", "No reasoning provided")
            style_score = response_json.get("style_score", 0.5)

            # Validate required fields
            if not all([top_id, bottom_id, shoes_id]):
                raise ValueError(
                    "Incomplete outfit — insufficient wardrobe items. "
                    "Unable to assemble a complete outfit (missing top, bottom, or shoes)."
                )

            # Helper function to find item by ID from candidates
            def find_item_by_id(item_id: str) -> ClothingItem:
                for category, items in candidates.items():
                    for item in items:
                        if item.id == item_id:
                            return item
                raise ValueError(f"Item with ID {item_id} not found in candidates")

            # Map IDs back to full item objects
            top = find_item_by_id(top_id)
            bottom = find_item_by_id(bottom_id)
            shoes = find_item_by_id(shoes_id)

            outerwear = None
            if outerwear_id:
                try:
                    outerwear = find_item_by_id(outerwear_id)
                except ValueError:
                    print(f"Warning: Outerwear item {outerwear_id} not found, skipping")

            accessory = None
            if accessory_id:
                try:
                    accessory = find_item_by_id(accessory_id)
                except ValueError:
                    print(f"Warning: Accessory item {accessory_id} not found, skipping")

            # Construct and return the outfit suggestion
            return OutfitSuggestion(
                top=top,
                bottom=bottom,
                shoes=shoes,
                outerwear=outerwear,
                accessory=accessory,
                reasoning=reasoning,
                style_score=float(style_score),
            )

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse GPT response as JSON: {str(e)}")
        except KeyError as e:
            raise ValueError(f"Missing required field in outfit response: {str(e)}")
