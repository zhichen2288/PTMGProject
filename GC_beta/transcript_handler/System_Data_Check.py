import pandas as pd
import numpy as np
import pymongo
import System_School_Template
from nltk import flatten




class DataCheck:
    def __init__(self, school_name, table_data):
        self.school_name = school_name
        self.table_data = table_data
        # initialize school object
        self.school_obj = System_School_Template.SchoolTemplate(self.school_name, self.table_data)
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
        
#         elif "Score" not in self.df.columns:
#             return "Score", []
    
    
    def check_credit_range(self):
        if "Credit" in self.df.columns:
            outlier_condition = self.df["Credit"].apply(lambda x: True if (x < 0) or (x > 5) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
            
            return "Credit", outlier_idx
        
#         elif "Credit" not in self.df.columns:
#             return "Credit", []
        
    
    def check_grade_length(self):
        if "Grade" in self.df.columns:
            outlier_condition = self.df["Grade"].apply(lambda x: True if (len(x) > 2) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
            
            return "Grade", outlier_idx
        
#         elif "Grade" not in self.df.columns:
#             return "Grade", []
        
    
    def check_grade_existence(self):
        if "Grade" in self.df.columns:
            unique_grade = self.df["Grade"].unique()
            unique_grade = [i_grade.upper() for i_grade in unique_grade]

            # get the map dictionary from map_db
            client = pymongo.MongoClient()
            db = client["Map_db"]
            collection = db[self.school_name]
            collection_df = pd.DataFrame(collection.find({}))

#             grade_map = {}
#             for i in range(len(collection_df)):
#                 grade_map[collection_df["Grade"][i]] = collection_df["USgrade"][i]
            
            grade = collection_df["Grade"].tolist()
            unknown_grade = []
            for i_grade in unique_grade:
                if i_grade not in grade:
                    unknown_grade.append(i_grade)
            
            outlier_list_ug = []
            for i_unknow_grade in unknown_grade:
                condition = self.df["Grade"] == i_unknow_grade
                i_idx_ug = self.df[condition].index.tolist()
                outlier_list_ug.append(i_idx_ug)
                
            flatten_outlier_list_ug = flatten(outlier_list_ug)
        
            return  "Grade", flatten_outlier_list_ug
        