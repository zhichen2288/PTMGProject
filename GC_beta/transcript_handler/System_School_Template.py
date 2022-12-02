import pandas as pd
import numpy as np

import pymongo


class SchoolTemplate():
    
    def __init__(self, school_name, table_data):
        self.school_name = school_name
        self.table_data = table_data
        
        
    '''
    data format

    {'columns': [{"id": "index", ...},
                 {"id": "course title", ...},
                 {"id": "score", ...},
                 {"id": "credit", ...}
                ],

     "data": [{"course title": "ct1", "score": s1, "credit": c1},
              {"course title": "ct2", "score": s2, "credit": c2}
             ]

    }

    '''
    

    def use_score_base_single_combo(self, table_data):
        
        '''
        prepare the candidate list
        '''
        course = ["course title", "course titles", "course", "courses", 
                  "module title", "subject name",
                  "subject", "subject title", "subjects",
                  "course name", "heads of passing"]

        score = ["score", "mark", "scores", "marks obtained", 
                 "obt", "marks obtained", "record", "scroe"]

        credit = ["credit", "unit attempted", "credits", 
                  "units", "cr", "course credits"]

#         grade_point = ["grade point", "gradepoint", "spi", "grade",
#                        "grade points", "gpa", "aggregate marks/cgpa", "grade pt(G)", "grade point (g)"]

        max_mark = ["maximum marks", "max"]
    
        min_mark = ["minimum marks", "min"]
    
        class_format = ["format"]


        
        '''
        extract table data schema 
        '''
        schema = table_data['columns']

        column_name = []

        for i_schema in schema:
            column_name.append(i_schema["id"])
        
        # deal with the last + column
        column_name.pop()
         
    
        '''
        prepare the query
        '''
        query_course = []
        query_score = ""
        query_credit = ""
#         query_grade_point = ""
        query_min_mark = ""
        query_max_mark = ""
        query_class_format = ""

    
        
        for i_column_name in column_name:
            
            # standardize format
            column = i_column_name.lower()

            if column in course:
                query_course.append(i_column_name)
            elif column in score:
                query_score = i_column_name
            elif column in credit:
                query_credit = i_column_name
#             elif column in grade_point:
#                 query_grade_point = i_column_name
            elif column in min_mark:
                query_min_mark = i_column_name
            elif column in max_mark:
                query_max_mark = i_column_name
            elif column in class_format:
                query_class_format = i_column_name
                

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
                    output_one["Course"] = " ".join(combine_course)
                else:
                    output_one["Course"] = i_row_data[query_course[0]]
#             else:
#                 output_one["Course"] = None
                

            if query_score:
                output_one["Score"] = i_row_data[query_score]
#             else:
#                 output_one["Score"] = None
                
            if query_credit:
                output_one["Credit"] = i_row_data[query_credit]
#             else:
#                 output_one["Credit"] = None
            

#             if query_grade_point:
#                 output_one["Grade_Point"] = i_row_data[query_grade_point]
#             else:
#                 output_one["Grade_Point"] = None

            if query_min_mark:
                output_one["Minimum Mark"] = i_row_data[query_min_mark]
            
            if query_max_mark:
                output_one["Maximum Mark"] = i_row_data[query_max_mark]
            
            if query_class_format:
                output_one["Class Format"] = i_row_data[query_class_format]

            if output_one:
                output_data.append(output_one)
            

        return output_data
    
    
    def use_grade_base_single_combo(self, table_data):

        '''
        prepare the candidate list
        ''' 
        course = ["course title", "course titles", "course", "courses", 
                  "module title", "subject name",
                  "subject", "subject title", "subjects",
                  "course name", "heads of passing"]

        grade = ["grade", "grade obtained"]

        credit = ["credit", "unit attempted", "credits", 
                  "units", "cr", "course credits", "credit(s)"]

#         grade_point = ["grade point", "gradepoint", "spi",
#                        "grade points", "gpa", "aggregate marks/cgpa", "grade pt(G)", "grade point (g)"]

        
        '''
        extract table data schema 
        '''
        schema = table_data["columns"]

        column_name = []
        
        for i_schema in schema:
            column_name.append(i_schema["id"])

        column_name.pop()
        
        
        '''
        prepare the query
        '''
        query_course = []
        query_grade = ""
        query_credit = ""
#         query_grade_point = ""

        for i_column_name in column_name:
            # standardize format
            column = i_column_name.lower()

            if column in course:
                query_course.append(i_column_name)
            elif column in grade:
                query_grade = (i_column_name)
            elif column in credit:
                query_credit = (i_column_name)
#             elif column in grade_point:
#                 query_grade_point = (i_column_name)

                

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
                    output_one["Course"] = " ".join(combine_course)
                else:
                    output_one["Course"] = i_row_data[query_course[0]]
#             else:
#                 output_one["Course"] = None
                
            if query_grade:
                output_one["Grade"] = i_row_data[query_grade]
#             else: 
#                 output_one["Grade"] = None
                
            if query_credit:
                output_one["Credit"] = i_row_data[query_credit]
#             else: 
#                 output_one["Credit"] = None

#             if query_grade_point:
#                 output_one["Grade_Point"] = i_row_data[query_grade_point]
#             else:
#                 output_one["Grade_Point"] = None

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
        score_base_single_combo_list = collection_df["Score Based"][0]
        grade_base_single_combo_list = collection_df["Grade Based"][0]
        
        
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
