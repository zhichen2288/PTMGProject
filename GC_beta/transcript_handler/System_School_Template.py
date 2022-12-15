import pandas as pd
import numpy as np

import pymongo


class SchoolTemplate:
    
    def __init__(self, school_name, table_data):
        self.school_name = school_name
        self.table_data = table_data
        
        
    '''
    data format

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
    

    def use_score_base_single_combo(self, table_data):
        
        '''
        prepare the synonym list
        '''
        course_synonym = ["course title", "course titles", "course", "courses", 
                          "module title", "subject name",
                          "subject", "subject title", "subjects",
                          "course name", "heads of passing"]

        score_synonym = ["score", "mark", "scores", "marks obtained", 
                         "obt", "marks obtained", "record", "scroe"]

        credit_synonym = ["credit", "unit attempted", "credits", 
                          "units", "cr", "course credits"]

        max_mark_synonym = ["maximum marks", "max"]

        min_mark_synonym = ["minimum marks", "min"]

        class_format_synonym = ["format"]


        
        '''
        extract id and column name
        '''
        id_colname = []
        for i_col_dict in table_data["columns"]:
            id_colname.append((i_col_dict["id"] ,i_col_dict["label"]))

    
        '''
        prepare the query
        '''
        query_course = []
        query_score = []
        query_credit = []
        query_min_mark = []
        query_max_mark = []
        query_class_format = []

        for i_id_colname in id_colname:
            # extract the id
            i_id = i_id_colname[0]
            # extract the column name
            i_colname = i_id_colname[1]

            # standardize format
            i_colname = i_colname.lower()

            if i_colname in course_synonym:
                query_course.append(i_id)
            elif i_colname in score_synonym:
                query_score.append(i_id)
            elif i_colname in credit_synonym:
                query_credit.append(i_id)
            elif i_colname in min_mark_synonym:
                query_min_mark.append(i_id)
            elif i_colname in max_mark_synonym:
                query_max_mark.append(i_id)
            elif i_colname in class_format_synonym:
                query_class_format.append(i_id)
                

        '''
        use column name to extract row data
        '''
        row_data = table_data["data"]

        output_data = []

        for i_row_data in row_data:
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

            if query_credit:
                output_one["Credit"] = i_row_data[query_credit[0]]

            if query_min_mark:
                output_one["Minimum Mark"] = i_row_data[query_min_mark[0]]

            if query_max_mark:
                output_one["Maximum Mark"] = i_row_data[query_max_mark[0]]

            if query_class_format:
                output_one["Class Format"] = i_row_data[query_class_format[0]]

            if output_one:
                output_data.append(output_one)
            

        return output_data
    
    
    def use_grade_base_single_combo(self, table_data):

        '''
        prepare the candidate list
        ''' 
        course_synonym = ["course title", "course titles", "course", "courses", 
                          "module title", "subject name",
                          "subject", "subject title", "subjects",
                          "course name", "heads of passing"]

        grade_synonym = ["grade", "grade obtained"]

        credit_synonym = ["credit", "unit attempted", "credits", 
                          "units", "cr", "course credits", "credit(s)"]

        
        '''
        extract id and colname of table data
        '''
        id_colname = []
        for i_col_dict in table_data["columns"]:
            id_colname.append((i_col_dict["id"] ,i_col_dict["label"]))

        
        '''
        prepare the query
        '''
        query_course = []
        query_grade = []
        query_credit = []


        for i_id_colname in id_colname:
            # extract the id
            i_id = i_id_colname[0]
            # extract the column name
            i_colname = i_id_colname[1]

            # standardize format
            i_colname = i_colname.lower()

            if i_colname in course_synonym:
                query_course.append(i_id)
            elif i_colname in grade_synonym:
                query_grade.append(i_id)
            elif i_colname in credit_synonym:
                query_credit.append(i_id)
                

        '''
        use schema to extract row data
        '''
        row_data = table_data["data"]

        output_data = []

        for i_row_data in row_data:
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


            if query_grade:
                output_one["Grade"] = i_row_data[query_grade[0]]

            if query_credit:
                output_one["Credit"] = i_row_data[query_credit[0]]

            if output_one:
                output_data.append(output_one)
        
        return output_data
        
    
    def apply_school_template(self):
        '''
        decide which school template should be used
        '''
        # prepare school template list
#         score_base_single_combo_list = ["Beijing Normal University Zhuhai",
#                                         "Beijing University of Posts and Telecommunications",
#                                         "Renmin University China",
#                                         "NMIMS University",
#                                         "Pune University"]
        
#         grade_base_single_combo_list = ["Beijing Normal University Hong Kong Baptist University United International College",
#                                         "Birla Institute Of Technology And Science",
#                                         "Manipal Institute of Technology",
#                                         "Vellore Institute of Technology",
#                                         ]

        client = pymongo.MongoClient()
        db = client["School_Template_db"]
        collection = db["School Template"]
        collection_df = pd.DataFrame(collection.find({}))
        score_base_single_combo_list = collection_df["Score Base"][0]
        grade_base_single_combo_list = collection_df["Grade Base"][0]
        
        
        school_data = 0
        if self.school_name in score_base_single_combo_list :
            school_data = self.use_score_base_single_combo(self.table_data)
            
        elif self.school_name in grade_base_single_combo_list:
            school_data = self.use_grade_base_single_combo(self.table_data)
            
        
        elif (self.school_name not in score_base_single_combo_list) and \
             (self.school_name not in grade_base_single_combo_list):
            school_data_try_1 = self.use_score_base_single_combo(self.table_data)
            school_data_try_2 = self.use_grade_base_single_combo(self.table_data)
            # * school_data_try_1 is a list of a bunch of dictionary
            
            if "Score" in school_data_try_1[0].keys():
                school_data = school_data_try_1
            elif "Grade" in school_data_try_1[0].keys():
                schoo_data= school_data_try_2
            
        
        '''
        clean school data
        '''
        
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
            
        if "Grade" in df.columns:
            df = df.replace("", np.nan)
            df = df.dropna(subset=['Grade'])
            
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
