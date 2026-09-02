"""Internal management services for project application workflows."""

from __future__ import annotations

from django.contrib.auth import get_user_model
from django.db import transaction

from .models import (
    ProjectApplication,
    ProjectApplicationHistory,
    ProjectApplicationHistoryEventType,
    ProjectApplicationNote,
    ProjectApplicationStatus,
)

User = get_user_model()

_UNSET = object()


def _display_name(user: User | None) -> str:
    if user is None:
        return ""
    full = user.get_full_name().strip()
    return full or user.username


def _assignment_event_type(from_user: User | None, to_user: User | None) -> str:
    if from_user is None and to_user is not None:
        return ProjectApplicationHistoryEventType.ASSIGNED
    if from_user is not None and to_user is None:
        return ProjectApplicationHistoryEventType.UNASSIGNED
    if from_user is not None and to_user is not None and from_user.pk != to_user.pk:
        return ProjectApplicationHistoryEventType.REASSIGNED
    return ""


def record_history(*, application: ProjectApplication, actor: User | None, **kwargs) -> ProjectApplicationHistory:
    return ProjectApplicationHistory.objects.create(application=application, actor=actor, **kwargs)


@transaction.atomic
def apply_management_update(
    application: ProjectApplication,
    *,
    actor: User,
    status: str | None = None,
    assigned_to: User | None | object = _UNSET,
) -> ProjectApplication:
    """Apply status and/or assignment changes atomically with audit history."""

    update_fields: list[str] = []
    previous_status = application.status
    previous_assignee = application.assigned_to

    if status is not None and status != previous_status:
        if status not in ProjectApplicationStatus.values:
            raise ValueError(f"Estado inválido: {status}")
        application.status = status
        update_fields.append("status")
        record_history(
            application=application,
            actor=actor,
            event_type=ProjectApplicationHistoryEventType.STATUS_CHANGED,
            from_status=previous_status,
            to_status=status,
        )

    if assigned_to is not _UNSET:
        new_assignee = assigned_to if assigned_to is None or isinstance(assigned_to, User) else None
        if (previous_assignee is None) != (new_assignee is None) or (
            previous_assignee is not None
            and new_assignee is not None
            and previous_assignee.pk != new_assignee.pk
        ):
            event_type = _assignment_event_type(previous_assignee, new_assignee)
            if event_type:
                application.assigned_to = new_assignee
                update_fields.append("assigned_to")
                record_history(
                    application=application,
                    actor=actor,
                    event_type=event_type,
                    from_assignee=previous_assignee,
                    to_assignee=new_assignee,
                )

    if update_fields:
        update_fields.append("updated_at")
        application.save(update_fields=update_fields)

    return application


@transaction.atomic
def create_internal_note(
    application: ProjectApplication,
    *,
    actor: User,
    body: str,
) -> ProjectApplicationNote:
    note = ProjectApplicationNote.objects.create(application=application, author=actor, body=body)
    record_history(
        application=application,
        actor=actor,
        event_type=ProjectApplicationHistoryEventType.NOTE_ADDED,
        metadata={"note_id": note.pk},
    )
    return note
