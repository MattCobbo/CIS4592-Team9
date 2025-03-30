from rest_framework.throttling import SimpleRateThrottle

class LoginThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        if request.method == 'POST':
            return self.cache_format % {
                'scope': self.scope,
                'ident': 'global'  # blocks all login attempts after cap is reached
            }
        return None