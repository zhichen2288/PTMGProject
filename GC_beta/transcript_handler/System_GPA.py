import pandas as pd
import numpy as np
import pymongo
from bson.objectid import ObjectId
import json

from .models import Conversion




class GPA():
    def __init__(self, sid, tab_name):
        self.sid = sid
        self.tab_name = tab_name
        self.student_collection_df, self.conversion_collection_df = self.get_collection()
        self.school_name = self.get_school_name()
        self.df = self.get_tab_data_df()
        
    
    def get_collection(self):
        client = pymongo.MongoClient()
        db = client["PTMG"]
        
        student_collection = db["student"]
        student_collection_df = pd.DataFrame(student_collection.find({}))
        
        conversion_collection = db["conversion"]
        conversion_collection_df = pd.DataFrame(conversion_collection.find({}))
        
        return student_collection_df, conversion_collection_df
            
        
    def get_school_name(self):
#         client = pymongo.MongoClient()
#         db = client["PTMG"]
#         collection = db["student"]
#         collection_df = pd.DataFrame(collection.find({}))

        student_document = self.student_collection_df[self.student_collection_df["_id"] == self.sid]
        student_sr = student_document.iloc[0, :]
        school_name = student_sr['education']['university']
        
        return school_name
        
        
    def get_tab_data_df(self):
#         client = pymongo.MongoClient()
#         db = client["PTMG"]
#         collection = db["student"]
#         collection_df = pd.DataFrame(collection.find({}))

        student_document = self.student_collection_df[self.student_collection_df["_id"] == self.sid]
        student_sr = student_document.iloc[0, :]
        consolidatedData = student_sr["consolidatedData"]

        tabs = consolidatedData["tabs"]
        tab_idx = tabs.index(self.tab_name)

        tab_data = consolidatedData["tabContent"][tab_idx]["data"]
        tab_data = json.loads(tab_data)
        
        tab_data_df = pd.DataFrame(tab_data)
        
        if "Score" in tab_data_df:
            tab_data_df["Score"] = pd.to_numeric(tab_data_df['Score'], errors = "coerce")
            
        if "Credit" in tab_data_df:
            tab_data_df["Credit"] = pd.to_numeric(tab_data_df['Credit'], errors = "coerce")
        
        return tab_data_df
        
        
    def score_2_USgrade(self):
        '''
        define a function to convert percentage score to usgrade
        '''
#         client = pymongo.MongoClient()
#         db = client["PTMG"]
#         collection = db["conversion"]
#         collection_df = pd.DataFrame(collection.find({}))

        university_document = self.conversion_collection_df[self.conversion_collection_df["university"] == self.school_name]
        university_document_sr = university_document.iloc[0, :]
        conversion_df = pd.DataFrame(university_document_sr["score_scheme"])
        
        def convert_s(score):
            for i in range(len(conversion_df)):
                left_end_point = conversion_df.loc[i, "score_from"]
                right_end_point = conversion_df.loc[i, "score_to"]

                if (score >= left_end_point) & (score < right_end_point):
                    USgrade = conversion_df.loc[i, "usgrade"]
                    return USgrade

        self.df["USgrade"] = self.df["Score"].apply(convert_s)

        return self.df
    
    
    def grade_2_USgrade(self):
        '''
        define a function to convert transcript grade to usgrade
        '''
#         client = pymongo.MongoClient()
#         db = client["PTMG"]
#         collection = db["conversion"]
#         collection_df = pd.DataFrame(collection.find({}))

        university_document = self.conversion_collection_df[self.conversion_collection_df["university"] == self.school_name]
        university_document_sr = university_document.iloc[0, :]
        conversion_df = pd.DataFrame(university_document_sr["grade_scheme"])
        
        
        def convert_s(grade):
            transcript_grade_2_usgrade_dict = {}
            for i in range(len(conversion_df)):
                transcript_grade_2_usgrade_dict[conversion_df["transcript_grade"][i]] = conversion_df["usgrade"][i]

            try:
                USgrade = transcript_grade_2_usgrade_dict[grade]
                return USgrade
            except:
                return None

        self.df["USgrade"] = self.df["Grade"].apply(convert_s)

        return self.df
    
    
    def USgrade_2_GP(self, USgrade):
        '''
        define a function to map letter grade to GP
        '''
    
        # define a dictionary to map letter grade to GP
        USgrade_2_GP_dict = {

        "A": 4.00, "a": 4.00,
        "A-": 3.67, "a-": 3.67,
        "B+": 3.33, "b+": 3.33,
        "B": 3.00, "b": 3.00,
        "B-": 2.67, "b-": 2.67,
        "C+": 2.33, "c+": 2.33,
        "C": 2.00, "c": 2.00,
        "C-": 1.67, "c-": 1.67,
        "D+": 1.33, "d+": 1.33,
        "D": 1.00, "d": 1.00,
        "F": 0.00, "f": 0.00

        }
    
        GP = USgrade_2_GP_dict[USgrade]
    
        return GP
    
    
    def score_base_calculate_GPA(self):
        if "Maximum Mark" in self.df.columns:
            self.df["Score"] = self.df["Score"]*100/self.df["Maximum Mark"]
        
        self.score_2_USgrade()
        #self.df["Score"].apply(self.score_2_USgrade)
        self.df = self.df.dropna()
        gp = self.df["USgrade"].apply(self.USgrade_2_GP)
        
        if "Credit" in self.df.columns:
            sum_gp = (gp * self.df["Credit"]).sum()    
            sum_credit = self.df["Credit"].sum()
            GPA = sum_gp/sum_credit
            
        elif "Credit" not in self.df.columns:
            sum_gp = gp.sum()
            GPA = sum_gp/len(gp)

        return GPA
    
    
    def grade_base_calculate_GPA(self):
        self.grade_2_USgrade()
        #self.df["Grade"].apply(self.grade_2_USgrade)
        self.df = self.df.dropna()
        gp = self.df["USgrade"].apply(self.USgrade_2_GP)
        
        if "Credit" in self.df.columns:
            sum_gp = (gp * self.df["Credit"]).sum()
            sum_credit = self.df["Credit"].sum()
            GPA = sum_gp/sum_credit
            
        elif "Credit" not in self.df.columns:
            sum_gp = gp.sum()
            GPA = sum_gp/len(gp)

        return GPA
    
    
    def calculate_GPA(self):
#         client = pymongo.MongoClient()
#         db = client["PTMG"]
#         collection = db["conversion"]
#         collection_df = pd.DataFrame(collection.find({}))

        
        university_document = self.conversion_collection_df[self.conversion_collection_df["university"] == self.school_name]
        
        if len(university_document) != 0:
            university_document_sr = university_document.iloc[0, :]

            SG_base = university_document_sr["SG_base"]

            if SG_base == "score":
                GPA = self.score_base_calculate_GPA()
                
            elif SG_base == "grade":
                GPA = self.grade_base_calculate_GPA()
                

            client = pymongo.MongoClient()
            db = client["PTMG"]
            collection = db.student

            # Define the filter to find the student document by ID
            filter = { "_id": self.sid }

            # Define the update query to update the "GPA" field in the "tabContent" array
            update = { "$set": { "consolidatedData.tabContent.$[elem].GPA": str(GPA) } }
            array_filters = [ { "elem.name": self.tab_name } ]

            # Execute the update query
            result = collection.update_one(filter, update, array_filters=array_filters)

            # Print the number of documents updated
            #print(result.modified_count)

            return GPA
        
        
        if len(university_document) == 0:
            try:
                self.school_name = "China General Score"
                GPA = self.score_base_calculate_GPA()
                
            
            except:
                ###### to be continue
                self.school_name = "China General Grade"
                GPA = self.grade_base_calculate_GPA()
            

            client = pymongo.MongoClient()  
            db = client["PTMG"]
            collection = db.student

            # Define the filter to find the student document by ID
            filter = { "_id": self.sid }

            # Define the update query to update the "GPA" field in the "tabContent" array
            update = { "$set": { "consolidatedData.tabContent.$[elem].GPA": str(GPA) } }
            array_filters = [ { "elem.name": self.tab_name } ]

            # Execute the update query
            result = collection.update_one(filter, update, array_filters=array_filters)

            # Print the number of documents updated
            #print(result.modified_count)

            return GPA

        
        return None
    