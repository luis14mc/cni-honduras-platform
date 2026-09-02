from rest_framework.throttling import SimpleRateThrottle


class FormsRateThrottle(SimpleRateThrottle):
    scope = "forms"

    def get_cache_key(self, request, view):
        ident = self.get_ident(request)
        return self.cache_format % {"scope": self.scope, "ident": ident}


class ProjectSubmissionRateThrottle(FormsRateThrottle):
    scope = "project_submissions"
