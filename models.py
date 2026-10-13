from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field


RiskLevel = Literal["LOW", "MEDIUM", "HIGH"]
InterventionStatus = Literal[
    "PENDING_REVIEW",
    "ASSIGNED",
    "CONTACTED",
    "FOLLOW_UP_SCHEDULED",
    "CLOSED",
]


class Encounter(BaseModel):
    """Represents a single patient hospital encounter with calculated risk score and level."""
    encounter_id: int
    patient_nbr: int
    age: str
    time_in_hospital: int
    number_inpatient: int
    number_emergency: int
    number_outpatient: int
    num_medications: int
    num_lab_procedures: int
    discharge_disposition_id: int
    admission_type_id: int
    readmitted: str
    risk_score: int
    risk_level: RiskLevel


class Intervention(BaseModel):
    """Represents a care intervention record for high or medium risk encounters."""
    intervention_id: int
    encounter_id: int
    status: InterventionStatus
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class CareQueueItem(Encounter):
    """Combines patient encounter details with its corresponding care intervention status."""
    intervention_id: int
    status: InterventionStatus
    assigned_to: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InterventionUpdate(BaseModel):
    """Request payload for updating intervention status, assignment, or notes."""
    status: Optional[InterventionStatus] = None
    assigned_to: Optional[str] = Field(default=None, max_length=100)
    notes: Optional[str] = None

    model_config = {
        "json_schema_extra": {
            "example": {
                "status": "CONTACTED",
                "assigned_to": "Care Team A",
                "notes": "Follow-up appointment scheduled",
            }
        }
    }


class OperationsSummary(BaseModel):
    """Encounter risk tiers and care-queue workload."""
    total_encounters: int
    high_risk: int
    medium_risk: int
    low_risk: int
    care_queue_size: int
    excluded_from_queue: int = Field(
        description="MEDIUM/HIGH encounters left out because the patient expired / hospice."
    )
    pending_interventions: int = Field(description="Status PENDING_REVIEW (not started).")
    in_progress_interventions: int = Field(
        description="Status ASSIGNED, CONTACTED or FOLLOW_UP_SCHEDULED."
    )
    completed_interventions: int = Field(description="Status CLOSED.")


class RiskGroupReadmissionAnalysis(BaseModel):
    """Readmission metrics for a specific risk level group (e.g., HIGH, MEDIUM, LOW)."""
    risk_level: RiskLevel
    total_patients: int
    readmitted_under_30_days: int
    readmission_rate: float
    lift_vs_baseline: float


class GroupReadmission(BaseModel):
    """Readmission metrics for a population of encounters."""
    total_patients: int
    readmitted_under_30_days: int
    readmission_rate: float
    lift_vs_baseline: float


class QueueComparison(BaseModel):
    """Historical outcomes for encounters inside vs outside the care queue."""
    in_queue: GroupReadmission
    not_in_queue: GroupReadmission


class ReadmissionAnalysis(BaseModel):
    """Prioritization rule evaluated against historical <30-day readmission outcomes."""
    high_risk_patients: int
    high_risk_readmitted_under_30_days: int
    high_risk_readmission_rate: float
    total_encounters: int
    readmitted_under_30_days: int
    baseline_readmission_rate: float
    queue_share_of_encounters: float = Field(
        description="Percent of all encounters that are in the care queue."
    )
    queue_share_of_readmissions: float = Field(
        description="Percent of all <30-day readmissions that came from queued encounters."
    )
    risk_groups: List[RiskGroupReadmissionAnalysis]
    queue_comparison: QueueComparison


class ManagementDashboard(BaseModel):
    """Executive dashboard: queue volume, workflow progress, and targeting effectiveness."""
    total_encounters: int
    care_queue_size: int
    high_risk_queue: int
    medium_risk_queue: int
    excluded_from_queue: int
    pending_interventions: int
    in_progress_interventions: int
    completed_interventions: int
    completion_rate: float
    baseline_readmission_rate: float
    high_risk_readmission_rate: float
    queue_readmission_rate: float
    queue_share_of_encounters: float
    queue_share_of_readmissions: float
