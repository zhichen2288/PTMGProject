import pandas as pd
import numpy as np
import pymongo




class GPA():
    def __init__(self, school_name, df):
        self.school_name = school_name
        self.df = df
        
        
    # def score_2_letter(self, score):
    #     '''
    #     define a function to map percentage score to letter
    #     '''
    
    #     # use two sides restriction to exclude the outlier
    #     if (score >= 93) and (score <= 100):
    #         letter = "A"
    #     elif (score >= 90) and (score < 93): 
    #         letter = "A-"
    #     elif (score >= 87) and (score < 90):
    #         letter = "B+"
    #     elif (score >= 83) and (score < 87):
    #         letter = "B"
    #     elif (score >= 80) and (score < 83):
    #         letter = "B-"
    #     elif (score >= 77) and (score < 80):
    #         letter = "C+"
    #     elif (score >= 73) and (score < 77):
    #         letter = "C"
    #     elif (score >= 70) and (score < 73):
    #         letter = "C-"
    #     elif (score >= 67) and (score < 70):
    #         letter = "D+"
    #     elif (score >= 65) and (score < 67):
    #         letter = "D"
    #     elif (score < 65) and (score > 0):
    #         letter = "F"
        
    #     else:
    #         letter = None
    
    #     return letter

    def score_2_USgrade(self, score):
        '''
        define a function to map percentage score to letter
        '''
        client = pymongo.MongoClient()
        db = client["Map_db"]
        collection = db[self.school_name]
        collection_df = pd.DataFrame(collection.find({}))
        
        # deal with the situation when school name is inside the database
        if len(collection_df) != 0:
            def convert_s(score):
                for i in range(len(collection_df)):
                    left_end_point = collection_df.loc[i, "From"]
                    right_end_point = collection_df.loc[i, "To"]
                    
                    if (score >= left_end_point) & (score < right_end_point):
                        USgrade = collection_df.loc[i, "USgrade"]
                        return USgrade
            
            self.df["USgrade"] = self.df["Score"].apply(convert_s)
            
            return self.df
        
        
        # deal with the situation when school name is not inside the database
        collection = db["General_Score"]
        collection_df = pd.DataFrame(collection.find({}))
        
        if len(collection_df) != 0:
            def convert_g(score):
                for i in range(len(collection_df)):
                    left_end_point = collection_df.loc[i, "From"]
                    right_end_point = collection_df.loc[i, "To"]
                    
                    if (score >= left_end_point) & (score < right_end_point):
                        USgrade = collection_df.loc[i, "USgrade"]
                        return USgrade
            
            self.df["USgrade"] = self.df["Score"].apply(convert_g)
            
            return self.df

    
    def grade_2_USgrade(self, grade):
        client = pymongo.MongoClient()
        db = client["Map_db"]
        collection = db[self.school_name]
        collection_df = pd.DataFrame(collection.find({}))
        
        if len(collection_df) != 0:
            
            def convert_s(grade):
                map_grade_2_usgrade = {}
                for i in range(len(collection_df)):
                    map_grade_2_usgrade[collection_df["Grade"][i]] = collection_df["USgrade"][i]
                    
                try:
                    USgrade = map_grade_2_usgrade[grade]
                    return USgrade
                except:
                    return None
            
            self.df["USgrade"] = self.df["Grade"].apply(convert_s)
            
            return self.df

        
        collection = db["General_Grade"]
        collection_df = pd.DataFrame(collection.find({}))
        
        if len(collection_df) != 0:
            
            def convert_g(grade):
                map_grade_2_usgrade = {}
                for i in range(len(collection_df)):
                    map_grade_2_usgrade[collection_df["Grade"][i]] = collection_df["USgrade"][i]
                    
                try:
                    USgrade = map_grade_2_usgrade[grade]
                    return USgrade
                except:
                    return None
            
            self.df["USgrade"] = self.df["Grade"].apply(convert_g)
            
            return self.df


    def USgrade_2_GP(self, USgrade):
        '''
        define a function to map letter grade to GP
        '''
    
        # define a dictionary to map letter grade to GP
        map_USgrade_2_GP = {

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
    
        GP = map_USgrade_2_GP[USgrade]
    
        return GP
        
    
    def score_base_calculate_GPA(self):
        self.df["Score"].apply(self.score_2_USgrade)
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
    
    
#     def score_base_calculate_GPA(self,df):
        
#         gpa=0
#         sum_credit=0
#         for i in range(len(df)):
#             score = float(df.loc[i,"Score"])
#             credit = float(df["Credit"].loc[i])
#             letter = self.scores_2_letter(score)
#             gp=self.letter_2_GP(letter)

#             sum_credit = sum_credit + credit
#             z=gp*credit

#             gpa=gpa+z


#         gpa = gpa/sum_credit

#         return gpa


    def grade_base_calculate_GPA(self):
        self.df["Grade"].apply(self.grade_2_USgrade)
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
    
    
#     def grade_base_calculate_GPA(self,df):
#         gpa=0
#         sum_credit=0
#         for i in range (len(df)):
#             grade = df.loc[i,"Grade"]
#             credit = float(df["Credit"].loc[i])
#             gp=self.letter_2_GP(grade)

#             sum_credit = sum_credit + credit
#             z=gp*credit
#             gpa=gpa+z

#         gpa = gpa/sum_credit

#         return gpa


#     def birla_calculate_GPA(self, df):
#         def letter_2_gp10_birla(grade):
#             number = 0

#             if(grade == "A"):
#                 number = 10
#             elif(grade == "A-"):
#                 number = 9
#             elif(grade == "B"):
#                 number = 8
#             elif(grade == "B-"):
#                 number = 7
#             elif(grade == "C"):
#                 number = 6
#             elif(grade == "C-"):
#                 number = 5
#             elif(grade == "D"):
#                 number = 4
#             elif(grade == "E"):
#                 number = 2

#             return number
        
        
#         # deal with situation when grade has tail
#         df['Grade'] = df['Grade'].str.split(' ', expand=True)[0]
#         # * split according to the space
#         #   e.g. [A]
#         #        [B, HEL]
#         #        [B]
#         #   expand = True then we will get a dataframe
#         #   the first column of the dataframe is grade 
        
#         df["Grade"] = df["Grade"].apply(letter_2_gp10_birla)
#         df["Percentage"] = df["Grade"]*10
        
#         df["letter"] = df["Percentage"].apply(score_2_letter)
#         gp = df["letter"].apply(letter_2_GP)
#         sum_gp = (gp*df["Credit"]).sum()
#         sum_credit = df["Credit"].sum()
        
#         GPA = sum_gp/sum_credit
        
#         return GPA   
    
        
#     def calculate_gpa_birla(self,df):
#         sum_credit=0
#         gpa = 0
#         z=0
#         print(df)
#         df['Grade'] = df['Grade'].str.split(' ', expand=True)[0]
#         print(df)
#         for i in range (len(self.df)):

#             sum_credit = sum_credit + int(self.df["Credit"][i])

#             try:
#                 gpindia=self.letter_2_gp_birla(self.df["Grade"][i])
#             except:
#                 print("The grade(letter_based) is outlier")
#                 continue
        
#             percentage = gpindia*10
    
#             letter = self.score_2_letter(percentage)
    
#             gp = self.letter_2_GP(letter)
#             z = gp * float(self.df["Credit"][i])
#             gpa = gpa + z
#         gpa=gpa/sum_credit
        
#         return gpa        
           
    
#     def letter_2_gp_Manipal_Institute(self,grades):
#         if(grades=="A+"):
#             number=10
#         elif(grades=="A"):
#             number=9
#         elif(grades=="B"):
#             number=8
#         elif(grades=="C"):
#             number=7
#         elif(grades=="D"):
#             number=6
#         elif(grades=="E"):
#             number=5
#         elif(grades=="AP"):
#             number=0
#         elif(grades=="I"):
#             number=0
#         elif(grades=="DT"):
#             number=0
#         elif(grades=="F"):
#             number=0
#         return number
    
    
#     def calculate_gpa_manipal(self,df):
#         sum_credit=0
#         gpa = 0
#         z=0
# #         print(df)
# #         df['Grade'] = df['Grade'].str.split(' ', expand=True)[0]
# #         print(df)
#         for i in range (len(self.df)):

#             sum_credit = sum_credit + int(self.df["Credit"][i])

# #             gpindia=self.letter_2_gp_birla(self.df["grade"][i])
#             try:
#                 gpindia=self.letter_2_gp_Manipal_Institute(self.df["Grade"][i])
#             except:
#                 print("The grade(letter_based) is outlier")
#                 continue
        
#             percentage = gpindia*10
    
#             letter = self.scores_2_letter(percentage)
    
#             gp = self.letter_2_GP(letter)
#             z = gp * float(self.df["Credit"][i])
#             gpa = gpa + z
#         gpa=gpa/sum_credit
        
#         return gpa
    
    
    
    def calculate_GPA(self):
        '''
        prepare list
        '''
#         score_base_calculate_GPA_list = ["Beijing Normal University Zhuhai",
#                                          "Beijing University of Posts and Telecommunications",
#                                          "Renmin University China",
#                                          "Jawaharlal Nehru Technological University"]
        
#         grade_base_calculate_GPA_list = ["Beijing Normal University Hong Kong Baptist University United International College"]
        
        
        client = pymongo.MongoClient()
        db = client['School_Template_db']
        collection = db["School Template"]
        collection_df = pd.DataFrame(collection.find({}))
        
        score_base_list = collection_df["Score Base"][0]
        grade_base_list = collection_df["Grade Base"][0]
        
        
        if self.school_name in score_base_list:
            GPA = self.score_base_calculate_GPA()
            return GPA
        
        if self.school_name in grade_base_list:
            GPA = self.grade_base_calculate_GPA()
            return GPA
        
        if (self.school_name not in score_base_list) and (self.school_name not in grade_base_list):
            column_list = self.df.columns
            if "Score" in column_list:
                GPA = self.score_base_calculate_GPA()
            elif "Grade" in column_list:
                GPA = self.grade_base_calculate_GPA()
            
            return GPA
            
            
            
#         if school == "Birla Institute Of Technology And Science":
#             GPA = self.birla_calculate_GPA(df)
        
        return None
        
    
    
#     def process_gpa(self,school, df):   
#         global gpa
#         score_base_single_combo_list = 
        
#         if school in score_base_single_combo_list:
#             gpa=self.score2letter2_4gp(df)
#         if school == "Beijing Normal University Hong Kong Baptist University United International College":
#             gpa=self.letter2_4gp(df)
#         if school == "Birla Institute Of Technology And Science":
#             gpa=self.calculate_gpa_birla(df)
#         if school == "Manipal Institute of Technology":
#             gpa=self.calculate_gpa_manipal(df)
        
#         return gpa