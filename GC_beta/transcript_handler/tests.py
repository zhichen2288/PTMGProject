from django.test import TestCase

# Create your tests here.
from GC_beta.transcript_handler.models import *
from GC_beta.transcript_handler.utils import *
# from GC_beta.transcript_handler.handlers import ExtractTableHandler
from threading import Thread
import sched, time
# from GC_beta.settings import BASE_DIR
import os
import pandas as pd
from bson.json_util import dumps
import json



register_connection(alias='default', name='GC_beta', host='localhost', port='27017')
db = connect(alias='default')

# University.drop_collection()
testMode = {
    'init_DB': False,
    'threading': False,
    'extract_io': False
}
s1, s2 = [None, None]
if testMode['init_DB']:
    print('initiating DB')
    University.objects().delete({})
    Student.objects().delete({})

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
    print('Finished initiating DB')

if testMode['threading']:
    some_q = [s1, s2]

    test_Abode_handler = TestAdobeHandler()
    print([x.transcript.is_ready for x in some_q])
    thread1 = Thread(target=test_Abode_handler.process_mock_transcript, args=(s1, 2))
    thread2 = Thread(target=test_Abode_handler.process_mock_transcript, args=(s2, 5))
    thread2.start()
    thread1.start()

    s = sched.scheduler(time.time, time.sleep)


    def do_something(sc):
        global tick
        q = Student.objects.all()
        states = [x.transcript.is_ready for x in q]
        data = [x.transcript.processed_data for x in q]
        print(states, data)
        print('do smthing else')
        s.enter(1, 1, do_something, (sc,))


    s.enter(1, 1, do_something, (s,))
    s.run()

if testMode['extract_io']:
    file_name = 'sample-3.pdf'
    pages = [0, 1]
    print(BASE_DIR)

    s1 = Student.objects.get(name='s1')

    with open(os.path.join(BASE_DIR, file_name), 'rb') as fd:
        buf = extract_pages_from_raw_file(fd, pages)
        s1.transcript.raw_file.replace(buf)
        s1.transcript.valid_pages = pages
        s1.save()
    #  --------------------------------
    outputFilePath = get_transcripts_and_dump_into_disk(s1, BASE_DIR)
    print(outputFilePath)

# input_dir = 'H:\\Pylon\\Sample_Transcripts_2'
# output_dir = 'H:\\Pylon\\'
# (_, _, filenames) = next(os.walk(input_dir))
# print(filenames)
# df = pd.DataFrame({'file_name': filenames}, columns=['file_name', 'university', 'department', 'valid_pages'])
# print(df)
# df.to_csv(output_dir + 'metadata.csv')
# et = ExtractTableHandler()
# print(et.get_usage())
# deng = Student.objects.get(name='Deng')
# print(dumps(deng.transcript.processed_data))
# tables_in_dict = [json.loads(x.to_json()) for x in deng.transcript.processed_data]
# print(tables_in_dict)
df = pd.read_csv("C:\\Projects\\GC_beta\\GC_beta\\sample_output\\Deng\\table-0.csv").fillna('')
df.drop([0])
json_string = df.to_json(orient="table",index=False)
print(json_string)
print(json.loads(json_string)['data'])

