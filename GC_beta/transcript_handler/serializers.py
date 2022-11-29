from rest_framework_mongoengine import serializers
from .models import University, Department, Identifier, Student, Transcript
from mongoengine import StringField, ListField, IntField, FloatField



# class IdentifierSerializer(serializers.DocumentSerializer):
#     class Meta:
#         # abstract = True
#         model = Identifier
#         fields = '__all__'
#
# class DepartmentSerializer(serializers.DocumentSerializer):
#     name = serializers.serializers.CharField()
#     identifier = IdentifierSerializer()
#     class Meta:
#         # abstract = True
#         model = Department
#         fields = '__all__'


class TranscriptSerializer(serializers.EmbeddedDocumentSerializer):
    class Meta:
        model = Transcript
        fields = ['raw_file']


class UniversitySerializer(serializers.DocumentSerializer):
    # name = serializers.serializers.CharField()
    # departments = DepartmentSerializer(many=True)
    # identifier = IdentifierSerializer()
    class Meta:
        model = University
        # fields = ['_id', 'name']  # 'departments', 'identifier'
        fields = '__all__'


class StudentSerializer(serializers.DocumentSerializer):
    # transcript = TranscriptSerializer(many=False)

    class Meta:
        model = Student
        # fields = "__all__"
        fields = ['id', 'name', 'education', 'status', 'gpa']
