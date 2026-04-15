from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer
from rest_framework_simplejwt.authentication import JWTAuthentication


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "username": request.user.username,
            "email": request.user.email
        })

    def put(self, request):
        user = request.user
        # Update username and email if provided
        user.username = request.data.get('username', user.username)
        user.email = request.data.get('email', user.email)
        
        try:
            user.save()
            return Response({"message": "Profile updated successfully!", "username": user.username})
        except Exception as e:
            return Response({"error": str(e)}, status=400)