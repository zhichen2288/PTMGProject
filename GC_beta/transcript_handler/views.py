from cProfile import run
import io
import os
from pdb import runcall
from threading import Thread
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework_mongoengine.viewsets import ModelViewSet, GenericViewSet
from django.core.files.storage import default_storage

from .Run_Data_Check import run_data_check
from .Run_School_Template import run_school_template

from .handlers import ExtractTableHandler
from .models import  ConsolidatedData, ProcessedTable, StudentTable, TabContent, University, Student, Department, Identifier, Transcript, Education
from .serializers import UniversitySerializer, StudentSerializer, TranscriptSerializer
from .utils import extract_pages_from_raw_file, get_transcripts_and_dump_into_disk
from GC_beta.settings import BASE_DIR
import json
from bson import json_util
from .System_GPA import GPA



@csrf_exempt
def dashboard(request):
    if request.method == "POST":
        University.objects().delete({})
        Student.objects.all().delete({})
        # TODO: init some documents down here
        u1 = University(name="SIT", identifier=Identifier(feature1="7", feature2=8, feature3=9))
        d1 = Department(name="D1", identifier=Identifier(feature1="7", feature2=8, feature3=9))
        d2 = Department(name="D2", identifier=Identifier(feature1="7", feature2=8, feature3=9))
        u1.departments = [d1, d2]
        u1.save()
        s1 = Student(name="s1", transcript=Transcript(mock_raw_file="ABC"),
                     education=Education(university=u1.name, department=d1.name))
        s2 = Student(name="s2", transcript=Transcript(mock_raw_file="EFG"),
                     education=Education(university=u1.name, department=d1.name))
        s1.save()
        s2.save()
        context = {
            "message": "all collections flushed, dummy data populated."
        }
        # disconnect(alias='default')
        return render(request, 'dashboard.html', context)
    elif request.method == "GET":
        return render(request, 'dashboard.html')


# save for later, don't delete them

# @csrf_exempt
# def university_list(request):
#     """
#     List all code snippets, or create a new snippet.
#     """
#     if request.method == 'GET':
#         universities = University.objects.all()
#         serializer = UniversitySerializer(universities, many=True)
#         return JsonResponse(serializer.data, safe=False)
#
#     elif request.method == 'POST':
#         data = JSONParser().parse(request)
#         serializer = UniversitySerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse(serializer.data, status=201)
#         return JsonResponse(serializer.errors, status=400)
#
#
# @csrf_exempt
# def student_list(request):
#     """
#     List all code snippets, or create a new snippet.
#     """
#     if request.method == 'GET':
#         students = Student.objects.all()
#         serializer = StudentSerializer(students, many=True)
#         return JsonResponse(serializer.data, safe=False)
#
#     elif request.method == 'POST':
#         data = JSONParser().parse(request)
#         serializer = StudentSerializer(data=data)
#         if serializer.is_valid():
#             serializer.save()
#             return JsonResponse(serializer.data, status=201)
#         return JsonResponse(serializer.errors, status=400)

@csrf_exempt
def test_route(request):
    print(request)
    return JsonResponse({}, status=200)


@csrf_exempt
def get_engine_usage(request):
    try:
        usage_info = ExtractTableHandler.get_usage()
        return JsonResponse({'enginesUsage': [usage_info]}, status=200)
    except:
        return JsonResponse({'error': 'something went wrong'}, status=404)

@csrf_exempt
def update_transcript(request, pk):
    if request.method == "POST":
        try:
            student = Student.objects.get(id=pk)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=404)

        table_data = json.loads(request.body)
        tables = []

        for table in table_data['data']:
            new_table = ProcessedTable(page = table['page'], table_num = table['table_num'], table_data = table['table_data'], image_path = table['image_path'], modified = 1)            
            tables.append(new_table)
        
        student.transcript.processed_data = tables
        student.save()

    return JsonResponse({}, status=200)

@csrf_exempt
def update_Consolidated_Data(request, pk):
    if request.method == "POST":
        try:
            student = Student.objects.get(id=pk)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=404)
        
        data = json.loads(request.body)
        tabs = list(data['data']['tabs'])
        tabData = []
        for element in data['data']['tabData']:
            tabData.append(TabContent(name = element['tabName'], data = json.dumps(element['data']), GPA = element['gpa']))
        
        student.consolidatedData = ConsolidatedData(tabs = tabs, tabContent = tabData) 
        student.save()
    return JsonResponse({}, status=200)

@csrf_exempt
def student_transcript(request, pk):
    if request.method == 'GET':
        try:
            student = Student.objects.get(id=pk)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=404)
        transcript = student.transcript
        if not request.GET.get('action'):  # default behavior, get the transcript of a student
            serializer = TranscriptSerializer(transcript)
            return JsonResponse(serializer.data, status=200)

        elif request.GET.get('action') == 'calculate':  # get the transcript processing
            gpa = ExtractTableHandler.calculate_gpa(student)
            return JsonResponse({'gpa': gpa}, status=200)

        elif request.GET.get('action') == 'status':  # get the status of the transcript's process
            status = student.transcript.status
            return JsonResponse({'status': status}, status=200)

        elif request.GET.get('action') == 'prepare':
            student = None
            try:
                student = Student.objects.get(id=pk)
            except:
                return JsonResponse({'error': "student not found."}, status=404)
            if not len(student.transcript.valid_pages) > 0:
                return JsonResponse({'error': "No uploaded file found."}, status=404)
            #succeed = ExtractTableHandler.prepare_transcript(student)
            succeed = ExtractTableHandler.get_extractTable_data(student)
            return JsonResponse({'message': "okay"}, status=200) if succeed else JsonResponse(
                {'message': "something went wrong."}, status=200)
 
        elif request.GET.get('action') == 'view':
            student = None
            try:
                student = Student.objects.get(id=pk)
            except:
                return JsonResponse({'error': "student not found."}, status=404)
            processed_transcripts = student.transcript.processed_data
            tables_in_dict = [json.loads(x.to_json()) for x in processed_transcripts]
            return JsonResponse({'student_name': student.name, 'tables': tables_in_dict})

        elif request.GET.get('action') == 'check_transcript_data':
            student = None
            try:
                student = Student.objects.get(id=pk)
            except:
                return JsonResponse({'error': "student not found."}, status=404)
            processed_data = run_data_check(student.id)
            print(processed_data)
            return JsonResponse({'student_name': student.name, 'data':str(processed_data)})

        elif request.GET.get('action') == 'viewtables':
            student = None
            try:
                student = Student.objects.get(id=pk)
            except:
                return JsonResponse({'error': "student not found."}, status=404)
            
            if(len(student.consolidatedData.tabContent) == 0):
                output_dict = run_school_template(student.id, student)
                student.consolidatedData = output_dict
                student.save()

            processed_transcripts = student.consolidatedData
            consolidated_data_dict = student.consolidatedData.to_mongo()
            json_string = json.dumps(consolidated_data_dict, default=json_util.default)

            #tables_in_dict = [json.loads(x.to_json()) for x in processed_transcripts]
            return JsonResponse({'student_name': student.name, 'data': json_string})

        elif request.GET.get('action') == 'calculateGPA':
            student = None
            try:
                student = Student.objects.get(id=pk)
            except:
                return JsonResponse({'error': "student not found."}, status=404)
            tabName = request.GET.get('tabname')
            result = GPA(student.id, tabName)
            return JsonResponse({'student_name': student.name, 'result': result.calculate_GPA()})

    elif request.method == 'POST':  # add new transcripts, default is override
        studentId = pk
        try:
            student = Student.objects.get(id=studentId)
        except:
            print(f'student {studentId} not found.')
            return JsonResponse({}, status=404)

        images = request.FILES.getlist('snippedImages')
        # page_numbers = []
        option = "NEW"
        succeed = ExtractTableHandler.create_processed_tables(images, student, option, data=None)

  
        # else:
        #     pages = list(map(int, request.POST['validPages'].split(',')))
        #     pdfFileObj = request.FILES['file'].read()
        #     buffer = extract_pages_from_raw_file(io.BytesIO(pdfFileObj), pages)
        #     print(request.POST['validPages'], pages, studentId)        
        
        #student.transcript.raw_file.replace(buffer)

        #get_transcripts_and_dump_into_disk(student, BASE_DIR)
        return JsonResponse({}, status=200)


class UniversityViewSet(ModelViewSet):
    lookup_field = 'id'
    # queryset = University.objects.all()
    # serializer = UniversitySerializer()
    serializer_class = UniversitySerializer

    def get(self, request):
        universities = University.objects.all()
        serializer = UniversitySerializer(universities)
        return JsonResponse(serializer.data)

    def get_queryset(self):
        return University.objects.all()


class StudentViewSet(ModelViewSet):
    lookup_field = 'id'
    serializer_class = StudentSerializer

    def get_queryset(self):
        return Student.objects.all()

    def destroy(self, request, *args, **kwargs):
        student = self.get_object()
        paths = ExtractTableHandler._compose_paths(student)
        if os.path.isdir(paths['output_dir']):
            for f in os.listdir(paths['output_dir']):
                abs_f_path = os.path.join(paths['output_dir'], f)
                os.remove(abs_f_path)
                # print(os.path.join(paths['output_dir'],f))
            os.rmdir(paths['output_dir'])
        student.delete()
        return JsonResponse({}, status=200)


class TranscriptViewSet(GenericViewSet):
    def get_queryset(self):
        return Student.objects.filter()
