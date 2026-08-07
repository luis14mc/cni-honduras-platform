"""Authenticated CMS-admin API.

Namespace mounted under ``/api/v1/cms-admin/`` that powers the Next.js editorial
CMS. Every endpoint here requires an authenticated staff session and is kept
strictly separate from the public read-only API under ``/api/v1/``.
"""
