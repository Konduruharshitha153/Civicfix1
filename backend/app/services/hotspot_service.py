from typing import List, Dict, Any
from app.models.complaint import Complaint
from app.services.duplicate_service import haversine_distance_meters

def identify_recurring_hotspots(cluster_radius_meters: float = 350.0, min_complaints: int = 2) -> List[Dict[str, Any]]:
    """
    Analyzes historical complaints, groups them into spatial hotspot clusters,
    and derives explainable preventive maintenance recommendations.
    """
    complaints = Complaint.query.order_by(Complaint.created_at.desc()).all()
    if not complaints:
        return []

    visited = set()
    clusters = []

    for c in complaints:
        if c.id in visited:
            continue

        cluster_members = [c]
        visited.add(c.id)

        for other in complaints:
            if other.id in visited:
                continue

            dist = haversine_distance_meters(c.latitude, c.longitude, other.latitude, other.longitude)
            if dist <= cluster_radius_meters:
                cluster_members.append(other)
                visited.add(other.id)

        if len(cluster_members) >= min_complaints:
            # Calculate centroid
            avg_lat = sum(m.latitude for m in cluster_members) / len(cluster_members)
            avg_lon = sum(m.longitude for m in cluster_members) / len(cluster_members)

            # Analyze categories in cluster
            category_counts = {}
            unresolved_count = 0
            for m in cluster_members:
                cat_name = m.category.name if m.category else "Uncategorized"
                category_counts[cat_name] = category_counts.get(cat_name, 0) + 1
                if m.status not in ["Resolved", "Rejected"]:
                    unresolved_count += 1

            dominant_category = max(category_counts.items(), key=lambda x: x[1])[0]

            # Formulate preventive maintenance recommendation and factors
            rec_info = generate_maintenance_recommendation(dominant_category, len(cluster_members), unresolved_count)

            clusters.append({
                "id": f"hotspot-{len(clusters) + 1}",
                "name": f"{dominant_category} Cluster at {cluster_members[0].address or cluster_members[0].landmark or 'Locality'}",
                "latitude": round(avg_lat, 6),
                "longitude": round(avg_lon, 6),
                "radius_meters": cluster_radius_meters,
                "total_complaints": len(cluster_members),
                "unresolved_complaints": unresolved_count,
                "dominant_category": dominant_category,
                "category_breakdown": category_counts,
                "complaint_ids": [m.id for m in cluster_members],
                "tracking_numbers": [m.tracking_number for m in cluster_members],
                "recommendation": rec_info["recommendation"],
                "factors": rec_info["factors"],
                "priority_level": rec_info["priority_level"],
                "estimated_budget_impact": rec_info["estimated_budget_impact"]
            })

    # Sort hotspots by urgency (total complaints + unresolved count)
    clusters.sort(key=lambda x: (x["unresolved_complaints"] * 2 + x["total_complaints"]), reverse=True)
    return clusters

def generate_maintenance_recommendation(category: str, total_count: int, unresolved_count: int) -> Dict[str, Any]:
    cat_lower = category.lower()

    if "drain" in cat_lower or "sewage" in cat_lower or "water" in cat_lower:
        return {
            "priority_level": "High" if unresolved_count > 2 else "Medium",
            "recommendation": "Perform scheduled silt dredging, upgrade culvert diameter, and install smart drainage flow telemetry.",
            "factors": [
                f"{total_count} water/drainage issues reported in this 350m perimeter.",
                "Sub-surface stormwater channels are likely undersized for peak monsoon runoff.",
                "High accumulation of solid silt and construction debris restricting gravity drainage."
            ],
            "estimated_budget_impact": "Moderate (Capital Desilting & Pipe Replacement)"
        }
    elif "pothole" in cat_lower or "road" in cat_lower:
        return {
            "priority_level": "Critical" if total_count >= 4 else "High",
            "recommendation": "Transition from reactive cold-patching to full-depth asphalt resurfacing and water-resistant bitumen layer.",
            "factors": [
                f"{total_count} road surface damage reports registered in proximity.",
                "Heavy traffic axle loads combined with poor water drainage causing sub-base degradation.",
                "Repeated localized patches have failed prematurely due to lack of compaction."
            ],
            "estimated_budget_impact": "Substantial (Road Reconstruction)"
        }
    elif "garbage" in cat_lower or "waste" in cat_lower or "sanitation" in cat_lower:
        return {
            "priority_level": "High",
            "recommendation": "Install twin 2.5-cubic-meter semi-underground waste bins and schedule twice-daily compactor truck routes.",
            "factors": [
                f"Chronic garbage overflow with {total_count} reports in recent cycles.",
                "Commercial or high-density residential footprint exceeding current collection frequency.",
                "Absence of covered waste enclosures causing wind scatter and stray animal foraging."
            ],
            "estimated_budget_impact": "Low-to-Medium (Bins & Route Optimization)"
        }
    elif "street" in cat_lower or "light" in cat_lower or "electr" in cat_lower:
        return {
            "priority_level": "Medium",
            "recommendation": "Replace aging mercury/sodium vapor fixtures with centralized IP66 LED luminaires and automated feeder pillar timers.",
            "factors": [
                f"{total_count} lighting failure incidents along this transit corridor.",
                "Fluctuating feeder line voltage causing premature driver burnout.",
                "Corroded overhead junction boxes vulnerable to weather ingress."
            ],
            "estimated_budget_impact": "Low (LED Retrofit & Surge Protectors)"
        }
    else:
        return {
            "priority_level": "Medium",
            "recommendation": "Schedule on-site multi-departmental field inspection and asset audit.",
            "factors": [
                f"Cluster of {total_count} recurring public infrastructure reports.",
                "Public utilization rate is higher than original asset design capacity."
            ],
            "estimated_budget_impact": "Variable based on asset scope"
        }
