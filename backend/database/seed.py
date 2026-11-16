import os
import sys
from datetime import datetime, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from app.extensions import db
from app.models.department import Department
from app.models.category import Category
from app.models.user import User
from app.models.complaint import Complaint
from app.models.status_history import StatusHistory
from app.models.assignment import Assignment
from app.models.notification import Notification

app = create_app()

def seed():
    with app.app_context():
        print("🌱 Initializing database schema...")
        db.create_all()

        # 1. Departments
        print("🏢 Seeding departments...")
        dept_data = [
            {"id": 1, "name": "Solid Waste Management & Sanitation", "code": "SWM", "description": "Street sweeping, garbage collection, and community dump clearance", "contact_email": "sanitation@civicfix.org", "head_name": "Dr. Ramesh Kumar", "sla_hours": 24},
            {"id": 2, "name": "Roads, Potholes & Infrastructure", "code": "ROADS", "description": "Road surface repairs, crater filling, and pedestrian walkways", "contact_email": "roads@civicfix.org", "head_name": "Er. Priya Sundaram", "sla_hours": 48},
            {"id": 3, "name": "Electricity & Street Lighting", "code": "ELEC", "description": "Public illumination, LED luminaires, and street power infrastructure", "contact_email": "electricity@civicfix.org", "head_name": "Er. Anil Mehta", "sla_hours": 24},
            {"id": 4, "name": "Water Supply & Sewerage Board", "code": "BWSSB", "description": "Drinking water pipelines, sewer clearing, and stormwater maintenance", "contact_email": "water@civicfix.org", "head_name": "Smt. Kavitha Reddy", "sla_hours": 36},
            {"id": 5, "name": "Public Amenities & Parks", "code": "PARKS", "description": "Parks, municipal gardens, public shelters, and playground facilities", "contact_email": "amenities@civicfix.org", "head_name": "Shri Rajesh Verma", "sla_hours": 72}
        ]

        for d in dept_data:
            existing = Department.query.get(d["id"])
            if not existing:
                dept = Department(**d)
                db.session.add(dept)
        db.session.commit()

        # 2. Users
        print("👥 Seeding users...")
        user_data = [
            {"email": "admin@civicfix.org", "name": "CivicFix Administrator", "role": "admin", "dept": None, "phone": "+91 98450 11223"},
            {"email": "staff@civicfix.org", "name": "Kiran Sharma (Sanitation Staff)", "role": "staff", "dept": 1, "phone": "+91 98450 22334"},
            {"email": "roads.staff@civicfix.org", "name": "Deepak Gowda (Roads Engineer)", "role": "staff", "dept": 2, "phone": "+91 98450 33445"},
            {"email": "water.staff@civicfix.org", "name": "Mahesh Patil (Water Tech)", "role": "staff", "dept": 4, "phone": "+91 98450 66778"},
            {"email": "citizen@civicfix.org", "name": "Arun Swaminathan", "role": "citizen", "dept": None, "phone": "+91 98450 44556"},
            {"email": "sunita.citizen@civicfix.org", "name": "Sunita Rao", "role": "citizen", "dept": None, "phone": "+91 98450 55667"}
        ]

        for u in user_data:
            if not User.query.filter_by(email=u["email"]).first():
                user = User(
                    email=u["email"],
                    full_name=u["name"],
                    role=u["role"],
                    department_id=u["dept"],
                    phone=u["phone"]
                )
                user.set_password("Password123!")
                db.session.add(user)
        db.session.commit()

        # 3. Categories
        print("🏷️ Seeding categories...")
        cat_data = [
            {"id": 1, "dept": 1, "name": "Garbage Overflow & Waste Dumping", "slug": "garbage-overflow", "priority": "High", "icon": "trash-2", "desc": "Unattended piles of trash, overflowing public dumpsters, illegal dumping", "kws": "garbage, waste, trash, dump, bin, filth, rotten, smell, odor, litter, plastic"},
            {"id": 2, "dept": 2, "name": "Potholes & Road Cavities", "slug": "potholes-road-damage", "priority": "High", "icon": "navigation", "desc": "Hazardous craters, peeled tarmac, depressions on roadways causing accidents", "kws": "pothole, crater, road broken, asphalt, tar, ditch, bump, uneven surface, cave-in"},
            {"id": 3, "dept": 3, "name": "Broken or Flickering Streetlights", "slug": "broken-streetlights", "priority": "Medium", "icon": "lightbulb", "desc": "Non-functional lamps, dark roads at night, dangling wire poles", "kws": "streetlight, light, dark, lamp, flickering, pole, wire, darkness, bulb, tube"},
            {"id": 4, "dept": 4, "name": "Drainage Overflow & Sewage Leak", "slug": "drainage-sewage-leak", "priority": "Critical", "icon": "droplets", "desc": "Blocked stormwater culverts, foul sewage on roads, open or broken manholes", "kws": "drain, sewage, manhole, gutter, clogged, dirty water, leak, stench, flooded, overflow"},
            {"id": 5, "dept": 4, "name": "Water Pipeline Burst & Contamination", "slug": "water-pipeline-burst", "priority": "High", "icon": "waves", "desc": "Leaking potable water main lines, contaminated or discolored drinking water", "kws": "water pipe, pipe burst, water supply, drinking water, muddy water, valve"},
            {"id": 6, "dept": 2, "name": "Damaged Footpath & Curbing", "slug": "damaged-footpath", "priority": "Medium", "icon": "footprints", "desc": "Broken walkway paver blocks, encroached sidewalk, uncovered storm slabs", "kws": "footpath, pavement, sidewalk, curb, tiles, pedestrian, walkway, slab"},
            {"id": 7, "dept": 5, "name": "Damaged Public Amenities & Parks", "slug": "public-amenities-parks", "priority": "Low", "icon": "tree-pine", "desc": "Broken benches, playground swings vandalized, destroyed bus shelters", "kws": "park, bench, bus shelter, swing, garden, railing, public toilet, playground"}
        ]

        for c in cat_data:
            existing = Category.query.get(c["id"])
            if not existing:
                cat = Category(
                    id=c["id"],
                    department_id=c["dept"],
                    name=c["name"],
                    slug=c["slug"],
                    description=c["desc"],
                    default_priority=c["priority"],
                    keywords=c["kws"],
                    icon=c["icon"]
                )
                db.session.add(cat)
        db.session.commit()

        # 4. Realistic Complaints (Sample Dataset)
        if Complaint.query.count() == 0:
            print("📝 Seeding sample civic complaints with real coordinates & timelines...")
            now = datetime.utcnow()
            citizen1 = User.query.filter_by(email="citizen@civicfix.org").first()
            citizen2 = User.query.filter_by(email="sunita.citizen@civicfix.org").first()
            staff1 = User.query.filter_by(email="staff@civicfix.org").first()
            staff2 = User.query.filter_by(email="roads.staff@civicfix.org").first()
            admin = User.query.filter_by(email="admin@civicfix.org").first()

            complaints_seed = [
                {
                    "tracking": "CVX-2026-10101",
                    "user": citizen1,
                    "cat_id": 1,
                    "dept_id": 1,
                    "title": "Severe garbage overflow near 100ft Road Metro Pillar 42",
                    "desc": "Garbage has not been collected for the last 4 days. Waste is spilling over onto the main road causing severe foul smell and attracting stray animals.",
                    "status": "In Progress",
                    "priority": "High",
                    "severity": "High",
                    "affected": 45,
                    "lat": 12.9756,
                    "lon": 77.6402,
                    "address": "100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru",
                    "landmark": "Opposite Metro Pillar 42",
                    "image": "https://images.unsplash.com/photo-1611288875662-841f32a76ef4?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(days=2, hours=4),
                    "ai_conf": 0.94,
                    "ai_cat": "Garbage Overflow & Waste Dumping"
                },
                {
                    "tracking": "CVX-2026-10102",
                    "user": citizen2,
                    "cat_id": 1,
                    "dept_id": 1,
                    "title": "Huge pile of trash dumped on 100 Feet Road pavement",
                    "desc": "Trash bags dumped on pedestrian sidewalk near pillar 43 Indiranagar, very unhygienic and blocking passage.",
                    "status": "Submitted",
                    "priority": "High",
                    "severity": "High",
                    "affected": 30,
                    "lat": 12.9758,
                    "lon": 77.6405, # ~40 meters away from 10101 -> Hotspot and Duplicate Candidate!
                    "address": "100 Feet Rd, Indiranagar, Bengaluru",
                    "landmark": "Near Pillar 43",
                    "image": "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(hours=8),
                    "ai_conf": 0.91,
                    "ai_cat": "Garbage Overflow & Waste Dumping"
                },
                {
                    "tracking": "CVX-2026-10201",
                    "user": citizen1,
                    "cat_id": 2,
                    "dept_id": 2,
                    "title": "Deep dangerous pothole right after Koramangala 80ft Road signal",
                    "desc": "A 2-foot wide and 6-inch deep crater opened up right after heavy rains. Multiple two-wheelers skidded yesterday evening.",
                    "status": "Assigned",
                    "priority": "Critical",
                    "severity": "Critical",
                    "affected": 120,
                    "lat": 12.9352,
                    "lon": 77.6245,
                    "address": "80 Feet Rd, 4th Block, Koramangala, Bengaluru",
                    "landmark": "Near Sony World Junction",
                    "image": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(days=1, hours=6),
                    "ai_conf": 0.96,
                    "ai_cat": "Potholes & Road Cavities"
                },
                {
                    "tracking": "CVX-2026-10202",
                    "user": citizen2,
                    "cat_id": 2,
                    "dept_id": 2,
                    "title": "Road crater near Sony World traffic junction",
                    "desc": "Road surface is broken and peeled off creating an accident hazard near Sony World signal.",
                    "status": "Verified",
                    "priority": "High",
                    "severity": "High",
                    "affected": 80,
                    "lat": 12.9355,
                    "lon": 77.6248, # ~50m from 10201 -> Road Hotspot
                    "address": "80 Feet Rd, Koramangala, Bengaluru",
                    "landmark": "Sony World Signal",
                    "image": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(hours=14),
                    "ai_conf": 0.92,
                    "ai_cat": "Potholes & Road Cavities"
                },
                {
                    "tracking": "CVX-2026-10301",
                    "user": citizen2,
                    "cat_id": 3,
                    "dept_id": 3,
                    "title": "Dark stretch of road due to 4 broken streetlights on 12th Main",
                    "desc": "Street lights from house #14 to #28 have been unlit for a week. Woman pedestrians feel unsafe walking home from the bus stop.",
                    "status": "Resolved",
                    "priority": "Medium",
                    "severity": "Medium",
                    "affected": 60,
                    "lat": 12.9698,
                    "lon": 77.6433,
                    "address": "12th Main Rd, HAL 2nd Stage, Indiranagar, Bengaluru",
                    "landmark": "Near Public Library",
                    "image": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(days=4),
                    "resolved_ago": timedelta(hours=18),
                    "ai_conf": 0.89,
                    "ai_cat": "Broken or Flickering Streetlights",
                    "res_notes": "Replacement of 4 blown 70W LED fixtures and tightened terminal connections in the junction feeder box."
                },
                {
                    "tracking": "CVX-2026-10401",
                    "user": citizen1,
                    "cat_id": 4,
                    "dept_id": 4,
                    "title": "Open manhole with overflowing drainage water on Commercial Street",
                    "desc": "Heavy sewage backing up through missing manhole cover. Poses serious health risk and vehicle hazard.",
                    "status": "Verified",
                    "priority": "Critical",
                    "severity": "Critical",
                    "affected": 200,
                    "lat": 12.9822,
                    "lon": 77.6083,
                    "address": "Commercial Street, Tasker Town, Shivaji Nagar, Bengaluru",
                    "landmark": "Cross Road 2 Corner",
                    "image": "https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(hours=19),
                    "ai_conf": 0.98,
                    "ai_cat": "Drainage Overflow & Sewage Leak"
                },
                {
                    "tracking": "CVX-2026-10402",
                    "user": citizen2,
                    "cat_id": 4,
                    "dept_id": 4,
                    "title": "Blocked storm drain causing waterlogging on Commercial St lane",
                    "desc": "Sewage and dirty water pooling on the pavement due to blocked culvert.",
                    "status": "Submitted",
                    "priority": "High",
                    "severity": "High",
                    "affected": 150,
                    "lat": 12.9825,
                    "lon": 77.6087, # Commercial Street drainage hotspot
                    "address": "Commercial Street, Bengaluru",
                    "landmark": "Near Clothing Bazaar",
                    "image": "https://images.unsplash.com/photo-1520690214124-2405c5217036?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(hours=5),
                    "ai_conf": 0.93,
                    "ai_cat": "Drainage Overflow & Sewage Leak"
                },
                {
                    "tracking": "CVX-2026-10501",
                    "user": citizen1,
                    "cat_id": 5,
                    "dept_id": 4,
                    "title": "Water pipeline burst causing huge stream across HSR Sector 2",
                    "desc": "Fresh drinking water pipeline ruptured beneath the sidewalk. Thousands of liters of water wasting continuously.",
                    "status": "In Progress",
                    "priority": "High",
                    "severity": "High",
                    "affected": 90,
                    "lat": 12.9116,
                    "lon": 77.6521,
                    "address": "24th Main, HSR Layout Sector 2, Bengaluru",
                    "landmark": "Near BDA Complex",
                    "image": "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(days=1, hours=2),
                    "ai_conf": 0.95,
                    "ai_cat": "Water Pipeline Burst & Contamination"
                },
                {
                    "tracking": "CVX-2026-10601",
                    "user": citizen2,
                    "cat_id": 6,
                    "dept_id": 2,
                    "title": "Broken pedestrian paver blocks causing tripping on MG Road",
                    "desc": "About 15 meters of sidewalk tiles are shattered and loose. Senior citizens are tripping and falling.",
                    "status": "Resolved",
                    "priority": "Medium",
                    "severity": "Medium",
                    "affected": 110,
                    "lat": 12.9749,
                    "lon": 77.6094,
                    "address": "Mahatma Gandhi Rd, Shanthala Nagar, Bengaluru",
                    "landmark": "Near Trinity Circle",
                    "image": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(days=5),
                    "resolved_ago": timedelta(days=1),
                    "ai_conf": 0.88,
                    "ai_cat": "Damaged Footpath & Curbing",
                    "res_notes": "Re-laid interlocking concrete pavers with sand bedding over 20-meter stretch."
                },
                {
                    "tracking": "CVX-2026-10701",
                    "user": citizen1,
                    "cat_id": 7,
                    "dept_id": 5,
                    "title": "Vandalized children swing set in Coles Park",
                    "desc": "Iron chains of two swings in the play area are snapped and sharp edges are exposed.",
                    "status": "Submitted",
                    "priority": "Low",
                    "severity": "Low",
                    "affected": 20,
                    "lat": 12.9982,
                    "lon": 77.6115,
                    "address": "Coles Park, Promenade Rd, Frazer Town, Bengaluru",
                    "landmark": "Children Play Enclosure",
                    "image": "https://images.unsplash.com/photo-1508873696983-2df5293cb32b?w=800&auto=format&fit=crop&q=60",
                    "created_ago": timedelta(hours=10),
                    "ai_conf": 0.84,
                    "ai_cat": "Damaged Public Amenities & Parks"
                }
            ]

            for s in complaints_seed:
                created_at = now - s["created_ago"]
                resolved_at = (now - s["resolved_ago"]) if "resolved_ago" in s else None
                
                comp = Complaint(
                    tracking_number=s["tracking"],
                    user_id=s["user"].id if s["user"] else None,
                    category_id=s["cat_id"],
                    department_id=s["dept_id"],
                    title=s["title"],
                    description=s["desc"],
                    status=s["status"],
                    priority=s["priority"],
                    severity=s["severity"],
                    affected_count=s["affected"],
                    latitude=s["lat"],
                    longitude=s["lon"],
                    address=s["address"],
                    landmark=s["landmark"],
                    image_url=s["image"],
                    ai_confidence=s["ai_conf"],
                    ai_suggested_category=s["ai_cat"],
                    resolution_notes=s.get("res_notes"),
                    created_at=created_at,
                    updated_at=created_at,
                    resolved_at=resolved_at
                )
                db.session.add(comp)
                db.session.flush()

                # Build realistic status history progression
                h1 = StatusHistory(
                    complaint_id=comp.id,
                    old_status=None,
                    new_status="Submitted",
                    changed_by_user_id=s["user"].id if s["user"] else None,
                    notes="Report submitted by citizen with location coordinates & photo evidence.",
                    created_at=created_at
                )
                db.session.add(h1)

                if comp.status in ["Verified", "Assigned", "In Progress", "Resolved"]:
                    h2 = StatusHistory(
                        complaint_id=comp.id,
                        old_status="Submitted",
                        new_status="Verified",
                        changed_by_user_id=admin.id,
                        notes="Complaint verified by municipal moderator. Priority confirmed.",
                        created_at=created_at + timedelta(hours=2)
                    )
                    db.session.add(h2)

                if comp.status in ["Assigned", "In Progress", "Resolved"]:
                    assignee = staff1 if comp.department_id == 1 else staff2
                    assign = Assignment(
                        complaint_id=comp.id,
                        assigned_to_user_id=assignee.id,
                        assigned_by_user_id=admin.id,
                        notes="Assigned for on-ground team inspection.",
                        created_at=created_at + timedelta(hours=4)
                    )
                    db.session.add(assign)
                    h3 = StatusHistory(
                        complaint_id=comp.id,
                        old_status="Verified",
                        new_status="Assigned",
                        changed_by_user_id=admin.id,
                        notes=f"Dispatched to field crew led by {assignee.full_name}.",
                        created_at=created_at + timedelta(hours=4)
                    )
                    db.session.add(h3)

                if comp.status in ["In Progress", "Resolved"]:
                    assignee = staff1 if comp.department_id == 1 else staff2
                    h4 = StatusHistory(
                        complaint_id=comp.id,
                        old_status="Assigned",
                        new_status="In Progress",
                        changed_by_user_id=assignee.id,
                        notes="Field maintenance team arrived on site with equipment.",
                        created_at=created_at + timedelta(hours=7)
                    )
                    db.session.add(h4)

                if comp.status == "Resolved":
                    assignee = staff1 if comp.department_id == 1 else staff2
                    h5 = StatusHistory(
                        complaint_id=comp.id,
                        old_status="In Progress",
                        new_status="Resolved",
                        changed_by_user_id=assignee.id,
                        notes=comp.resolution_notes or "Remediation verified and signed off.",
                        created_at=resolved_at or now
                    )
                    db.session.add(h5)

                # Add sample notification for the user
                if s["user"]:
                    notif = Notification(
                        user_id=s["user"].id,
                        complaint_id=comp.id,
                        title=f"Status Update: {comp.status}",
                        message=f"Your complaint '{comp.title}' has reached '{comp.status}'.",
                        notification_type="status_change",
                        is_read=False,
                        created_at=created_at + timedelta(hours=2)
                    )
                    db.session.add(notif)

            db.session.commit()
            print("✅ Successfully seeded 10 sample civic complaints and histories!")

        print("🎉 Database initialization and seeding complete.")

if __name__ == "__main__":
    seed()
