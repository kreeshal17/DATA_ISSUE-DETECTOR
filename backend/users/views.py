from django.contrib.auth import authenticate

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer


class RegisterView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "Successfully created an account"
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get("username")
        password = request.data.get("password")

        print("LOGIN USERNAME:", username)
        print("LOGIN PASSWORD:", password)

        user = authenticate(
            username=username,
            password=password
        )

        print("AUTHENTICATED USER:", user)

        if user is None:

            return Response(
                {
                    "message": "Invalid username or password"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        response = Response(
            {
                "message": "Login successful"
            }
        )

        response.set_cookie(
            key="access_token",
            value=str(refresh.access_token),
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=15 * 60
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax",
            path="/",
            max_age=7 * 24 * 60 * 60
        )

        return response


class RefreshTokenView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        refresh_token = request.COOKIES.get(
            "refresh_token"
        )

        if not refresh_token:

            return Response(
                {
                    "error": "Refresh token missing"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:

            refresh = RefreshToken(
                refresh_token
            )

            new_access_token = str(
                refresh.access_token
            )

            response = Response(
                {
                    "message": "Token refreshed"
                }
            )

            response.set_cookie(
                key="access_token",
                value=new_access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                path="/",
                max_age=15 * 60
            )

            return response

        except Exception as e:

            print("REFRESH ERROR:", e)

            return Response(
                {
                    "error": "Invalid refresh token"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        response = Response(
            {
                "message": "Logout successful"
            }
        )

        response.delete_cookie(
            "access_token",
            path="/"
        )

        response.delete_cookie(
            "refresh_token",
            path="/"
        )

        return response


class MeView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        print("USER:", request.user)

        return Response(
            {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email
            }
        )