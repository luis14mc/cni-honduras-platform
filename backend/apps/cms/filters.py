def parse_bool_param(value: str | None) -> bool | None:
    if value is None:
        return None
    if value.lower() in {"1", "true", "yes"}:
        return True
    if value.lower() in {"0", "false", "no"}:
        return False
    return None
