import base64
import io
import os
from threading import Thread
from typing import Dict, List, Tuple

import numpy as np
from PIL import Image


CATEGORY_LABELS = [
    "upperwear",
    "bottomwear",
    "footwear",
]

TYPE_LABELS = [
    "t-shirt",
    "shirt",
    "blouse",
    "hoodie",
    "sweater",
    "jacket",
    "jeans",
    "pants",
    "trousers",
    "shorts",
    "skirt",
    "dress",
    "shoes",
    "sneakers",
    "boots",
]

SEASON_LABELS = ["summer", "winter", "spring", "fall"]
OCCASION_LABELS = ["casual", "formal", "party", "sport"]

COLOR_MAP: Dict[str, Tuple[int, int, int]] = {
    "black": (30, 30, 30),
    "white": (235, 235, 235),
    "gray": (140, 140, 140),
    "red": (190, 60, 55),
    "orange": (214, 129, 60),
    "yellow": (221, 192, 72),
    "green": (92, 150, 92),
    "blue": (70, 110, 175),
    "purple": (125, 100, 175),
    "pink": (215, 140, 170),
    "brown": (130, 95, 65),
    "beige": (205, 185, 150),
}

_TYPE_TO_CATEGORY = {
    "t-shirt": "upperwear",
    "shirt": "upperwear",
    "blouse": "upperwear",
    "hoodie": "upperwear",
    "sweater": "upperwear",
    "jacket": "upperwear",
    "jeans": "bottomwear",
    "pants": "bottomwear",
    "trousers": "bottomwear",
    "shorts": "bottomwear",
    "skirt": "bottomwear",
    "dress": "upperwear",
    "shoes": "footwear",
    "sneakers": "footwear",
    "boots": "footwear",
}

_classifier = None

USE_CLIP_MODEL = os.getenv("AI_SERVICE_USE_CLIP", "true").lower() == "true"


def _decode_image(image_base64: str) -> Image.Image:
    payload = image_base64
    if "," in image_base64:
        payload = image_base64.split(",", 1)[1]

    image_bytes = base64.b64decode(payload)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    return image


def _nearest_color_name(rgb: Tuple[float, float, float]) -> Tuple[str, float]:
    r, g, b = rgb
    best_name = "black"
    best_distance = float("inf")
    for name, ref in COLOR_MAP.items():
        distance = ((r - ref[0]) ** 2 + (g - ref[1]) ** 2 + (b - ref[2]) ** 2) ** 0.5
        if distance < best_distance:
            best_distance = distance
            best_name = name

    confidence = max(0.1, 1.0 - min(best_distance, 255) / 255)
    return best_name, round(confidence, 3)


def _dominant_color(image: Image.Image) -> Tuple[str, float]:
    image_small = image.resize((128, 128))
    data = np.asarray(image_small, dtype=np.float32).reshape(-1, 3)

    brightness = data.mean(axis=1)
    saturation = data.max(axis=1) - data.min(axis=1)

    # Ignore near-white and near-black background pixels where possible.
    keep_mask = (brightness > 25) & (brightness < 245) & (saturation > 8)
    filtered = data[keep_mask]
    if filtered.size == 0:
        filtered = data

    rgb_mean = tuple(filtered.mean(axis=0).tolist())
    return _nearest_color_name(rgb_mean)


def _get_classifier():
    global _classifier
    if _classifier is not None:
        return _classifier

    if not USE_CLIP_MODEL:
        return None

    try:
        from transformers import pipeline

        _classifier = pipeline(
            task="zero-shot-image-classification",
            model="openai/clip-vit-base-patch32",
        )
    except Exception:
        _classifier = None

    return _classifier


def warm_classifier_async() -> None:
    if not USE_CLIP_MODEL:
        return

    def _warm() -> None:
        _get_classifier()

    Thread(target=_warm, daemon=True).start()


def _predict_label(image: Image.Image, labels: List[str]) -> Tuple[str, float]:
    classifier = _get_classifier()
    if classifier is None:
        return labels[0], 0.25

    try:
        output = classifier(image, candidate_labels=labels)
        if not output:
            return labels[0], 0.25

        top = output[0]
        return str(top["label"]), round(float(top["score"]), 3)
    except Exception:
        return labels[0], 0.25


def _foreground_mask(data: np.ndarray) -> np.ndarray:
    brightness = data.mean(axis=1)
    saturation = data.max(axis=1) - data.min(axis=1)
    return (brightness < 245) & (saturation > 10)


def _shape_heuristics(image: Image.Image) -> Tuple[str, str, str, str, float]:
    image_small = image.resize((192, 192))
    data = np.asarray(image_small, dtype=np.float32).reshape(-1, 3)
    mask = _foreground_mask(data)

    if not mask.any():
        mask = np.ones(len(data), dtype=bool)

    coords = np.argwhere(mask.reshape(192, 192))
    top, left = coords.min(axis=0)
    bottom, right = coords.max(axis=0)
    bbox_height = max(1, bottom - top + 1)
    bbox_width = max(1, right - left + 1)
    aspect_ratio = bbox_width / bbox_height
    area_ratio = mask.mean()

    if aspect_ratio > 1.15:
        item_type = "t-shirt"
        category = "upperwear"
        season = "summer"
        occasion = "casual"
        confidence = 0.54
    elif aspect_ratio < 0.85:
        item_type = "pants"
        category = "bottomwear"
        season = "winter"
        occasion = "casual"
        confidence = 0.52
    elif area_ratio > 0.38:
        item_type = "jacket"
        category = "upperwear"
        season = "winter"
        occasion = "casual"
        confidence = 0.49
    else:
        item_type = "shirt"
        category = "upperwear"
        season = "spring"
        occasion = "casual"
        confidence = 0.5

    if image.height > image.width * 1.15:
        item_type = "dress"
        category = "upperwear"
        season = "summer" if aspect_ratio > 0.9 else "spring"
        occasion = "party"
        confidence = max(confidence, 0.56)

    return item_type, category, season, occasion, confidence


def analyze_clothing_image(image_base64: str) -> Dict[str, object]:
    image = _decode_image(image_base64)

    predicted_color, color_conf = _dominant_color(image)
    predicted_type, predicted_category, predicted_season, predicted_occasion, heuristic_conf = _shape_heuristics(image)

    # Optional CLIP path: only used if explicitly enabled and already available.
    predicted_type_model, type_conf = _predict_label(image, TYPE_LABELS)
    predicted_category_model, category_conf = _predict_label(image, CATEGORY_LABELS)
    predicted_season_model, season_conf = _predict_label(image, SEASON_LABELS)
    predicted_occasion_model, occasion_conf = _predict_label(image, OCCASION_LABELS)

    if USE_CLIP_MODEL and type_conf > 0.6:
        predicted_type = predicted_type_model
    if USE_CLIP_MODEL and category_conf > 0.6:
        predicted_category = predicted_category_model
    if USE_CLIP_MODEL and season_conf > 0.6:
        predicted_season = predicted_season_model
    if USE_CLIP_MODEL and occasion_conf > 0.6:
        predicted_occasion = predicted_occasion_model

    type_conf = max(type_conf, heuristic_conf)
    category_conf = max(category_conf, heuristic_conf)
    season_conf = max(season_conf, 0.45)
    occasion_conf = max(occasion_conf, 0.45)

    return {
        "strategy": "phase1-fast-heuristic-plus-color",
        "type": predicted_type,
        "category": predicted_category,
        "color": predicted_color,
        "season": predicted_season,
        "occasion": predicted_occasion,
        "confidence": {
            "type": type_conf,
            "category": category_conf,
            "color": color_conf,
            "season": season_conf,
            "occasion": occasion_conf,
        },
        "notes": "Phase 1 inference uses fast image heuristics and dominant-color extraction. Enable AI_SERVICE_USE_CLIP=true for optional CLIP refinement.",
    }
