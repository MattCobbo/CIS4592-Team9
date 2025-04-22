from rest_framework.throttling import SimpleRateThrottle
from django.core.cache import cache
import time

class LoginThrottle(SimpleRateThrottle):
    scope = 'login'

    def get_cache_key(self, request, view):
        
        view_name = view.__class__.__name__.lower()
        if (request.method == 'POST' and 
            ('login' in view_name or 'token' in view_name or 'auth' in view_name)):
            return self.cache_format % {
                'scope': self.scope,
                'ident': 'global'  
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