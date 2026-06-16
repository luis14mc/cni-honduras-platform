"""Query-param filters for investment map APIs."""


def parse_bool_param(value: str | None) -> bool | None:
    if value is None:
        return None
    return value.lower() in ("true", "1", "yes")


def apply_slug_filter(queryset, param: str, lookup: str, request):
    value = request.query_params.get(param)
    if value:
        queryset = queryset.filter(**{lookup: value})
    return queryset
