import pymongo
from bson.objectid import ObjectId

import pandas as pd
import numpy as np
import json


class School():
    def __init__(self, school, json_data):
        self.school = school
        self.json_data = json_data

    def china_single_set_base(self, json_data):

        # prepare the query column name
        course = ["course title", "course titles", "course", "courses",
                  "module title", "subject name",
                  "subject", "subject title", "subjects",
                  "course name", "heads of passing"]

        score = ["score", "mark", "scores", "marks obtained",
                 "obt", "marks obtained", "record", "scroe"]

        credit = ["credit", "unit attempted", "credits",
                  "units", "cr", "course credits"]

        grade_point = ["grade point", "gradepoint", "spi", "grade",
                       "grade points", "gpa", "aggregate marks/cgpa", "grade pt(G)", "grade point (g)"]

        # deal with json data schema --> field
        json_data_fields = json_data['columns']
        #     json_data_fields = json_data[0][0]

        column_name = []

        for i_json_data_fields in json_data_fields:
            column_name.append(i_json_data_fields["id"])
        #         column_name.append(i_json_data_fields[0])

        query_grade_point = ""
        #     query_course = ""
        query_score = ""
        #     query_credit = ""
        #     query_grade_point = ""

        

        column_name.pop()
        for i_column_name in column_name:
            # standardize format
            column = i_column_name.lower()

            if column in course:
                query_course = i_column_name
            elif column in score:
                query_score = i_column_name
            elif column in credit:
                query_credit = i_column_name
            elif column in grade_point:
                query_grade_point = i_column_name

        # extract info from json data data

        json_data_data = json_data["data"]
        #     json_data_data = json_data[1]

        insert_data = []

        for i_json_data in json_data["data"]:

            insert_one = {}

            insert_one["course"] = i_json_data[query_course]

            if query_score:
                insert_one["score"] = i_json_data[query_score]
            else:
                insert_one["score"] = None

            insert_one["credit"] = i_json_data[query_credit]

            if query_grade_point:
                insert_one["grade_point"] = i_json_data[query_grade_point]
            else:
                insert_one["grade_point"] = None

            insert_data.append(insert_one)

        return insert_data

    def preprocess_Birla_IT(self):

        json_data["schema"]["fields"].pop(2)

        for i in json_data["data"]:
            del i["COURSE"]

        return json_data

    def india_single_set_base(self, json_data):

        # prepare the query column name
        course = ["course title", "course titles", "course", "courses",
                  "module title", "subject name",
                  "subject", "subject title", "subjects",
                  "course name", "heads of passing"]

        score = ["grade", "grade obtained"]

        credit = ["credit", "unit attempted", "credits",
                  "units", "cr", "course credits", "credit(s)"]

        grade_point = ["grade point", "gradepoint", "spi",
                       "grade points", "gpa", "aggregate marks/cgpa", "grade pt(G)", "grade point (g)"]

        # deal with json data schema --> field
        json_data_fields = json_data["columns"]

        column_name = []

        query_grade_point = ""

        for i_json_data_fields in json_data_fields:
            column_name.append(i_json_data_fields["id"])

        column_name.pop()
        for i_column_name in column_name:
            # standardize format
            column = i_column_name.lower()

            if column in course:
                query_course = (i_column_name)
            elif column in score:
                query_score = (i_column_name)
            elif column in credit:
                query_credit = (i_column_name)
            elif column in grade_point:
                query_grade_point = (i_column_name)

        # extract info from json data data

        json_data_data = json_data["data"]

        insert_data = []

        for i_json_data in json_data["data"]:

            insert_one = {}

            insert_one["course"] = i_json_data[query_course]
            insert_one["score"] = i_json_data[query_score]
            insert_one["credit"] = i_json_data[query_credit]

            if query_grade_point:
                insert_one["grade_point"] = i_json_data[query_grade_point]
            else:
                insert_one["grade_point"] = None

            insert_data.append(insert_one)

        return insert_data

    def process_template(self, school, json_data):
        global processed_data
        if school == "bnu" or school == "bupt":
            processed_data = self.china_single_set_base(json_data)
        if school == "bnud":
            processed_data = self.india_single_set_base(json_data)

        df = pd.DataFrame(processed_data)
        #         b=(df.score=="")
        #         df[b].index
        #         precalculate_data=df.drop(df[b].index)
        #         precalculate_data.reset_index(drop=True, inplace=True)

        if "score" in df.columns:
            df["score"] = pd.to_numeric(df['score'], errors="coerce")
            df = df.dropna()

        return df


class Gpa():
    def __init__(self, school, df):
        self.df = df
        self.school = school

    

    def letter_2_gp_birla(self, grade):
        number = 4
        if (grade == "A"):
            number = 10
        elif (grade == "A-"):
            number = 9
        elif (grade == "B"):
            number = 8
        elif (grade == "B-"):
            number = 7
        elif (grade == "C"):
            number = 6
        elif (grade == "C-"):
            number = 5
        elif (grade == "D"):
            number = 4
        #     elif(grades=="D+"):
        #         number=3
        elif (grade == "E"):
            number = 2
        elif (grade == "F"):
            number = 0
        return number

    # def letter_2_gp_Manipal_Institute(letter):
    #     if (grades == "A+"):
    #         number = 10
    #     elif (grades == "A"):
    #         number = 9
    #     elif (grades == "B"):
    #         number = 8
    #     elif (grades == "C"):
    #         number = 7
    #     elif (grades == "D"):
    #         number = 6
    #     elif (grades == "E"):
    #         number = 5
    #     elif (grades == "AP"):
    #         number = 0
    #     elif (grades == "I"):
    #         number = 0
    #     elif (grades == "DT"):
    #         number = 0
    #     elif (grades == "F"):
    #         number = 0
    #     return number

    def letter_2_GP(self, letter):
        '''
        define a function to map letter to GP
        '''

        # define a dictionary to map letter grade to GP
        letter_grade_map_GP = {

            "A+": 4.0, "a+": 4.0,
            "A": 4.0, "a": 4.0,
            "A-": 3.7, "a-": 3.7,
            "B+": 3.3, "b+": 3.3,
            "B": 3.0, "b": 3.0,
            "B-": 2.7, "b-": 2.7,
            "C+": 2.3, "c+": 2.3,
            "C": 2.0, "c": 2.0,
            "C-": 1.7, "c-": 1.7,
            "D+": 1.3, "d+": 1.3,
            "D": 1.0, "d": 1.0,
            "F": 0.0, "f": 0.0

        }

        GP = letter_grade_map_GP[letter]

        return GP

    def scores_2_letter(self, grade):
        '''
            define a function to map percentage grade to letter grade
        '''

        # use two sides restriction to exclude the outlier
        if (grade >= 93) and (grade <= 100):
            letter = "A"
        elif (grade >= 90) and (grade < 93):
            letter = "A-"
        elif (grade >= 87) and (grade < 90):
            letter = "B+"
        elif (grade >= 83) and (grade < 87):
            letter = "B"
        elif (grade >= 80) and (grade < 83):
            letter = "B-"
        elif (grade >= 77) and (grade < 80):
            letter = "C+"
        elif (grade >= 73) and (grade < 77):
            letter = "C"
        elif (grade >= 70) and (grade < 73):
            letter = "C-"
        elif (grade >= 67) and (grade < 70):
            letter = "D+"
        elif (grade >= 65) and (grade < 67):
            letter = "D"
        elif (grade < 65) and (grade > 0):
            letter = "F"

        else:
            letter = "outlier"

        return letter

    def letter2_4gp(self, df):
        gpa = 0
        sum_credit = 0
        #         for course, sc in student_grade.items():
        for i in range(len(df)):
            #         s=list(sc.values())[0]
            score = df.loc[i, "score"]
            credit = float(df["credit"].loc[i])
            #             letter = self.scores_2_letter(score)
            gp = self.letter_2_GP(score)

            sum_credit = sum_credit + credit
            z = gp * credit

            gpa = gpa + z

        gpa = gpa / sum_credit

        return gpa

    def score2letter2_4gp(self, df):

        gpa = 0
        sum_credit = 0
        #         for course, sc in student_grade.items():
        for i in range(len(df)):
            #         s=list(sc.values())[0]
            score = float(df.loc[i, "score"])
            credit = float(df["credit"].loc[i])
            letter = self.scores_2_letter(score)
            gp = self.letter_2_GP(letter)

            sum_credit = sum_credit + credit
            z = gp * credit

            gpa = gpa + z

        gpa = gpa / sum_credit

        return gpa

    def calculate_gpa_birla(self):
        sum_credit = 0
        gpa = 0
        z = 0

        for i in range(len(self.df)):
            sum_credit = sum_credit + int(self.df["credit"][i])

            #             gpindia=self.letter_2_gp_birla(self.df["grade"][i])
            gpindia = self.letter_2_gp_birla(self.df["grade"][i])

            percentage = gpindia * 10

            letter = self.scores_2_letter(percentage)

            gp = self.letter_2_GP(letter)
            z = gp * float(self.df["credit"][i])
            gpa = gpa + z
        gpa = gpa / sum_credit

        return gpa


    def process_gpa(self, school, df):
        global gpa1
        if school == "bnu" or school == "bupt":
            gpa1 = self.score2letter2_4gp(df)
        if school == "bnud":
            gpa1 = self.letter2_4gp(df)
        
        return gpa1


def get_data(sid):
    client = pymongo.MongoClient()
    db = client.test
    collection = db.student
    ret = collection.find_one({'_id': ObjectId(sid)})

    # get school info
    school_name = ret['education']['university']

    # get page info
    page_list = []
    for page_i in range(len(ret['transcript']['processed_data'])):
        page_each = ret['transcript']['processed_data'][page_i]["table_data"]
        page_each = json.loads(page_each)

        page_list.append(page_each)

    return school_name, page_list


def run_class(sid):
    school_name, page_list = get_data(sid)

    df_list = []
    for page_i in range(len(page_list)):
        each_page = page_list[page_i]

        # initialize object
        school = School(school_name, each_page)

        each_df = school.process_template(school_name, each_page)
        df_list.append(each_df)

        df = pd.concat(df_list)

        columns = []

        for column_i in df.columns.values:
            column_name = {}
            column_name["id"] = column_i
            column_name["label"] = column_i
            
            columns.append(column_name)

        data = []

        for i in range(len(df)):
            row = {}
            each_row = df.iloc[i:i+1, :]
            #each_row[columns[i]['id']] = each_row[columns[i]["id"]]
            for j in range(len(columns)):
                row[columns[j]["id"]] = each_row[columns[j]["id"]].values[0]
                
            data.append(row)

        big_dict = {}
        big_dict["columns"] = columns
        big_dict["data"] = data


    return df, big_dict


def run_gpa(school, df):
    df.reset_index(drop = True, inplace = True)
    gpa = Gpa(school, df)
    res = gpa.process_gpa(school, df)

    return res