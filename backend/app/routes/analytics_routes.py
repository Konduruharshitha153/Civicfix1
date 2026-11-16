from flask import Blueprint, jsonify, request
from app.services.hotspot_service import identify_recurring_hotspots

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/analytics")

@analytics_bp.route("/hotspots", methods=["GET"])
def get_hotspots():
    radius_meters = float(request.args.get("radius", 350.0))
    min_complaints = int(request.args.get("min_complaints", 2))
    
    hotspots = identify_recurring_hotspots(
        cluster_radius_meters=radius_meters,
        min_complaints=min_complaints
    )

    return jsonify({
        "hotspots_count": len(hotspots),
        "hotspots": hotspots,
        "methodology": "Spatial proximity clustering with explainable preventive maintenance factor attribution."
    }), 200
