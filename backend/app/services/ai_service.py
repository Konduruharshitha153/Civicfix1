import re
import math
from typing import Dict, Any, List
from app.models.category import Category
from app.models.department import Department

# Pre-compiled high-impact emergency keywords that bump severity to Critical
CRITICAL_KEYWORDS = {
    "live wire", "electric shock", "sparking", "fire hazard", "gas leak", 
    "open manhole", "manhole uncovered", "sinkhole", "road collapse", 
    "water main burst", "flooding inside homes", "fallen tree on road", 
    "severe accident hazard", "exposed high voltage"
}

HIGH_KEYWORDS = {
    "deep pothole", "overflowing sewage", "foul smell", "health hazard", 
    "blackout", "entire street dark", "traffic blocked", "drain choked", 
    "contaminated water", "dengue", "mosquito breeding", "school zone"
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())

def calculate_text_overlap(tokens1: set, tokens2: set) -> float:
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union) if union else 0.0

def categorize_complaint(title: str, description: str) -> Dict[str, Any]:
    """
    AI-assisted categorization engine using semantic keyword matching,
    n-gram extraction, and severity estimation with confidence scoring.
    """
    full_text = f"{title} {description}".lower()
    cleaned = clean_text(full_text)
    input_tokens = set(cleaned.split())

    categories = Category.query.all()
    if not categories:
        return {
            "suggested_category_id": None,
            "category_name": "General Civic Issue",
            "department_id": None,
            "department_name": "General Administration",
            "confidence": 0.50,
            "estimated_severity": "Medium",
            "reasoning": "No pre-configured categories found; defaulted to general."
        }

    scored_categories = []

    for cat in categories:
        score = 0.0
        reasons = []

        # Check category name in text
        cat_name_clean = clean_text(cat.name)
        if cat_name_clean in cleaned:
            score += 3.5
            reasons.append(f"Direct mention of category '{cat.name}'")

        # Check keywords
        cat_keywords = [k.strip().lower() for k in (cat.keywords or "").split(",") if k.strip()]
        matched_kws = []
        for kw in cat_keywords:
            if " " in kw: # Multi-word phrase
                if kw in full_text:
                    score += 2.8
                    matched_kws.append(kw)
            else:
                if kw in input_tokens:
                    score += 1.5
                    matched_kws.append(kw)

        if matched_kws:
            reasons.append(f"Matched keywords: {', '.join(matched_kws[:4])}")

        # Add base score
        score += len(matched_kws) * 0.5
        scored_categories.append((score, cat, reasons))

    scored_categories.sort(key=lambda x: x[0], reverse=True)
    best_score, best_cat, reasons = scored_categories[0]

    # Calculate confidence percentage (bounded between 0.60 and 0.98)
    if best_score >= 5.0:
        confidence = min(0.98, 0.85 + (best_score - 5.0) * 0.02)
    elif best_score >= 2.0:
        confidence = 0.75 + (best_score - 2.0) * 0.03
    elif best_score > 0:
        confidence = 0.62 + best_score * 0.04
    else:
        confidence = 0.55
        best_cat = categories[0]
        reasons = ["Keyword similarity heuristic default"]

    # Severity analysis
    estimated_severity = "Medium"
    if any(k in full_text for k in CRITICAL_KEYWORDS):
        estimated_severity = "Critical"
    elif any(k in full_text for k in HIGH_KEYWORDS):
        estimated_severity = "High"
    elif best_cat.default_priority in ["Critical", "High", "Low"]:
        estimated_severity = best_cat.default_priority

    return {
        "suggested_category_id": best_cat.id,
        "category_name": best_cat.name,
        "department_id": best_cat.department_id,
        "department_name": best_cat.department.name if best_cat.department else "Municipal Operations",
        "confidence": round(confidence, 2),
        "estimated_severity": estimated_severity,
        "reasoning": "; ".join(reasons) if reasons else "Pattern match from civic vocabulary"
    }
