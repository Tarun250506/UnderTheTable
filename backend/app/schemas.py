
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, ConfigDict, model_validator


class ReportCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    report_type: Literal["violation", "service", "both"]

    # Violation / enforcement details
    violation: str | None = Field(default=None, max_length=150)
    authority: str | None = Field(default=None, max_length=150)
    consequence: str | None = Field(default=None, max_length=150)
    violation_amount_demanded: float | None = Field(default=None, ge=0)
    violation_amount_paid: float | None = Field(default=None, ge=0)
    fine: float | None = Field(default=None, ge=0)

    # Government service details
    department: str | None = Field(default=None, max_length=150)
    service: str | None = Field(default=None, max_length=250)
    service_amount_demanded: float | None = Field(default=None, ge=0)
    service_amount_paid: float | None = Field(default=None, ge=0)
    official_fee: float | None = Field(default=None, ge=0)

    # Common details
    state: str = Field(min_length=2, max_length=100)
    city: str = Field(min_length=2, max_length=100)
    incident_date: date | None = None
    outcome: str | None = Field(default=None, max_length=200)
    description: str | None = Field(default=None, max_length=3000)

    publication_consent: bool = False

    @model_validator(mode="after")
    def validate_report_sections(self):
        if self.report_type in ("violation", "both"):
            if not self.violation or not self.authority:
                raise ValueError(
                    "Violation category and authority are required."
                )

        if self.report_type in ("service", "both"):
            if not self.department or not self.service:
                raise ValueError(
                    "Department and service are required."
                )

        return self
class ModerationUpdate(BaseModel):
    status: Literal["approved", "rejected"]


class AdminLogin(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=128)
