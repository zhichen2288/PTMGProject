# from djongo import models
from mongoengine import *
from abc import ABC, ABCMeta, abstractmethod

"""
Update:
    1. Rocket.
"""


# class Engine(Document):
#     provider = StringField()
#     key = StringField()
#     usage = EmbeddedDocumentField()
#
# class EngineUsage(EmbeddedDocument):
#     credit

class Identifier(EmbeddedDocument):
    """
    Basically the metadata for the transcript. no idea what they could be.
    """
    feature1 = StringField()
    feature2 = IntField()
    feature3 = IntField()


class Department(EmbeddedDocument):
    name = StringField(max_length=40)
    identifier = EmbeddedDocumentField(Identifier)


class University(Document):
    name = StringField(max_length=100)
    departments = ListField(EmbeddedDocumentField(Department))
    identifier = EmbeddedDocumentField(Identifier)

    def test_method(self, string):
        return self.name + string

    def __str__(self):
        return f"{self.name}"


class ProcessedTable(EmbeddedDocument):
    page = IntField()  # on which page
    table_num = IntField()  # which table
    table_data = StringField()  # json, will be restored to dataframe?
    image_path = StringField()  # localhost abs path for now, under port 8080
    modified = IntField(default=0)


class Transcript(EmbeddedDocument):
    """
    1. the raw_file field should be FileField which serves static files locally. Not a concern for now.
    2. the processed_data should be some normalized data. Not a concern for now.
    """
    mock_raw_file = StringField(default="")
    processed_data = ListField(EmbeddedDocumentField(ProcessedTable), default=[])
    status = IntField(default=0)  # 0 for not processed, 1 for processing, 2 for done
    raw_file = FileField()
    valid_pages = ListField(default=[])


class Education(EmbeddedDocument):
    """
    This would be just a wrapper for retrieving identifiers
    """
    university = StringField(max_length=100, null=True)
    department = StringField(max_length=40, null=True)


class TabContent(EmbeddedDocument):
    name = StringField(required=True)
    GPA = StringField()
    data = StringField()


class ConsolidatedData(EmbeddedDocument):
    tabs = ListField(default=[])
    tabContent = ListField(EmbeddedDocumentField(TabContent), default=[])


class Student(Document):
    """
    Anyhow, students are the subjects that we are interested.
    """
    name = StringField(max_length=40)
    gpa = DecimalField(default=0.00, min_value=0, max_value=4, precision=2)
    transcript = EmbeddedDocumentField(Transcript, default=Transcript())
    consolidatedData = EmbeddedDocumentField(ConsolidatedData, default=ConsolidatedData())
    education = EmbeddedDocumentField(Education, default=Education())
    status = StringField(default="NEW")


class score_scheme(EmbeddedDocument):
    score_from = DecimalField()
    score_to = DecimalField()
    usgrade = StringField() 


class grade_scheme(EmbeddedDocument):
    transcript_grade = StringField()
    scale = DecimalField()
    usgrade = StringField()


class Conversion(Document):
    university = StringField()
    country = StringField()
    SG_base = StringField()
    score_scheme = EmbeddedDocumentField(score_scheme, default=score_scheme)
    grade_scheme = EmbeddedDocumentField(grade_scheme, default = grade_scheme)


class StudentTable(Document):
    course = StringField()
    credit = StringField()
    grade_point = StringField()
    score = StringField()
    meta = {
        'collection': 'student_temp',
        'auto_create_index': True,
    }

class SingletonABCMeta(ABCMeta):
    _instances = {}

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(SingletonABCMeta, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


class GenericTranscriptHandler(metaclass=SingletonABCMeta):

    def __init__(self):
        pass

    # @abstractmethod
    # def process_transcript(self, student):
    #     pass

    @abstractmethod
    def prepare_transcript(self, student):
        pass

    @abstractmethod
    def calculate_gpa(self, student):
        pass

    @abstractmethod
    def get_usage(self):
        pass
