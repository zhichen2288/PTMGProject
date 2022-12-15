import pandas as pd
import numpy as np
import pymongo
from bson.objectid import ObjectId
import json
from .System_School_Template import SchoolTemplate


def get_page_data(sid):
    # Access mongoDB
    client = pymongo.MongoClient()
    db = client.test
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

    # Get table list
    table_list = []
    for i in range(len(ret['transcript']['processed_data'])):
        i_table = ret['transcript']['processed_data'][i]["table_data"]
        i_table = json.loads(i_table)
        
        table_list.append(i_table)
    
    return school_name, table_list


def run_school_template(sid):
    
    school_name, table_list = get_page_data(sid)
    
    table_df = pd.DataFrame()
    for i in range(len(table_list)):
        i_table = table_list[i]

        # initialize object
        school_obj = SchoolTemplate(school_name, i_table)
        try:
            i_table_df = school_obj.apply_school_template()
        except Exception:
            #print("Could not process table %d" %(page_i))
            continue  

        table_df = pd.concat([table_df, i_table_df])

    table_df.reset_index(drop = True, inplace = True)
    
    return table_df