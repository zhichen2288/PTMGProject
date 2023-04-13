import pandas as pd
import numpy as np
import pymongo
from .System_School_Template import SchoolTemplate
from nltk import flatten




class DataCheck:
    def __init__(self, school_name, table_data):
        self.school_name = school_name
        self.table_data = table_data
        # initialize school object
        self.school_obj = SchoolTemplate(self.school_name, self.table_data)
        self.df = self.school_obj.apply_school_template()
       
       
    def check_score_dtype(self):
        if "Score" in self.df.columns:
            outlier_condition = self.df["Score"].isnull()
            outlier_idx = self.df[outlier_condition].index.tolist()
           
            return "Score", outlier_idx
       
       
    def check_credit_dtype(self):        
        if "Credit" in self.df.columns:
            outlier_condition = self.df["Credit"].isnull()
            outlier_idx = self.df[outlier_condition].index.tolist()
           
            return "Credit", outlier_idx
   
   
    def check_score_range(self):        
        if "Score" in self.df.columns:
            outlier_condition = self.df["Score"].apply(lambda x: True if (x < 0) or (x > 100) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
           
            return "Score", outlier_idx
       
       
    def check_credit_range(self):
        if "Credit" in self.df.columns:
            outlier_condition = self.df["Credit"].apply(lambda x: True if (x < 0) or (x > 5) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
           
            return "Credit", outlier_idx
       
   
    def check_grade_existence(self):
        if "Grade" in self.df.columns:
            unique_grade = self.df["Grade"].unique()
            unique_grade = unique_grade.tolist()

            # access mongodb and get conversion
            client = pymongo.MongoClient()
            db = client["PTMG"]
            collection = db["conversion"]
            collection_df = pd.DataFrame(collection.find({}))
           
            university_document = collection_df[collection_df["university"] == self.school_name]
           
            # deal with the situation when the school name is inside the database
            if len(university_document) != 0:
                university_document_idx = university_document.index[0]
                conversion_df = pd.DataFrame(university_document['grade_scheme'][university_document_idx])
                transcript_grade = conversion_df["transcript grade"].tolist()
               
                unknown_grade = []
                for i_grade in unique_grade:
                    # standardize
                    i_grade_stdd = i_grade.strip()
                    i_grade_stdd = i_grade_stdd.upper()

                    if i_grade_stdd not in transcript_grade:
                        unknown_grade.append(i_grade)
               
                ug_outlier_list = []
                for i_unknown_grade in unknown_grade:
                    condition = self.df["Grade"] == i_unknown_grade
                    i_ug_idx = self.df[condition].index.tolist()
                    ug_outlier_list.append(i_ug_idx)
                   
                flatten_ug_outlier_list = flatten(ug_outlier_list)
           
                return  "Grade", flatten_ug_outlier_list
