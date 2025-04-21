from rest_framework.throttling import SimpleRateThrottle

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