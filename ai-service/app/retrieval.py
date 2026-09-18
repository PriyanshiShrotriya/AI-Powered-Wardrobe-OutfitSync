"""
Wardrobe retrieval and filtering module for outfit recommendation.

Uses semantic embeddings (CLIP) to rank items within categories and applies
business logic filters for weather, occasion, formality, and color constraints.
"""

from typing import Dict, List, Optional
import numpy as np
from sentence_transformers import SentenceTransformer
from app.models import ClothingItem, OutfitRequest


class WardrobeRetriever:
    """
    Retrieves and filters wardrobe items based on weather, occasion, style, and color constraints.
    
    Uses CLIP embeddings for semantic similarity ranking within filtered categories.
    """

    def __init__(self):
        """Initialize the retriever with CLIP model for semantic embeddings."""
        # Use CLIP ViT-B/32 model for semantic understanding of clothing attributes
        self.model = SentenceTransformer("clip-ViT-B-32")

    def filter_by_weather(
        self, wardrobe: List[ClothingItem], temperature_celsius: float
    ) -> List[ClothingItem]:
        """
        Filter wardrobe items based on temperature conditions.
        
        Temperature ranges:
        - >28°C (hot): keep items with "hot" or "warm" in weather_suitability
        - 20–28°C (mild-warm): keep "warm" or "mild"
        - 12–20°C (cool): keep "mild" or "cold"
        - <12°C (cold): keep "cold"
        
        Args:
            wardrobe: List of all wardrobe items
            temperature_celsius: Current or forecasted temperature
            
        Returns:
            Filtered list of items suitable for the temperature
        """
        # Define acceptable weather tags based on temperature
        if temperature_celsius > 28:
            acceptable_weather = {"hot", "warm"}
        elif temperature_celsius >= 20:
            acceptable_weather = {"warm", "mild"}
        elif temperature_celsius >= 12:
            acceptable_weather = {"mild", "cold"}
        else:
            acceptable_weather = {"cold"}

        # Keep items that have at least one matching weather tag
        filtered = [
            item
            for item in wardrobe
            if any(tag in acceptable_weather for tag in item.weather_suitability)
        ]

        return filtered if filtered else wardrobe  # Fallback to all items if none match

    def filter_by_occasion(
        self,
        wardrobe: List[ClothingItem],
        occasion: str,
        formality_level: int,
    ) -> List[ClothingItem]:
        """
        Filter wardrobe items based on occasion and formality constraints.
        
        - Keeps items whose occasion_tags overlap with the requested occasion
        - If formality_level >= 4 (formal): exclude casual/sporty items
        - If formality_level <= 2 (casual): exclude formal items
        
        Args:
            wardrobe: List of wardrobe items to filter
            occasion: Event type (e.g., "work", "casual", "party", "gym")
            formality_level: Formality scale 1 (casual) to 5 (formal)
            
        Returns:
            Filtered list of occasion-appropriate items
        """
        filtered = []

        for item in wardrobe:
            # First check: must have matching occasion tag or empty occasion means matches all
            if item.occasion_tags and occasion.lower() not in [
                tag.lower() for tag in item.occasion_tags
            ]:
                continue

            # Second check: formality constraints
            if formality_level >= 4:
                # Formal event: exclude casual/sporty items
                if any(
                    tag in {"casual", "sporty"}
                    for tag in item.style_tags
                ):
                    continue

            elif formality_level <= 2:
                # Casual event: exclude formal items
                if any(tag in {"formal"} for tag in item.style_tags):
                    continue

            filtered.append(item)

        # Fallback: if filtering was too strict, return at least some items from the occasion
        if not filtered and occasion:
            filtered = [
                item
                for item in wardrobe
                if not item.occasion_tags  # Items with no occasion constraint
                or occasion.lower() in [tag.lower() for tag in item.occasion_tags]
            ]

        return filtered if filtered else wardrobe

    def filter_by_color(
        self, wardrobe: List[ClothingItem], avoid_colors: Optional[List[str]] = None
    ) -> List[ClothingItem]:
        """
        Exclude items containing any of the user's avoided colors.
        
        Args:
            wardrobe: List of wardrobe items to filter
            avoid_colors: List of color names to exclude (case-insensitive)
            
        Returns:
            Filtered list excluding items with avoided colors
        """
        if not avoid_colors:
            return wardrobe

        # Normalize avoid_colors to lowercase for case-insensitive matching
        avoided_lower = {color.lower() for color in avoid_colors}

        # Keep only items whose colors do not contain any avoided color
        filtered = [
            item
            for item in wardrobe
            if not any(color.lower() in avoided_lower for color in item.colors)
        ]

        return filtered if filtered else wardrobe  # Fallback if all items are excluded

    def rank_by_similarity(
        self,
        items: List[ClothingItem],
        query: str,
        query_embedding: Optional[np.ndarray] = None,
    ) -> List[ClothingItem]:
        """
        Rank items within a category using CLIP embeddings for semantic similarity.
        
        Args:
            items: List of items to rank
            query: Text query describing desired attributes (e.g., "warm, cozy sweater")
            
        Returns:
            Items sorted by semantic similarity to the query (highest first)
        """
        if not items:
            return items

        try:
            # Encode the query and all items into embeddings
            if query_embedding is None:
                query_embedding = self.model.encode(query, convert_to_numpy=True)

            # Create item descriptions and embed them
            item_descriptions = [
                f"{item.name} {' '.join(item.style_tags)} {' '.join(item.colors)}"
                for item in items
            ]
            item_embeddings = self.model.encode(
                item_descriptions, convert_to_numpy=True
            )

            # Calculate cosine similarity
            similarities = [
                np.dot(query_embedding, emb)
                / (np.linalg.norm(query_embedding) * np.linalg.norm(emb) + 1e-8)
                for emb in item_embeddings
            ]

            # Sort by similarity (highest first) and return top 3
            sorted_indices = sorted(
                range(len(items)), key=lambda i: similarities[i], reverse=True
            )
            return [items[i] for i in sorted_indices[:3]]

        except Exception as e:
            # Fallback: return top 3 items unsorted if embedding fails
            print(f"Warning: Embedding failed ({e}), returning unranked items")
            return items[:3]

    def get_candidates(self, request: OutfitRequest) -> Dict[str, List[ClothingItem]]:
        """
        Get the best candidate items per category for assembling an outfit.
        
        Applies filters in sequence: weather → occasion/formality → color.
        Returns top 3 candidates per category ranked by semantic similarity.
        Retries with relaxed occasion filter if a category has 0 candidates.
        
        Args:
            request: The outfit recommendation request with constraints
            
        Returns:
            Dictionary with category keys and lists of candidate items:
            {"top": [...], "bottom": [...], "shoes": [...], 
             "outerwear": [...], "accessory": [...]}
        """
        categories = ["top", "bottom", "shoes", "outerwear", "accessory"]
        candidates = {}
        style_query = f"{request.style_preference} for {request.occasion}"
        style_query_embedding = self.model.encode(style_query, convert_to_numpy=True)

        # Apply global filters first
        weather_filtered = self.filter_by_weather(request.wardrobe, request.temperature_celsius)
        color_filtered = self.filter_by_color(weather_filtered, request.avoid_colors)

        for category in categories:
            # Filter by category
            category_items = [
                item for item in color_filtered if item.category == category
            ]

            # Apply occasion/formality filter
            occasion_filtered = self.filter_by_occasion(
                category_items, request.occasion, request.formality_level
            )

            # If no candidates after strict filtering, relax occasion filter and retry once
            if not occasion_filtered:
                print(f"Warning: No {category} items after occasion filtering, relaxing constraint")
                occasion_filtered = [
                    item for item in category_items if not item.occasion_tags
                ]

            # Rank by semantic similarity to user's style preference
            ranked = self.rank_by_similarity(
                occasion_filtered,
                style_query,
                style_query_embedding,
            )

            candidates[category] = ranked

        return candidates
