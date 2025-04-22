from rest_framework.throttling import SimpleRateThrottle
from django.core.cache import cache
import time

class LoginThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        if request.method == 'POST':
            return self.cache_format % {
                'scope': self.scope,
                'ident': 'global'  # blocks all login attempts after cap is reached
            }
        return None

class TokenRefreshRateThrottle(SimpleRateThrottle):
    """
    Rate limiting for token refresh operations
    """
    scope = 'token_refresh'
    
    def get_cache_key(self, request, view):
        # Only apply to token refresh endpoint
        if request.path.endswith('/api/token/refresh/') and request.method == 'POST':
            # Use client IP for per-client tracking
            ident = self.get_ident(request)
            return self.cache_format % {
                'scope': self.scope,
                'ident': ident
            }
        return None