from django.urls import path
from . import views
from rest_framework import routers

app_name = 'transcript_handler'
# router = routers.DefaultRouter()
# router.register(r'university', views.UniversityViewSet)

urlpatterns = [
    # path('universities/', views.university_list),
    # path('students/', views.student_list),
    # path('/<int:pk>/', views.snippet_detail),
    path('', views.dashboard, name='dashboard'),
    path('api/students/<pk>/transcript', views.student_transcript, name='student_transcript'),
    path('api/students/<pk>/updateTranscript', views.update_transcript, name='update_transcript'),
    path('test', views.test_route),
    path('get-usage', views.get_engine_usage)
]
