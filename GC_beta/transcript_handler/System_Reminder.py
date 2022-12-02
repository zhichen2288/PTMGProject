import pandas as pd
import numpy as np
import pymongo
from .System_School_Template import SchoolTemplate




class Reminder:
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
        
        elif "Score" not in self.df.columns:
            return "Score", []
    
    
    def check_credit_range(self):
        if "Credit" in self.df.columns:
            outlier_condition = self.df["Credit"].apply(lambda x: True if (x < 0) or (x > 5) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
            
            return "Credit", outlier_idx
        
        elif "Credit" not in self.df.columns:
            return "Credit", []
        
    
    def check_grade_length(self):
        if "Grade" in self.df.columns:
            outlier_condition = self.df["Grade"].apply(lambda x: True if (len(x) > 2) else False)
            outlier_idx = self.df[outlier_condition].index.tolist()
            
            return "Grade", outlier_idx
        
        elif "Grade" not in self.df.columns:
            return "Grade", []
        
    
    def check_grade_existence(self):
        unique_grade = self.df["Grade"].unique()
        unique_grade = [i_grade.upper() for i_grade in unique_grade]
        
        # get the map dictionary from map_db
        client = pymongo.MongoClient()
        db = client["Map_db"]
        collection = db[self.school_name]
        collection_df = pd.DataFrame(collection.find({}))
        
        grade_map = {}
        for i in range(len(collection_df)):
            grade_map[collection_df["Grade"][i]] = collection_df["USgrade"][i]
            
        unknown_grade = []
        for i_grade in unique_grade:
            if i_grade not in grade_map.keys():
                unknown_grade.append(i_grade)
        
        return "Grade", unknown_grade
        