import pandas as pd
import numpy as np
import pymongo
from bson.objectid import ObjectId
import json
from .System_Data_Check import DataCheck


def get_page_data(student):
    # Access mongoDB
    # client = pymongo.MongoClient()
    # db=client["PTMG"]
    # collection = db.student
    # # * collection is like a table to hold document
    # #   document is the thing we store in mongodb
   
    # sid_document = collection.find_one({'_id': sid})
   
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
    school_name = student.education.university

   
    # Get Page Info
    processed_data = student.transcript.processed_data

    table_list = []
    for i in range(len(processed_data)):
        i_table = processed_data[i]["table_data"]
        i_table = json.loads(i_table)
       
        table_list.append(i_table)
   
    return school_name, table_list


def run_data_check(student):
    def find_id(table_data):
        score_synonym = ["score", "mark", "scores", "marks obtained",
                         "obt", "marks obtained", "record", "scroe", "marks"]

        credit_synonym = ["credit", "unit attempted", "credits", "credit(s)",
                          "units", "cr", "course credits"]

        grade_synonym = ["grade", "grade obtained"]


        id_colname = []
        for i_col_dict in table_data["columns"]:
            id_colname.append((i_col_dict["id"] ,i_col_dict["label"]))

        query_score = []
        query_credit = []
        query_grade = []

        for i_id_colname in id_colname:
            # extract the id
            i_id = i_id_colname[0]
            # extract the column name
            i_colname = i_id_colname[1]

            # standardize format
            i_colname = i_colname.lower()

            if i_colname in score_synonym:
                query_score.append(i_id)
            elif i_colname in credit_synonym:
                query_credit.append(i_id)
            elif i_colname in grade_synonym:
                query_grade.append(i_id)


        return query_score, query_credit, query_grade
   
   
    school_name, table_list = get_page_data(student)
   
    total_outlier_list = {}
   
    for i in range(len(table_list)):
        id_list = find_id(table_list[i])
       
        data_check_obj = DataCheck(school_name, table_list[i])
       
        table_outlier = []
       
        outlier_score_dtype = data_check_obj.check_score_dtype()
       
        if outlier_score_dtype:    
            outlier_idx_sd = outlier_score_dtype[1]
            outlier_id_sd = id_list[0]
            outlier_info_sd = ["invalid score data type", outlier_id_sd, outlier_idx_sd]

            if len(outlier_idx_sd) != 0:
                table_outlier.append(outlier_info_sd)
       
       
        outlier_credit_dtype = data_check_obj.check_credit_dtype()
       
        if outlier_credit_dtype:
            outlier_idx_cd = outlier_credit_dtype[1]
            outlier_id_cd = id_list[1]
            outlier_info_cd = ["invalid credit data type", outlier_id_cd, outlier_idx_cd]

            if len(outlier_idx_cd) != 0:
                table_outlier.append(outlier_info_cd)
           
           
        outlier_score_range = data_check_obj.check_score_range()
       
        if outlier_score_range:
            outlier_idx_sr = outlier_score_range[1]
            outlier_id_sr = id_list[0]
            outlier_info_sr = ["invalid score range", outlier_id_sr, outlier_idx_sr]
           
            if len(outlier_idx_sr) != 0:
                table_outlier.append(outlier_info_sr)
           
       
        outlier_credit_range = data_check_obj.check_credit_range()
       
        if outlier_credit_range:
            outlier_idx_cr = outlier_credit_range[1]
            outlier_id_cr = id_list[1]
            outlier_info_cr = ["invalid credit range", outlier_id_cr, outlier_idx_cr]

            if len(outlier_idx_cr) != 0:
                table_outlier.append(outlier_info_cr)
           
           
        outlier_existence_grade = data_check_obj.check_grade_existence()
       
        if outlier_existence_grade:
            outlier_idx_eg = outlier_existence_grade[1]
            outlier_id_eg = id_list[2]
            outlier_info_eg = ["non existence grade", outlier_id_eg, outlier_idx_eg]
           
            if len(outlier_idx_eg) != 0:
                table_outlier.append(outlier_info_eg)
           
           
        if table_outlier:
            outlier_list = {}
            message_list = [i_table_outlier[0] for i_table_outlier in table_outlier]
            outlier_list["message"] = message_list

            for j in range(len(table_outlier)):
                i_column = int(table_outlier[j][1][0])
                i_column_mol = i_column + 7*(j+1)
                outlier_list[i_column_mol] = table_outlier[j][2]

            total_outlier_list[i] = outlier_list

    total_outlier_list = json.dumps(total_outlier_list)
       
    return total_outlier_list
