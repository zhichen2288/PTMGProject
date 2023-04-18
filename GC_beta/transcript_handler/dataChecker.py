import pandas as pd
import numpy as np
import pymongo
from bson.objectid import ObjectId
import json
from .System_Reminder import Reminder


def get_page_data(sid):
    # Access mongoDB
    client = pymongo.MongoClient()
    db=client.test
    collection = db.student
    # * collection is like a table to hold document
    #   document is the thing we store in mongodb
    
    ret = collection.find_one({'_id': sid})
    
    '''
    {"id": __,
     "transcript": {"processed_data": [{"page": 0,
                                        "table_num": 0,
                                        "table_data": {"columns": [],
                                                       "data": []}},
                                       {"page": 0,
                                        "table_num": 1,
                                        "table_data": {"columns": [],
                                                       "data": []}},
                                       {"page": 1,
                                        "table_num": 2,
                                        "table_data": {"columns": [],
                                                       "data": []}},
                                       {"page": 1,
                                        "table_num": 3,
                                        "table_data": {"columns": [],
                                                       "data": []}}
                                      ]
                   } 
                   
                                                       
     "education": {"university": "___";
                   "department": "___"
                   }
     
     
    }
    
    '''
    
    
    # Get School Info
    school_name = ret['education']['university']

    
    # Get Page Info
    table_list = []
    for i in range(len(ret['transcript']['processed_data'])):
        i_table = ret['transcript']['processed_data'][i]["table_data"]
        i_table = json.loads(i_table)
        
        table_list.append(i_table)
    
    return school_name, table_list




def run_reminder(sid):
    def find_original_column(table_data):
        score = ["score", "mark", "scores", "marks obtained", 
                 "obt", "marks obtained", "record", "scroe"]

        credit = ["credit", "unit attempted", "credits", 
                  "units", "cr", "course credits"]

        grade = ["grade", "grade obtained"]


        schema = table_data["columns"]
        column_name = []
        for i_schema in schema:
            column_name.append(i_schema["id"])

        column_name.pop()

        query_score = ""
        query_credit = ""
        query_grade = ""

        for i_column_name in column_name:
            # standardize format
            column = i_column_name.lower()

            if column in score:
                query_score = i_column_name
            elif column in credit:
                query_credit = i_column_name
            elif column in grade:
                query_grade = i_column_name

        column_to_original = {}

        if query_score:
            column_to_original["Score"] = query_score

        if query_credit:
            column_to_original["Credit"] = query_credit

        if query_grade:
            column_to_original["Grade"] = query_grade


        return column_to_original
    
    
    school_name, table_list = get_page_data(sid)
    
    
    outlier_list = {}
    
    for i in range(len(table_list)):
        column_to_original = find_original_column(table_list[i])
        
        reminder_obj = Reminder(school_name, table_list[i])
        
        table_outlier = []
        
        outlier_score_dtype = reminder_obj.check_score_dtype()
        
        if outlier_score_dtype:
        
            original_column_sd = column_to_original[outlier_score_dtype[0]]
            outlier_idx_sd = np.array(outlier_score_dtype[1])
            outlier_idx_sd = outlier_idx_sd + 1

            outlier_info_sd = ["score data type", original_column_sd, outlier_idx_sd]
            
            if outlier_idx_sd.size != 0: 
                table_outlier.append(outlier_info_sd)
        
        
        outlier_credit_dtype = reminder_obj.check_credit_dtype()
        
        if outlier_credit_dtype:
            original_column_cd = column_to_original[outlier_credit_dtype[0]]
            outlier_idx_cd = np.array(outlier_credit_dtype[1])
            outlier_idx_cd = outlier_idx_cd + 1
            
            outlier_info_cd = ["credit data type", original_column_cd, outlier_idx_cd]
            
            if outlier_idx_cd.size != 0:
                table_outlier.append(outlier_info_cd)
            
            
        outlier_score_range = reminder_obj.check_score_range()
        
        if outlier_score_range:
            original_column_sr = column_to_original[outlier_score_range[0]]
            outlier_idx_sr = np.array(outlier_score_range[1])
            outlier_idx_sr = outlier_idx_sr + 1
            
            outlier_info_sr = ["score range", original_column_sr, outlier_idx_sr]
            
            if outlier_idx_sr.size != 0:
                table_outlier.append(outlier_info_sr)
            
        
        outlier_credit_range = reminder_obj.check_credit_range()
        
        if outlier_credit_range:
            original_column_cr = column_to_original[outlier_credit_range[0]]
            outlier_idx_cr = np.array(outlier_credit_range[1])
            outlier_idx_cr = outlier_idx_cr + 1
            
            outlier_info_cr = ["credit range", original_column_cr, outlier_idx_cr]
            
            if outlier_idx_cr.size != 0:
                table_outlier.append(outlier_info_cr)
            
            
        if table_outlier:
            outlier_list[i] = table_outlier
        
    return outlier_list