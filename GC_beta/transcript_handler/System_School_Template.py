import pandas as pd
import numpy as np

import pymongo


class SchoolTemplate:
   
    def __init__(self, school_name, table_data):
        self.school_name = school_name
        self.table_data = table_data
       
        '''
        table data format
        {'columns': [{"id": "0", "label": "index", ...},
                     {"id": "1", "label": "Course Title", ...},
                     {"id": "2", "label": "Credit", ...},
                     {"id": "3", "label": "Score" ...},
                     {"id": 999999, "label": "+"},
                     {"id": 999998, "label": "Delete"}
                    ],
         "data": [{"0": "1", "1": "course_1", "2": "credit_1", "3": "score_1"},
                  {"0": "2", "1": "course_2", "2": "credit_2", "3": "score_2"}
                 ]
        }
        '''
   
   
    def get_key_columns(self, table_data):
        # prepare the synonym list
        client = pymongo.MongoClient()
        db = client["PTMG"]
        collection = db["synonym"]
        collection_df = pd.DataFrame(collection.find({}))
        synonym_idx = collection_df.index[0]

        #conversion_collection1 = Conversion.objects.as_pymongo()

        

       
        course_synonym = collection_df["course_synonym"][synonym_idx]
        score_synonym = collection_df["score_synonym"][synonym_idx]
        grade_synonym = collection_df["grade_synonym"][synonym_idx]
        credit_synonym = collection_df["credit_synonym"][synonym_idx]
        max_mark_synonym = collection_df["max_mark_synonym"][synonym_idx]
        min_mark_synonym = collection_df["min_mark_synonym"][synonym_idx]
       
       
        # extract id and column name
        columns_df = pd.DataFrame(table_data["columns"])
        id_colname_df = columns_df[["id", "label"]]
       
       
        # prepare the query list
        query_course = []
        query_score = []
        query_grade = []
        query_credit = []
        query_min_mark = []
        query_max_mark = []
       
        for i in range(len(id_colname_df)):
            # extract the id
            i_id = id_colname_df.iloc[i]["id"]
            # extract the column name
            i_colname = id_colname_df.iloc[i]["label"]
            # standardize format
            i_colname = i_colname.strip()
            i_colname = i_colname.lower()
           
            # detect the key columns
            if i_colname in course_synonym:
                query_course.append(i_id)
            elif i_colname in score_synonym:
                query_score.append(i_id)
            elif i_colname in grade_synonym:
                query_grade.append(i_id)
            elif i_colname in credit_synonym:
                query_credit.append(i_id)
            elif i_colname in min_mark_synonym:
                query_min_mark.append(i_id)
            elif i_colname in max_mark_synonym:
                query_max_mark.append(i_id)
               
       
        # use column id to extract row data
        row_data = table_data["data"]

        output_data = []

        for i_row_data in row_data:
            if len(i_row_data) > 1  :
                output_one = {}

                if query_course:
                    if len(query_course) > 1:
                        combine_course = []
                        for i_query_course in query_course:
                            combine_course.append(i_row_data[i_query_course])
                        combine_course = "-".join(combine_course)

                        output_one["Course"] = combine_course
                    else:
                        output_one["Course"] = i_row_data[query_course[0]]


                if query_score:
                    output_one["Score"] = i_row_data[query_score[0]]
                
                if query_grade:
                    output_one["Grade"] = i_row_data[query_grade[0]]

                if query_credit:
                    output_one["Credit"] = i_row_data[query_credit[0]]

                if query_min_mark:
                    output_one["Minimum Mark"] = i_row_data[query_min_mark[0]]

                if query_max_mark:
                    output_one["Maximum Mark"] = i_row_data[query_max_mark[0]]

                if output_one:
                    output_data.append(output_one)
           
        return output_data
   
   
    def apply_school_template(self):
   
        school_data = []
        school_data = self.get_key_columns(self.table_data)
       
        # preprocess school data
        df = pd.DataFrame(school_data)
#         b=(df.score=="")
#         df[b].index
#         precalculate_data=df.drop(df[b].index)
#         precalculate_data.reset_index(drop=True, inplace=True)
       
        if "Score" in df.columns:
            df["Score"] = pd.to_numeric(df['Score'], errors = "coerce")
            # * if ‘coerce’, then invalid parsing will be set as NaN
            # * if ‘ignore’, then invalid parsing will return the input
#             df = df.dropna(subset=['Score'])
            # * subset: drop rows with Nan value in specific columns
           
        # if "Grade" in df.columns:
        #     df = df.replace("", np.nan)
        #     df = df.dropna(subset=['Grade'])
           
        if "Credit" in df.columns:
            df["Credit"] = pd.to_numeric(df['Credit'], errors = "coerce")
#             df = df.dropna(subset=['Credit'])
            #print("Dropped abnormal credit!")
           
        if "Minimum Mark" in df.columns:
            df["Minimum Mark"] = pd.to_numeric(df['Minimum Mark'], errors = "coerce")
#             df = df.dropna(subset=['Minimum Mark'])
            # * subset: drop rows with Nan value in specific columns
           
        if "Maximum Mark" in df.columns:
            df["Maximum Mark"] = pd.to_numeric(df['Maximum Mark'], errors = "coerce")
#             df = df.dropna(subset=['Maximum Mark'])
            # * subset: drop rows with Nan value in specific columns
           
        return df