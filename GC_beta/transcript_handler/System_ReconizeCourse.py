import pickle
import os
import pandas as pd
import numpy as np
import json
import pymongo
from bson.objectid import ObjectId
#from model_file import vec_multinomialNB 



class ReconizeCourse():
    def __init__(self, data_list): 
        self.model_file = 'GC_beta\\transcript_handler\\model_file\\vec_multinomialNB.pkl'
        self.data_list = data_list
        # self.sid = sid
        # self.tab_name = "main"
        # self.df = self.get_tab_data_df()
        
        
    # def get_tab_data_df(self):
    #     client = pymongo.MongoClient()
    #     db = client["PTMG"]
    #     collection = db["student"]
    #     collection_df = pd.DataFrame(collection.find({}))

    #     student_document = collection_df[collection_df["_id"] == self.sid]
        
    #     consolidatedData = student_document["consolidatedData"]
    #     consolidatedData_idx = consolidatedData.index[0]
    #     consolidatedData = consolidatedData[consolidatedData_idx]

    #     tabs = consolidatedData["tabs"]
    #     tab_idx = tabs.index(self.tab_name)

    #     tab_data = consolidatedData["tabContent"][tab_idx]["data"]
    #     tab_data = json.loads(tab_data)
        
    #     tab_data_df = pd.DataFrame(tab_data)
        
    #     if "Score" in tab_data_df:
    #         tab_data_df["Score"] = pd.to_numeric(tab_data_df['Score'], errors = "coerce")
            
    #     if "Credit" in tab_data_df:
    #         tab_data_df["Credit"] = pd.to_numeric(tab_data_df['Credit'], errors = "coerce")
        
    #     return tab_data_df
    
    
    def prepare_model(self):
        model_file = self.model_file

        with open(model_file, "rb") as f:
            vec_obj, model = pickle.load(f)
        
        return vec_obj, model
    
    
    def generate_math_programming_language(self):
        course_test = pd.DataFrame(self.data_list)
        vec_obj, loaded_model = self.prepare_model()

        course_vec = vec_obj.transform(course_test["Course"])
        predict_res = loaded_model.predict_proba(course_vec)
        
        condition = predict_res > 0.6
        idx = np.where(condition == True)

    
        res = list(zip(idx[0], idx[1]))

        math_list = []
        language_list = []
        tool_list = []

        for i in res:
            if i[1] == 0:
                math_list.append(i[0])

            elif i[1] == 1:
                language_list.append(i[0])

            elif i[1] == 2:
                tool_list.append(i[0])
        
        
        math_df = course_test.iloc[math_list]

        programming_df = course_test.iloc[tool_list]
        
        language_df = course_test.iloc[language_list]
        
        
        # convert the dataframe to the json format to save in the mongoDB
        
        
        math_data_list = []
        if len(math_df) != 0:
            math_dict = math_df.to_dict('split')
            math_data = math_dict["data"]
            math_column_list = math_df.columns
            
            for i_math_data in math_data:
                i_math_row = {}
                for i_math_column in enumerate(math_column_list):
                    i_math_row[i_math_column[1]] = i_math_data[i_math_column[0]]
                math_data_list.append(i_math_row)
        
        
        programming_data_list = []
        if len(programming_df) != 0:
            programming_dict = programming_df.to_dict('split')
            programming_data = programming_dict["data"]
            programming_column_list = programming_df.columns

            
            for i_programming_data in programming_data:
                i_programming_row = {}
                for i_programming_column in enumerate(programming_column_list):
                    i_programming_row[i_programming_column[1]] = i_programming_data[i_programming_column[0]]
                programming_data_list.append(i_programming_row)
                
                
        language_data_list = []         
        if len(language_df) != 0:
            language_dict = language_df.to_dict('split')
            language_data = language_dict["data"]
            language_column_list = language_df.columns

            
            for i_language_data in language_data:
                i_language_row = {}
                for i_language_column in enumerate(language_column_list):
                    i_language_row[i_language_column[1]] = i_language_data[i_language_column[0]]
                language_data_list.append(i_language_row)
            
        
        return math_data_list, programming_data_list, language_data_list
    




if __name__ == "__main__":
    # model_file = "vec_multinomialNB.pkl"
    sid = ObjectId("643c78d7b4babd7287776bb0")
    RC = ReconizeCourse(sid)

    m, p, l = RC.generate_math_programming_language()

    print(m)
    print(p)
    print(l)