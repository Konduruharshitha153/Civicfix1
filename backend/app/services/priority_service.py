from datetime import datetime
from typing import Dict, Any

def calculate_priority(severity: str, affected_count: int, age_hours: float = 0.0) -> Dict[str, Any]:
    """
    Computes priority based on severity, affected citizens, and report age.
    """
    # 1. Severity weight
    severity_weights = {
        "Critical": 50,
        "High": 35,
        "Medium": 20,
        "Low": 10
    }
    sev_score = severity_weights.get(severity, 20)

    # 2. Affected citizen population
    if affected_count >= 100:
        affected_score = 35
    elif affected_count >= 25:
        affected_score = 25
    elif affected_count >= 6:
        affected_score = 15
    else:
        affected_score = 5

    # 3. Age escalation score (points added for older unaddressed reports)
    if age_hours > 72:
        age_score = 25
    elif age_hours > 48:
        age_score = 15
    elif age_hours > 24:
        age_score = 8
    else:
        age_score = 0

    total_score = sev_score + affected_score + age_score

    # Determine final Priority Tier
    if total_score >= 70:
        priority_label = "Critical"
    elif total_score >= 45:
        priority_label = "High"
    elif total_score >= 25:
        priority_label = "Medium"
    else:
        priority_label = "Low"

    return {
        "priority": priority_label,
        "score": total_score,
        "breakdown": {
            "severity_score": sev_score,
            "affected_population_score": affected_score,
            "aging_escalation_score": age_score
        }
    }
