from typing import Any, Dict, List


UPPERWEAR_TYPES = {"shirt", "tshirt", "t-shirt", "blouse", "hoodie", "jacket", "sweater", "top"}
BOTTOMWEAR_TYPES = {"pants", "trousers", "jeans", "shorts", "skirt", "bottom"}


def normalize(value: Any) -> str:
    return str(value or "").strip().lower()


def resolve_category(item: Dict[str, Any]) -> str:
    category = normalize(item.get("category"))
    if category in {"upperwear", "bottomwear"}:
        return category

    item_type = normalize(item.get("type"))
    if item_type in UPPERWEAR_TYPES:
        return "upperwear"
    if item_type in BOTTOMWEAR_TYPES:
        return "bottomwear"

    return ""


def pick_pair(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    upperwear_item = next((item for item in items if resolve_category(item) == "upperwear"), None)
    bottomwear_item = next((item for item in items if resolve_category(item) == "bottomwear"), None)

    return [item for item in [upperwear_item, bottomwear_item] if item]


def suggest_outfit(wardrobe: List[Dict[str, Any]], weather: str, occasion: str) -> Dict[str, Any]:
    """Placeholder AI logic: this can be replaced with a real ML model later."""
    normalized_occasion = normalize(occasion)

    filtered = [
        item
        for item in wardrobe
        if normalize(item.get("occasion", "")) == normalized_occasion
    ]

    source = filtered if filtered else wardrobe
    suggested = pick_pair(source)

    if len(suggested) < 2 and filtered:
        # If filtered items miss a category, use full wardrobe to complete top/bottom pair.
        suggested = pick_pair(wardrobe)

    if len(suggested) < 2:
        notes = (
            "Mock AI could not find both categories. Please add at least one upperwear "
            "and one bottomwear item to your wardrobe."
        )
    else:
        notes = (
            f"Mock AI selected one upperwear and one bottomwear item for "
            f"weather='{weather}' and occasion='{occasion}'."
        )

    return {
        "strategy": "mock-ai",
        "items": suggested,
        "notes": notes,
    }
