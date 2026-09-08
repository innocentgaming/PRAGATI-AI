from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.entities import Project
from app.schemas.schemas import DataQualityReport, DataQualityCheckResult

class DataQualityService:
    @classmethod
    def audit_database_quality(cls, db: Session) -> DataQualityReport:
        projects = db.query(Project).all()
        total_projects = len(projects)
        
        if total_projects == 0:
            return DataQualityReport(
                overall_quality_score=100.0,
                total_records_checked=0,
                passed_records=0,
                flagged_records=0,
                checks=[],
                timestamp=datetime.utcnow()
            )

        checks = []
        flagged_project_ids = set()

        # Check 1: Negative Cost Values
        neg_cost = [p for p in projects if p.original_cost < 0 or p.revised_cost < 0 or p.current_expenditure < 0]
        if neg_cost:
            flagged_project_ids.update(p.id for p in neg_cost)
            checks.append(DataQualityCheckResult(
                check_name="Non-Negative Financial Values",
                passed=False,
                severity="CRITICAL",
                affected_count=len(neg_cost),
                details=[f"Project {p.project_code} has negative cost or expenditure." for p in neg_cost[:5]]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Non-Negative Financial Values",
                passed=True,
                severity="CRITICAL",
                affected_count=0,
                details=["All cost and expenditure entries are positive."]
            ))

        # Check 2: Progress Bounds [0.0, 100.0]
        bad_prog = [p for p in projects if not (0.0 <= p.physical_progress <= 100.0) or not (0.0 <= p.financial_progress <= 150.0)]
        if bad_prog:
            flagged_project_ids.update(p.id for p in bad_prog)
            checks.append(DataQualityCheckResult(
                check_name="Physical & Financial Progress Range Verification",
                passed=False,
                severity="ERROR",
                affected_count=len(bad_prog),
                details=[f"Project {p.project_code} has progress exceeding normal limits." for p in bad_prog[:5]]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Physical & Financial Progress Range Verification",
                passed=True,
                severity="ERROR",
                affected_count=0,
                details=["All progress metrics adhere to valid percentage bounds."]
            ))

        # Check 3: Date Chronology (Completion after Start Date)
        date_inverted = [p for p in projects if p.start_date and p.original_completion_date and p.original_completion_date < p.start_date]
        if date_inverted:
            flagged_project_ids.update(p.id for p in date_inverted)
            checks.append(DataQualityCheckResult(
                check_name="Timeline Chronology Integrity",
                passed=False,
                severity="CRITICAL",
                affected_count=len(date_inverted),
                details=[f"Project {p.project_code} has completion date earlier than start date." for p in date_inverted[:5]]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Timeline Chronology Integrity",
                passed=True,
                severity="CRITICAL",
                affected_count=0,
                details=["All project timelines maintain valid chronological start and end sequences."]
            ))

        # Check 4: Revised Cost Lower than Original Cost
        revised_lower = [p for p in projects if p.revised_cost > 0 and p.revised_cost < p.original_cost]
        if revised_lower:
            flagged_project_ids.update(p.id for p in revised_lower)
            checks.append(DataQualityCheckResult(
                check_name="Sanctioned Cost Revision Consistency",
                passed=False,
                severity="WARNING",
                affected_count=len(revised_lower),
                details=[f"Project {p.project_code} has revised cost lower than original sanction." for p in revised_lower[:5]]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Sanctioned Cost Revision Consistency",
                passed=True,
                severity="WARNING",
                affected_count=0,
                details=["Cost revisions are consistent with original project sanction rules."]
            ))

        # Check 5: Duplicate Project Code Detection
        seen_codes = set()
        dup_codes = set()
        for p in projects:
            if p.project_code in seen_codes:
                dup_codes.add(p.project_code)
            seen_codes.add(p.project_code)

        if dup_codes:
            checks.append(DataQualityCheckResult(
                check_name="Unique Project Identifier Enforcement",
                passed=False,
                severity="CRITICAL",
                affected_count=len(dup_codes),
                details=[f"Duplicate project code detected: {c}" for c in list(dup_codes)[:5]]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Unique Project Identifier Enforcement",
                passed=True,
                severity="CRITICAL",
                affected_count=0,
                details=["All project codes are uniquely indexed."]
            ))

        # Check 6: Data Provenance & Source Tagging
        no_source = [p for p in projects if not p.source_type]
        if no_source:
            checks.append(DataQualityCheckResult(
                check_name="Data Provenance & Source Tagging",
                passed=False,
                severity="WARNING",
                affected_count=len(no_source),
                details=["Some records lack explicit source_type tagging."]
            ))
        else:
            checks.append(DataQualityCheckResult(
                check_name="Data Provenance & Source Tagging",
                passed=True,
                severity="WARNING",
                affected_count=0,
                details=["100% of project records have verified data provenance tags."]
            ))

        flagged_count = len(flagged_project_ids)
        passed_count = total_projects - flagged_count
        quality_score = round((passed_count / total_projects) * 100.0, 1)

        return DataQualityReport(
            overall_quality_score=quality_score,
            total_records_checked=total_projects,
            passed_records=passed_count,
            flagged_records=flagged_count,
            checks=checks,
            timestamp=datetime.utcnow()
        )
