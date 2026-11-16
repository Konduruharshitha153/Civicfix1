import math
from typing import List, Dict, Any, Optional
from app.models.complaint import Complaint
from app.services.ai_service import clean_text

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great circle distance between two points on Earth in meters.
    """
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return R * c

def compute_text_similarity(text1: str, text2: str) -> float:
    tokens1 = set(clean_text(text1).split())
    tokens2 = set(clean_text(text2).split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union) if union else 0.0

def find_potential_duplicates(
    latitude: float,
    longitude: float,
    title: str,
    description: str,
    category_id: Optional[int] = None,
    exclude_id: Optional[int] = None,
    max_radius_meters: float = 350.0
) -> List[Dict[str, Any]]:
    """
    Detects potential duplicate civic complaints within a spatial radius,
    evaluating category alignment and textual overlap.
    """
    query = Complaint.query.filter(
        Complaint.status.in_(["Submitted", "Verified", "Assigned", "In Progress"])
    )
    if exclude_id:
        query = query.filter(Complaint.id != exclude_id)

    candidates = query.all()
    duplicates = []

    full_input_text = f"{title} {description}"

    for candidate in candidates:
        dist = haversine_distance_meters(latitude, longitude, candidate.latitude, candidate.longitude)
        
        # Check if candidate falls within spatial neighborhood
        if dist <= max_radius_meters:
            cand_text = f"{candidate.title} {candidate.description}"
            text_sim = compute_text_similarity(full_input_text, cand_text)
            category_match = (category_id is not None and candidate.category_id == category_id)

            # Proximity weighting: closer reports get higher confidence
            dist_factor = max(0.0, 1.0 - (dist / max_radius_meters))
            
            # Composite match calculation
            match_score = 0.0
            if category_match:
                match_score += 0.40
            match_score += text_sim * 0.40
            match_score += dist_factor * 0.20

            # If match score exceeds threshold, flag as potential duplicate
            if match_score >= 0.40 or (dist <= 100.0 and category_match):
                duplicates.append({
                    "id": candidate.id,
                    "tracking_number": candidate.tracking_number,
                    "title": candidate.title,
                    "status": candidate.status,
                    "category_name": candidate.category.name if candidate.category else None,
                    "distance_meters": round(dist, 1),
                    "text_similarity": round(text_sim * 100, 1),
                    "overall_match_percentage": min(99, int(round(match_score * 100))),
                    "created_at": candidate.created_at.isoformat() if candidate.created_at else None,
                    "image_url": candidate.image_url,
                    "address": candidate.address
                })

    # Sort descending by match score
    duplicates.sort(key=lambda x: x["overall_match_percentage"], reverse=True)
    return duplicates
