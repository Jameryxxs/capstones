from rest_framework import permissions

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit/delete objects.
    Read-only permissions are allowed for any authenticated user.
    """
    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the admin.
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')

class IsStaffOrAdmin(permissions.BasePermission):
    """
    Allows access only to staff or admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['admin', 'staff'])

class IsRetailerOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object (retailers) or admins to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Admin and staff can do anything
        if request.user.role in ['admin', 'staff']:
            return True
        
        # Check if the object has a 'retailer' or 'user' attribute that matches
        if hasattr(obj, 'retailer'):
            return obj.retailer.user == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
            
        return False
