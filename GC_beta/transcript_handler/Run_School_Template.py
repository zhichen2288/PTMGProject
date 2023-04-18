import pandas as pd
import numpy as np
import pymongo
from bson.objectid import ObjectId
import json
from .System_School_Template import SchoolTemplate
from .models import University, Department, Transcript, ProcessedTable, TabContent, ConsolidatedData


def get_page_data(student):
    # Access mongoDB
    # client = pymongo.MongoClient()
    # db = client.test
    # collection = db.student
    # * collection is like a table to hold document
    #   document is the thing we store in mongodb
   
   
    # ret = collection.find_one({'_id': sid})


    processed_transcripts = student.transcript.processed_data
    university = student.education.university
   
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
    school_name = university

    # Get table list
    table_list = []
    for i in range(len(processed_transcripts)):
        i_table = processed_transcripts[i]["table_data"]
        i_table = json.loads(i_table)
       
        table_list.append(i_table)
   
    return school_name, table_list


def run_school_template(sid, student):
   
    school_name, table_list = get_page_data(student)
   
    table_df = pd.DataFrame()
    for i in range(len(table_list)):
        i_table = table_list[i]

        # initialize object
        SchoolTemplate_obj = SchoolTemplate(school_name, i_table)
        try:
            i_table_df = SchoolTemplate_obj.apply_school_template()
        except Exception:
            #print("Could not process table %d" %(page_i))
            continue  

        table_df = pd.concat([table_df, i_table_df])

    table_df.reset_index(drop = True, inplace = True)
    table_df.fillna("", inplace = True)

    # convert the dataframe to the json format to save in the mongoDB
    table_df_2_dict = table_df.to_dict('split')
    data = table_df_2_dict["data"]
    column_list = table_df.columns
   

    data_list = []
    for i_data in data:
        i_row = {}
        for i_column in enumerate(column_list):
            i_row[i_column[1]] = i_data[i_column[0]]
        data_list.append(i_row)

    tabContent = []
    tabs = []
    tabs.append("main")
    tabs.append("math")
    if(len(data_list) == 0):
        maintab = TabContent(name = "main", data = "", GPA = "")
    else:
        maintab = TabContent(name = "main", data = json.dumps(data_list), GPA = "")

    mathtab = TabContent(name = "math", data = "", GPA = "")
    tabContent.append(maintab)
    tabContent.append(mathtab)

    consolidatedData = ConsolidatedData(tabs = tabs, tabContent = tabContent)
   
    return consolidatedData