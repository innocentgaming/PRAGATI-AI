import os
import sys
from datetime import date, datetime, timedelta
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Ensure root & apps/api are in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "apps", "api")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.models.entities import (
    User, Ministry, Department, Sector, State, Contractor, Project,
    ProjectMonthlyData, Milestone, RiskPrediction, RiskFactor,
    Alert, Document, DocumentChunk, Intervention, ModelVersion,
    AuditLog, Notification, ReportRecord
)
from app.core.security import get_password_hash
from ml.features.feature_builder import FeatureBuilder
from ml.models.cost.cost_model import CostOverrunPredictor
from ml.models.delay.delay_model import TimeOverrunPredictor
from ml.models.risk.risk_scorer import RiskScorer
from ml.explainability.explainer import SHAPExplainer
from rag.embeddings.embedder import VectorEmbedder

def seed_database():
    print("🌱 Initializing IPM Bharat Database & Seeding 100+ Infrastructure Records...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # 1. Seed Users
    print("Creating Demo Role Accounts...")
    users = [
        User(name="Ananya Sharma (Director IPMD)", email="officer@mospi.gov.in", password_hash=get_password_hash("Officer@123"), role="MONITORING_OFFICER"),
        User(name="Dr. Rajesh Verma", email="admin@mospi.gov.in", password_hash=get_password_hash("Admin@123"), role="ADMIN"),
        User(name="PMO Infrastructure Advisor", email="pmo@mospi.gov.in", password_hash=get_password_hash("Pmo@123"), role="PMO_OFFICER"),
        User(name="Suresh Kumar (Advisor)", email="dept@railways.gov.in", password_hash=get_password_hash("Dept@123"), role="DEPARTMENT_OFFICER"),
        User(name="Vikramaditya Rao (Chief Engineer)", email="pm@infra.gov.in", password_hash=get_password_hash("Pm@123"), role="PROJECT_MANAGER"),
        User(name="SIH Evaluation Judge", email="judge@sih.gov.in", password_hash=get_password_hash("Judge@123"), role="VIEWER"),
    ]
    db.add_all(users)
    db.commit()


    # 2. Seed Ministries & Departments
    print("Creating Ministries & Departments...")
    ministries_data = [
        {"name": "Ministry of Road Transport and Highways", "code": "MoRTH", "depts": ["National Highways Authority of India (NHAI)", "National Highways & Infrastructure Dev Corp (NHIDCL)"]},
        {"name": "Ministry of Railways", "code": "MoR", "depts": ["Railway Board Infrastructure Cell", "Dedicated Freight Corridor Corp (DFCCIL)", "National High Speed Rail Corp (NHSRCL)"]},
        {"name": "Ministry of Power", "code": "MoP", "depts": ["Central Electricity Authority (CEA)", "NTPC Infrastructure", "Power Grid Corporation (PGCIL)"]},
        {"name": "Ministry of Petroleum and Natural Gas", "code": "MoPNG", "depts": ["Gas Authority of India (GAIL)", "Indian Oil Infrastructure (IOCL)", "ONGC Projects"]},
        {"name": "Ministry of Jal Shakti", "code": "MoJS", "depts": ["National Water Development Agency", "Jal Jeevan Mission Cell", "Namami Gange Project"]},
        {"name": "Ministry of Health and Family Welfare", "code": "MoHFW", "depts": ["PMSSY AIIMS Infrastructure Division", "National Health Mission Infrastructure"]},
        {"name": "Ministry of Housing and Urban Affairs", "code": "MoHUA", "depts": ["Metro Rail Division", "Smart Cities Mission Cell", "CPWD Projects"]},
        {"name": "Ministry of Ports, Shipping and Waterways", "code": "MoPSW", "depts": ["Sagarmala Project Cell", "Inland Waterways Authority (IWAI)", "Major Ports Trust"]}
    ]

    ministry_objs = []
    dept_objs = []
    for m_data in ministries_data:
        m = Ministry(name=m_data["name"], code=m_data["code"])
        db.add(m)
        db.flush()
        ministry_objs.append(m)
        for d_name in m_data["depts"]:
            d = Department(ministry_id=m.id, name=d_name, code=d_name[:6].upper().replace(" ", ""))
            db.add(d)
            db.flush()
            dept_objs.append(d)
    db.commit()

    # 3. Seed Sectors
    print("Creating Infrastructure Sectors...")
    sector_names = [
        "Road Transport & Highways",
        "Railways",
        "Power & Renewable Energy",
        "Petroleum & Natural Gas",
        "Water Resources & Irrigation",
        "Health & Medical Infrastructure",
        "Urban Metro & Smart Cities",
        "Ports & Inland Shipping"
    ]
    sector_objs = []
    for s_name in sector_names:
        sec = Sector(name=s_name)
        db.add(sec)
        db.flush()
        sector_objs.append(sec)
    db.commit()

    # 4. Seed Indian States with GIS Centroids
    print("Creating Indian States with GIS Coordinates...")
    states_data = [
        {"name": "Maharashtra", "code": "MH", "lat": 19.7515, "lng": 75.7139},
        {"name": "Uttar Pradesh", "code": "UP", "lat": 26.8467, "lng": 80.9462},
        {"name": "Gujarat", "code": "GJ", "lat": 22.2587, "lng": 71.1924},
        {"name": "Karnataka", "code": "KA", "lat": 15.3173, "lng": 75.7139},
        {"name": "Tamil Nadu", "code": "TN", "lat": 11.1271, "lng": 78.6569},
        {"name": "Bihar", "code": "BR", "lat": 25.0961, "lng": 85.3131},
        {"name": "West Bengal", "code": "WB", "lat": 22.9868, "lng": 87.8550},
        {"name": "Madhya Pradesh", "code": "MP", "lat": 22.9734, "lng": 78.6569},
        {"name": "Rajasthan", "code": "RJ", "lat": 27.0238, "lng": 74.2179},
        {"name": "Andhra Pradesh", "code": "AP", "lat": 15.9129, "lng": 79.7400},
        {"name": "Telangana", "code": "TS", "lat": 18.1124, "lng": 79.0193},
        {"name": "Odisha", "code": "OD", "lat": 20.9517, "lng": 85.0985},
        {"name": "Kerala", "code": "KL", "lat": 10.8505, "lng": 76.2711},
        {"name": "Assam", "code": "AS", "lat": 26.2006, "lng": 92.9376},
        {"name": "Punjab", "code": "PB", "lat": 31.1471, "lng": 75.3412},
        {"name": "Haryana", "code": "HR", "lat": 29.0588, "lng": 76.0856},
        {"name": "Jammu & Kashmir", "code": "JK", "lat": 33.7782, "lng": 76.5762},
        {"name": "Delhi NCR", "code": "DL", "lat": 28.7041, "lng": 77.1025},
        {"name": "Chhattisgarh", "code": "CG", "lat": 21.2787, "lng": 81.8661},
        {"name": "Jharkhand", "code": "JH", "lat": 23.6102, "lng": 85.2799},
        {"name": "Uttarakhand", "code": "UK", "lat": 30.0668, "lng": 79.0193},
        {"name": "Himachal Pradesh", "code": "HP", "lat": 31.1048, "lng": 77.1734},
        {"name": "Goa", "code": "GA", "lat": 15.2993, "lng": 74.1240}
    ]

    state_objs = []
    for st_data in states_data:
        st = State(name=st_data["name"], code=st_data["code"], latitude=st_data["lat"], longitude=st_data["lng"])
        db.add(st)
        db.flush()
        state_objs.append(st)
    db.commit()

    # 5. Seed Major National Contractors
    print("Creating Leading National Infrastructure Contractors...")
    contractor_names = [
        ("Larsen & Toubro Ltd (L&T)", "Multi-Sector EPC", 94.5, "A+"),
        ("Tata Projects Limited", "Rail & Urban Metro", 91.0, "A+"),
        ("Dilip Buildcon Limited (DBL)", "Highways & Expressways", 87.2, "A"),
        ("Afcons Infrastructure", "Marine & Mega Bridges", 89.4, "A"),
        ("NCC Limited", "Water & Buildings", 83.0, "B"),
        ("PNC Infratech Ltd", "Highways & Runways", 85.5, "A"),
        ("HCC (Hindustan Construction Co)", "Hydro & Tunnels", 78.0, "B"),
        ("GMR Infrastructure", "Airports & Highways", 88.0, "A"),
        ("KEC International", "Power T&D & Railways", 90.2, "A+"),
        ("Shapoorji Pallonji EPC", "Health & Industrial", 82.5, "B")
    ]
    contractor_objs = []
    for c_name, c_sec, c_score, c_rat in contractor_names:
        c = Contractor(
            name=c_name,
            sector_specialization=c_sec,
            performance_score=c_score,
            total_projects=0,
            completed_projects=0,
            delayed_projects=0,
            total_contract_value=0.0,
            average_delay_days=18.5,
            rating=c_rat
        )
        db.add(c)
        db.flush()
        contractor_objs.append(c)
    db.commit()

    # 6. Generate 100+ Realistic Simulated Projects across India
    print("Generating 105 Realistic National Infrastructure Projects...")
    random.seed(42)

    project_templates = [
        # Roads & Highways (Sector idx 0)
        ("Delhi-Mumbai Expressway Package {i}", 0, 0, [0, 2, 8, 15, 17], 4500, 14500, "NHAI"),
        ("Bharatmala Pariyojana Economic Corridor Phase-{i}", 0, 0, [0, 1, 3, 4, 7, 8, 11], 2800, 9500, "NHAI"),
        ("Trans-Himalayan All-Weather Highway Package {i}", 0, 0, [16, 20, 21], 1800, 5200, "NHIDCL"),
        ("Greenfield Coastal Ring Expressway Corridor {i}", 0, 0, [0, 2, 4, 11, 12, 22], 3200, 8800, "NHAI"),
        # Railways (Sector idx 1)
        ("Dedicated Freight Corridor Super-Structure Package {i}", 1, 1, [0, 1, 2, 6, 8, 11], 6500, 18500, "DFCCIL"),
        ("Mumbai-Ahmedabad High Speed Rail Viaduct Segment {i}", 1, 1, [0, 2], 12000, 38000, "NHSRCL"),
        ("Strategic Railway Doubling & Electrification Phase {i}", 1, 1, [3, 4, 5, 7, 10, 13, 14], 1400, 4800, "Railway Board"),
        # Power & Renewable (Sector idx 2)
        ("Ultra Mega Renewable Solar & Wind Hybrid Energy Park {i}", 2, 2, [2, 7, 8, 10, 11], 2500, 7800, "NTPC / SECI"),
        ("Green Hydrogen Inter-State Transmission Grid Phase {i}", 2, 2, [0, 2, 3, 4, 18], 1900, 6200, "Power Grid PGCIL"),
        # Petroleum & Gas (Sector idx 3)
        ("National Gas Grid Pipeline Network Expansion Link {i}", 3, 3, [1, 5, 6, 11, 19], 3100, 9200, "GAIL India"),
        ("Strategic Petroleum Crude Oil Storage Cavern {i}", 3, 3, [4, 9, 11, 12], 4200, 8500, "ISPRL / IOCL"),
        # Water Resources (Sector idx 4)
        ("Jal Jeevan Mission Integrated Rural Drinking Water Network {i}", 4, 4, [1, 5, 7, 9, 10, 18], 1500, 4800, "State Water Board"),
        ("National Inter-Basin River Linking & Irrigation Reservoir {i}", 4, 4, [0, 7, 9, 11], 8500, 24000, "NWDA"),
        # Health & Medical (Sector idx 5)
        ("All India Institute of Medical Sciences (AIIMS) Phase-{i}", 5, 5, [1, 5, 13, 16, 18, 20], 1250, 2400, "HSCC / CPWD"),
        # Urban Metro (Sector idx 6)
        ("Metropolitan Rail Rapid Mass Transit Priority Line {i}", 6, 6, [0, 2, 3, 4, 6, 10, 17], 7200, 21000, "Metro Rail Corp"),
        # Ports & Shipping (Sector idx 7)
        ("Sagarmala Deepwater International Transhipment Terminal {i}", 7, 7, [0, 2, 4, 9, 11, 12, 22], 4800, 11500, "Major Port Authority")
    ]

    all_created_projects = []
    proj_code_counter = 1

    for base_name, min_idx, sec_idx, state_pool, cost_min, cost_max, agency_base in project_templates:
        # Create 6-7 packages/phases for each template
        for i in range(1, 8):
            code = f"PRJ-{proj_code_counter:03d}"
            name = base_name.format(i=i)
            st_idx = random.choice(state_pool)
            contractor = random.choice(contractor_objs)
            orig_cost = round(random.uniform(cost_min, cost_max), 2)
            
            # Risk & Delay simulation profile
            risk_roll = random.random()
            if risk_roll < 0.25:
                # Critical Risk / Delayed Project
                rev_cost = round(orig_cost * random.uniform(1.15, 1.45), 2)
                phys_prog = round(random.uniform(25.0, 55.0), 1)
                fin_prog = round(min(100.0, phys_prog + random.uniform(15.0, 32.0)), 1)
                status = "DELAYED"
                start_year = random.choice([2018, 2019, 2020])
                delay_months = round(random.uniform(8.0, 24.0), 1)
            elif risk_roll < 0.55:
                # Moderate / High Risk
                rev_cost = round(orig_cost * random.uniform(1.05, 1.18), 2)
                phys_prog = round(random.uniform(40.0, 75.0), 1)
                fin_prog = round(min(100.0, phys_prog + random.uniform(5.0, 15.0)), 1)
                status = "ONGOING"
                start_year = random.choice([2020, 2021, 2022])
                delay_months = round(random.uniform(3.0, 9.0), 1)
            else:
                # On Track / Low Risk
                rev_cost = orig_cost
                phys_prog = round(random.uniform(60.0, 95.0), 1)
                fin_prog = round(phys_prog * random.uniform(0.92, 1.02), 1)
                status = "ON_TRACK" if phys_prog < 90 else "COMPLETED"
                start_year = random.choice([2021, 2022, 2023])
                delay_months = 0.0

            cur_exp = round(rev_cost * (fin_prog / 100.0), 2)
            start_date = date(start_year, random.randint(1, 12), 1)
            orig_comp = start_date + timedelta(days=random.randint(730, 1460))
            rev_comp = orig_comp + timedelta(days=int(delay_months * 30.4)) if delay_months > 0 else None

            # Planned progress based on elapsed timeline
            total_duration = max(30, (orig_comp - start_date).days)
            elapsed_days = max(1, (date.today() - start_date).days)
            planned_phys = min(100.0, round(min(1.0, elapsed_days / total_duration) * 100.0, 1))

            proj = Project(
                project_code=code,
                project_name=name,
                ministry_id=ministry_objs[min_idx].id,
                department_id=dept_objs[min_idx].id,
                sector_id=sector_objs[sec_idx].id,
                state_id=state_objs[st_idx].id,
                contractor_id=contractor.id,
                implementing_agency=f"{agency_base} ({contractor.name[:10]})",
                original_cost=orig_cost,
                revised_cost=rev_cost,
                current_expenditure=cur_exp,
                committed_amount=round(rev_cost * 0.9, 2),
                start_date=start_date,
                original_completion_date=orig_comp,
                revised_completion_date=rev_comp,
                physical_progress=phys_prog,
                financial_progress=fin_prog,
                planned_physical_progress=planned_phys,
                project_status=status,
                source_type="DEMO",
                latitude=round(state_objs[st_idx].latitude + random.uniform(-0.8, 0.8), 4),
                longitude=round(state_objs[st_idx].longitude + random.uniform(-0.8, 0.8), 4)
            )
            db.add(proj)
            db.flush()
            all_created_projects.append((proj, contractor, delay_months))
            proj_code_counter += 1

    db.commit()
    print(f"Generated {len(all_created_projects)} projects. Building milestones, predictions, and alerts...")

    # ML models and scorers
    cost_model = CostOverrunPredictor()
    delay_model = TimeOverrunPredictor()

    for proj, contractor, est_delay in all_created_projects:
        # Create 4-5 Milestones for each project
        ms_specs = [
            ("M-01", "Site Clearance, Utility Shifting & Land Possession", -120, "COMPLETED", 0, "HIGH"),
            ("M-02", "Detailed Engineering DPR Approval & Statutory Clearances", -60, "COMPLETED", 0, "CRITICAL"),
            ("M-03", "Main Civil Superstructure & Equipment Foundation", 60, "COMPLETED" if proj.physical_progress > 60 else "IN_PROGRESS" if proj.physical_progress > 30 else "DELAYED", 45 if proj.project_status == "DELAYED" else 0, "CRITICAL"),
            ("M-04", "Electrification, MEP & Systems Integration", 180, "IN_PROGRESS" if proj.physical_progress > 70 else "NOT_STARTED", 90 if proj.project_status == "DELAYED" else 0, "HIGH"),
            ("M-05", "Trial Run, Safety Inspection & Final Commissioning", 300, "COMPLETED" if proj.physical_progress >= 95 else "NOT_STARTED", 120 if proj.project_status == "DELAYED" else 0, "CRITICAL")
        ]

        ms_objs = []
        for m_code, m_name, days_off, m_stat, m_del, m_crit in ms_specs:
            target_end = proj.original_completion_date + timedelta(days=days_off)
            ms = Milestone(
                project_id=proj.id,
                milestone_code=m_code,
                milestone_name=m_name,
                planned_start=proj.start_date,
                planned_end=target_end,
                actual_end=target_end if m_stat == "COMPLETED" else None,
                status=m_stat,
                completion_percentage=100.0 if m_stat == "COMPLETED" else 45.0 if m_stat == "IN_PROGRESS" else 0.0,
                delay_days=m_del,
                criticality=m_crit,
                dependencies="Statutory NOCs",
                description=f"Milestone overseen by {proj.implementing_agency}."
            )
            db.add(ms)
            ms_objs.append(ms)

        # Monthly Historical Time-Series (6 monthly snapshots)
        for m_idx in range(6):
            rep_month = date.today() - timedelta(days=(5 - m_idx) * 30)
            frac = (m_idx + 1) / 6.0
            pmd = ProjectMonthlyData(
                project_id=proj.id,
                reporting_month=rep_month,
                original_cost=proj.original_cost,
                revised_cost=proj.revised_cost,
                expenditure=round(proj.current_expenditure * (0.4 + 0.6 * frac), 2),
                physical_progress=min(100.0, round(proj.physical_progress * (0.4 + 0.6 * frac), 1)),
                financial_progress=min(100.0, round(proj.financial_progress * (0.4 + 0.6 * frac), 1)),
                planned_physical_progress=min(100.0, round(frac * 80.0, 1)),
                planned_expenditure=round(proj.original_cost * frac * 0.8, 2),
                milestones_completed=2 if m_idx > 3 else 1,
                milestones_delayed=1 if proj.project_status == "DELAYED" else 0,
                remarks=f"Monthly monitoring return for {proj.project_code} filed on PAIMANA."
            )
            db.add(pmd)

        # Run ML Feature Engineering & Inference
        proj_dict = {
            "original_cost": proj.original_cost,
            "revised_cost": proj.revised_cost,
            "current_expenditure": proj.current_expenditure,
            "physical_progress": proj.physical_progress,
            "financial_progress": proj.financial_progress,
            "start_date": proj.start_date,
            "original_completion_date": proj.original_completion_date,
            "sector_id": proj.sector_id,
            "implementing_agency": proj.implementing_agency
        }
        ms_dicts = [{"status": m.status, "delay_days": m.delay_days, "criticality": m.criticality} for m in ms_objs]
        features = FeatureBuilder.extract_features(proj_dict, milestones=ms_dicts)

        cost_pred = cost_model.predict(features)
        delay_pred = delay_model.predict(features, target_completion_date=proj.revised_completion_date or proj.original_completion_date)
        overall_score, risk_level, comps = RiskScorer.compute_composite_risk(
            features,
            ml_cost_prob=cost_pred["probability"],
            ml_delay_prob=delay_pred["delay_probability"]
        )
        shap_factors = SHAPExplainer.explain_prediction(features, overall_score)

        risk_pred = RiskPrediction(
            project_id=proj.id,
            cost_overrun_probability=cost_pred["probability"],
            predicted_cost_overrun=cost_pred["predicted_overrun_percentage"],
            predicted_final_cost=round(proj.original_cost * (1.0 + cost_pred["predicted_overrun_percentage"] / 100.0), 2),
            delay_probability=delay_pred["delay_probability"],
            predicted_delay_months=delay_pred["predicted_delay_months"],
            implementation_risk=comps["progress_risk"],
            overall_risk_score=overall_score,
            risk_level=risk_level,
            model_version="v1.2-ensemble"
        )
        db.add(risk_pred)
        db.flush()

        for f in shap_factors[:4]:
            rf = RiskFactor(
                risk_prediction_id=risk_pred.id,
                feature_name=f["feature_name"],
                feature_value=float(f.get("feature_value", 0.0)),
                impact_score=float(f["impact_score"]),
                impact_direction=f["impact_direction"],
                rank=f["rank"]
            )
            db.add(rf)

        # Alerts for High & Critical Risk
        if overall_score >= 61.0:
            alert = Alert(
                project_id=proj.id,
                risk_prediction_id=risk_pred.id,
                alert_type="SCHEDULE_DELAY" if delay_pred["delay_probability"] > 0.75 else "COST_OVERRUN",
                severity=risk_level,
                title=f"Critical Early Warning: Risk Score {overall_score}/100 ({proj.project_code})",
                description=f"AI model forecasts +{delay_pred['predicted_delay_months']} months slippage and +{cost_pred['predicted_overrun_percentage']}% cost escalation risk.",
                recommended_action=f"Convene tripartite review with {contractor.name} and audit ROW clearances.",
                priority="CRITICAL" if overall_score >= 81 else "HIGH",
                status="OPEN"
            )
            db.add(alert)
            db.flush()

            # Seed an intervention for sample projects
            if random.random() < 0.35:
                it = Intervention(
                    project_id=proj.id,
                    alert_id=alert.id,
                    recommended_action="Execute joint site inspection and require contractor catch-up mobilization schedule.",
                    officer_action="Formal directive issued by IPMD Director with 14-day compliance window.",
                    assigned_to="Ananya Sharma (Director IPMD)",
                    status="IN_PROGRESS",
                    outcome="Contractor mobilised additional batching plant and 120 skilled crew."
                )
                db.add(it)

        # Seed Documents & RAG Knowledge Chunk
        doc = Document(
            project_id=proj.id,
            document_type="MONTHLY_MONITORING_REPORT",
            title=f"MoSPI IPMD Monthly Review: {proj.project_code}",
            source_url=f"https://paimana.mospi.gov.in/reports/{proj.project_code}.pdf",
            published_date=date.today() - timedelta(days=15),
            text_content=f"Project {proj.project_code} ({proj.project_name}) is executed by {contractor.name} under {proj.implementing_agency}. Physical progress is {proj.physical_progress}% against planned {proj.planned_physical_progress}%.",
            doc_metadata={"project_code": proj.project_code, "sector": proj.sector.name}
        )
        db.add(doc)
        db.flush()

        chunk = DocumentChunk(
            document_id=doc.id,
            chunk_index=0,
            content=f"Project {proj.project_code}: {proj.project_name}. Sanctioned Cost: ₹{proj.original_cost} Cr, Revised: ₹{proj.revised_cost} Cr. Contractor: {contractor.name}. Status: {proj.project_status}.",
            embedding=VectorEmbedder.embed_text(f"{proj.project_code} {proj.project_name} {contractor.name}"),
            chunk_metadata={"project_code": proj.project_code, "section": "Executive Summary", "page": 1}
        )
        db.add(chunk)

        # Seed Audit Log
        audit = AuditLog(
            user_name="System Ingestion Engine",
            user_role="ADMIN",
            action="PROJECT_RECORD_INGESTED",
            entity_type="PROJECT",
            entity_id=proj.id,
            project_id=proj.id,
            details=f"Project record {proj.project_code} ingested and validated through 10-rule hygiene audit.",
            old_value="N/A",
            new_value=f"Physical: {proj.physical_progress}%, Cost: ₹{proj.revised_cost} Cr",
            timestamp=datetime.utcnow() - timedelta(days=random.randint(1, 20))
        )
        db.add(audit)

    # 7. Seed Notifications
    notifications_data = [
        ("Critical Schedule Alert", "3 major railway packages in Eastern DFC entered CRITICAL delay risk (>18 months).", "ALERT", "CRITICAL", "PRJ-002"),
        ("Monthly PMO Report Ready", "The Consolidated National Infrastructure Project Review for Q3 is generated.", "REPORT", "INFO", None),
        ("Milestone Slippage Detected", "Package 4 of Delhi-Mumbai Expressway missed civil deck casting deadline by 45 days.", "MILESTONE", "WARNING", "PRJ-001"),
        ("Data Hygiene Audit Passed", "105 project records audited with 100% schema integrity and non-negative expenditure compliance.", "SYSTEM", "INFO", None),
        ("Intervention Directive Issued", "Tripartite review scheduled for AIIMS Awantipora project with HSCC and CPWD.", "ALERT", "HIGH", "PRJ-004")
    ]
    for n_title, n_msg, n_type, n_sev, n_pcode in notifications_data:
        notif = Notification(
            title=n_title,
            message=n_msg,
            type=n_type,
            severity=n_sev,
            project_code=n_pcode,
            is_read=False
        )
        db.add(notif)

    # 8. Seed Initial Report Records
    reports_data = [
        ("National Infrastructure Consolidated Review - Q3", "NATIONAL", "Comprehensive executive overview across 105 projects totaling ₹4.2 Lakh Cr."),
        ("State Infrastructure Performance Brief: Maharashtra", "STATE", "Regional analysis covering 18 mega projects across Road, Rail, and Metro sectors."),
        ("Railways & Dedicated Freight Corridor Delayed Projects Audit", "SECTOR", "Detailed bottleneck assessment of 24 railway electrification and civil contracts."),
        ("Monthly PMO High-Risk Escalation Dossier", "MONTHLY_PMO", "Actionable briefing prioritizing top 15 projects requiring cabinet-level intervention.")
    ]
    for r_title, r_type, r_summary in reports_data:
        rep = ReportRecord(
            title=r_title,
            report_type=r_type,
            parameters={"scope": "National", "total_records": 105},
            summary=r_summary,
            generated_by="PMO Officer",
            file_format="PDF"
        )
        db.add(rep)

    db.commit()
    print("✅ IPM Bharat Database Seeding Completed Successfully!")
    print(f"📊 Seeded: {len(all_created_projects)} Projects, 10 Contractors, 8 Ministries, 8 Sectors, 23 States, Notifications, and Audit Logs.")
    db.close()

if __name__ == "__main__":
    seed_database()
