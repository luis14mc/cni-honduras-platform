"""Regression guards for opportunity editorial migrations (S2-T8)."""

from __future__ import annotations

from importlib import import_module

from django.test import SimpleTestCase

m0006 = import_module("apps.investment.migrations.0006_opportunity_editorial_metrics_fund_uses")


class OpportunityMigration0006Guards(SimpleTestCase):
    def test_renames_both_status_btree_and_like_indexes(self):
        """CI #49/#50: RenameField leaves PG index names; AddField status collides."""
        runsql_ops = [
            op for op in m0006.Migration.operations if op.__class__.__name__ == "RunSQL"
        ]
        self.assertTrue(runsql_ops, "Expected RunSQL after RenameField status→lifecycle_status")
        sql = "\n".join(str(getattr(op, "sql", "")) for op in runsql_ops)
        self.assertIn("investment_investmentopportunity_status_3c5c08c7", sql)
        self.assertIn("investment_investmentopportunity_status_3c5c08c7_like", sql)
        self.assertIn("lifecycle_status_idx", sql)
        self.assertIn("lifecycle_status_like_idx", sql)

    def test_rename_happens_before_editorial_status_addfield(self):
        ops = m0006.Migration.operations
        rename_idx = next(
            i
            for i, op in enumerate(ops)
            if op.__class__.__name__ == "RenameField"
            and getattr(op, "old_name", None) == "status"
        )
        runsql_idx = next(i for i, op in enumerate(ops) if op.__class__.__name__ == "RunSQL")
        status_add_idx = next(
            i
            for i, op in enumerate(ops)
            if op.__class__.__name__ == "AddField" and getattr(op, "name", None) == "status"
        )
        self.assertLess(rename_idx, runsql_idx)
        self.assertLess(runsql_idx, status_add_idx)
