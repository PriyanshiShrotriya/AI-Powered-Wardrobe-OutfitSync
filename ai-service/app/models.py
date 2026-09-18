"""
Pydantic models for OutfitSync AI outfit recommendation system.

Defines the data structures for wardrobe items, outfit requests, and suggestions.
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class ClothingItem(BaseModel):
    """
    Represents a single clothing item in the user's wardrobe.
    
    Attributes:
        id: Unique identifier for the item (MongoDB ObjectId as string)
        name: Display name or type of the item (e.g., "Blue Jeans", "Cotton T-Shirt")
        category: Type of clothing → "top" | "bottom" | "shoes" | "outerwear" | "accessory"
        colors: List of primary colors in the item
        style_tags: Tags describing style (e.g., ["casual", "sporty", "formal", "bohemian"])
        occasion_tags: Occasions suitable for this item (e.g., ["work", "casual", "party", "gym"])
        weather_suitability: Conditions where this item works (e.g., ["hot", "warm", "mild", "cold"])
        fabric: Optional material/fabric type (e.g., "cotton", "wool", "silk")
        fit: Optional fit description (e.g., "slim", "regular", "oversized", "tapered")
    """
    id: str
    name: str
    category: str = Field(
        ..., 
        description="Category must be one of: top, bottom, shoes, outerwear, accessory"
    )
    colors: List[str]
    style_tags: List[str]
    occasion_tags: List[str]
    weather_suitability: List[str]
    fabric: Optional[str] = None
    fit: Optional[str] = None
    image_url: Optional[str] = None


class OutfitRequest(BaseModel):
    """
    Request payload for the outfit recommendation endpoint.
    
    Attributes:
        user_id: Unique identifier of the user making the request
        wardrobe: Complete list of user's wardrobe items (fetched from MongoDB by backend)
        occasion: Event or context for the outfit (e.g., "work", "casual", "party", "gym")
        temperature_celsius: Current or forecasted temperature in degrees Celsius
        weather_condition: Current weather state → "sunny" | "cloudy" | "rainy" | "snowy" | "windy"
        style_preference: User's preferred style (e.g., "casual", "formal", "minimalist", "trendy")
        formality_level: Outfit formality scale from 1 (very casual) to 5 (very formal)
        avoid_colors: Optional list of colors user wants to avoid in the outfit
    """
    user_id: str
    wardrobe: List[ClothingItem]
    occasion: str
    temperature_celsius: float
    weather_condition: str = Field(
        ...,
        description="Weather must be one of: sunny, cloudy, rainy, snowy, windy"
    )
    style_preference: str
    formality_level: int = Field(..., ge=1, le=5, description="Must be between 1 and 5")
    avoid_colors: Optional[List[str]] = []


class OutfitSuggestion(BaseModel):
    """
    The recommended outfit returned by the AI assembler.
    
    Attributes:
        top: Recommended top/shirt item
        bottom: Recommended bottom/pants item
        shoes: Recommended shoes
        outerwear: Optional outerwear (jacket, coat, etc.)
        accessory: Optional accessory (scarf, hat, bag, etc.)
        reasoning: Explanation of why this outfit was chosen (2-3 sentences)
        style_score: Confidence/quality score from 0.0 (poor match) to 1.0 (excellent match)
    """
    top: ClothingItem
    bottom: ClothingItem
    shoes: ClothingItem
    outerwear: Optional[ClothingItem] = None
    accessory: Optional[ClothingItem] = None
    reasoning: str
    style_score: float = Field(..., ge=0.0, le=1.0, description="Score must be between 0.0 and 1.0")
