from app.services.image_builder import strokes_to_image


def recognize_strokes(strokes: list, image: bytes | None = None) -> dict:
    """Dummy OCR endpoint with future hooks for Vision APIs or local OCR models."""
    if image is None:
        image = strokes_to_image(strokes)

    all_points = [point for stroke in strokes for point in stroke.get("points", [])]
    if not all_points:
        return {"text": "", "bounding_box": {"left": 0, "top": 0, "width": 0, "height": 0}}

    xs = [point["x"] for point in all_points]
    ys = [point["y"] for point in all_points]

    return {
        "text": "hello",
        "bounding_box": {
            "left": min(xs),
            "top": min(ys),
            "width": max(xs) - min(xs),
            "height": max(ys) - min(ys),
        },
        "provider": "dummy",
        "future_hooks": ["google_vision", "shape_detection", "auth", "cloud_sync"],
        "image_bytes": len(image),
    }
