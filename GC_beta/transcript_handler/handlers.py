from .models import GenericTranscriptHandler, ProcessedTable
import time
from ExtractTable import ExtractTable
import fitz
from PIL import Image, ImageDraw
import os
from GC_beta.settings import BASE_DIR
import json
import pandas as pd
import re
import numpy as np
from pathlib import Path
from urllib.parse import urljoin
from django.core.files.storage import default_storage




class ExtractTableHandler(GenericTranscriptHandler):
    # ond one (100): 0ksligySJFljKuMybVRN6rSLw1KBUh7a5CPHWT2p
    # new key (3000): 3PgbVbC26tCCT9rb34bY9ozTAfYNWYku7HEwAVE5
    def __init__(self):
        super().__init__()
        self.et_sess = ExtractTable('3PgbVbC26tCCT9rb34bY9ozTAfYNWYku7HEwAVE5')
        self.plan = "EXTRA"  # hard-coded

    def prepare_transcript(self, student, force_new=False):
        paths = self._compose_paths(student)
        print('checking data...')
        data_exist = os.path.exists(os.path.join(paths['output_dir'], 'server_response.json'))
        print(os.path.join(paths['output_dir'], 'server_response.json'), data_exist)
        if force_new or not data_exist:
            print('Sending pdf to ExtracTable...')
            table_data = self.et_sess.process_file(filepath=paths['input_file_path'], pages="all",
                                                   output_format="df")
            server_response = self.et_sess.ServerResponse.json()
            self._dump_response(paths['output_dir'], table_data)
        else:
            print('Data found. Reading from dumped files instead...')
            table_data, server_response = self._read_response(student)
        tables_in_json = self._dump_response_to_json(table_data)
        print('preparing images and tables...')
        image_file_paths, table_page_mappings = self._get_table_border_images(paths['input_file_path'],
                                                                              paths['output_dir'], server_response,
                                                                              table_data, student)
        new_processed_tables = self._dump_processed_transcripts_to_ProcessedTable(tables_in_json, image_file_paths,
                                                                                  table_page_mappings)
        student.status = "PREPARED"
        student.transcript.processed_data = new_processed_tables
        student.save()
        return True

    def get_extractTable_data(self, student, force_new=False):
        paths = self._compose_paths(student)
        os_path = default_storage.location
        table_data = student.transcript.processed_data
        json_tables = []
        for i in range(len(table_data)):
            abs_path = os_path.split('\\media')[0]
            db_img_path = os.path.normpath(table_data[i].image_path)
            extracted_output = self.et_sess.process_file(filepath=f'{abs_path}{db_img_path}', output_format="df")
            image_name = table_data[i].image_path.split('/')[-1].split('.')[0]
            self.save_response_CSV_JSON(paths['output_dir'], extracted_output, image_name)
            json_table = self.get_json_data(extracted_output)
            json_tables.append(json_table)

        self.save_response_db(json_tables, student, len(table_data))
        return True

    def get_json_data(self, tables):
        tables_number = len(tables)
        #tables_in_json = []
        for i in range(tables_number):
            table = tables[i]   
            try:
                table.columns = table.iloc[0]
            except:
                pass
            table = table.iloc[1:, :].fillna('')
            json_string = table.to_json(orient="table")
            #tables_in_json.append(json_string)
        return json_string

    def save_response_db(self, json_tables, student, tables_number):
        for i in range(tables_number):
            student.transcript.processed_data[i].table_data = json_tables[i]
            
        student.status = "PREPARED"
        student.save()
        return True


    def save_response_CSV_JSON(self, output_dir, table_data, image_name):
        try:
            if not os.path.exists(output_dir):
                os.mkdir(output_dir)
            tables_number = len(self.et_sess.ServerResponse.json()['Tables'])
            for i in range(tables_number):
                table_data[i].to_csv(os.path.join(output_dir, f'table-{image_name}.csv'), index=False)
                data_folder = Path(output_dir)
                file_to_open = data_folder / "server_response.json"
                f = open(file_to_open, 'w', encoding='utf-8')
                json.dump(self.et_sess.ServerResponse.json(), f, ensure_ascii=False, indent=4)
            
            return True
        except: 
            return False

    def calculate_gpa(self, student):
        student_university = student.education.university
        print(f"student {student.name}'s university is {student_university}")
        gpa = 0
        if student_university == "Beijing Normal University":
            def process_tables(tables_to_use):
                processed_tables = []
                tables_to_concat = []
                for table_to_use in tables_to_use:
                    # remove last column
                    temp_df = table_to_use.iloc[:, :-1]
                    # drop rows that contains any null
                    df = temp_df.dropna()
                    df.reset_index()
                    processed_tables.append(df)
                for processed_table in processed_tables:
                    # modify column names
                    try:
                        processed_table.columns = processed_table.iloc[0]
                        processed_table_2 = processed_table.drop(processed_table.index[0])
                        tables_to_concat.append(processed_table_2)
                    except:
                        pass
                final_table = pd.concat(tables_to_concat)
                print("shape of final table = {}".format(str(final_table.shape)))

                print("column names of processed final table = {}".format(str(list(final_table.columns))))

                return final_table

            def calculate_gpa(final_table):
                # var student is for testing
                gpa = final_table['Grade Point'].astype(float).sum() / final_table['Unit Gained'].astype(float).sum()
                return gpa

            tables, server_response = self._read_response(student)
            sanitized_table = process_tables(tables)
            gpa = calculate_gpa(sanitized_table)
            student.gpa = gpa
            student.status = "COMPLETE"
            student.save()
            print(f'GPA of student {student.name} is {gpa}.')
            return round(gpa, 2)

        elif student_university == "Pune University":
            def sanitize_tables(tables, server_response):
                """
                . drop first 3 columns, split the last one and populate the valus into the last two
                . map grade letter to number
                """
                for idx, t in reversed(list(enumerate(tables))):  # drop low conf rows and unify columns
                    t.columns = t.iloc[0]
                    t.drop([0], inplace=True)
                    t.reset_index(drop=True, inplace=True)
                    # TODO: can do nothing about this
                    try:
                        new_df = t[['MAX', 'MIN', 'OBT']]
                    except:
                        tables.pop(idx)
                        continue
                    tables[idx] = new_df

                for t_idx, t in enumerate(tables):
                    for idx, row in t.iterrows():
                        #             if isinstance(row['OBT'], str):
                        #             print(row['MAX'], type(row['MAX']))
                        if row.isnull().values.any() or (isinstance(row['OBT'], str) and not row['OBT'].isnumeric()):
                            t.drop(idx, inplace=True)
                            continue
                        if not row['MAX'].isnumeric():
                            #                 print(t_idx, row['MAX'])
                            row['MAX'] = int(row['MAX'].split()[1])
                    t.reset_index(drop=True, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                def range_map(value, leftMin, leftMax, rightMin, rightMax):
                    # Figure out how 'wide' each range is
                    leftSpan = leftMax - leftMin
                    rightSpan = rightMax - rightMin

                    # Convert the left range into a 0-1 range (float)
                    valueScaled = float(value - leftMin) / float(leftSpan)

                    # Convert the 0-1 range into a value in the right range.
                    result = rightMin + (valueScaled * rightSpan)
                    return result if result >= rightMin else 0

                cumulative_GP = 0
                course_count = 0
                for i in range(df.shape[0]):
                    course_count += 1
                    course_MAX, course_MIN, course_Grade = float(df.loc[i, 'MAX']), float(df.loc[i, 'MIN']), float(
                        df.loc[i, 'OBT'])
                    converted_grade = range_map(course_Grade, course_MIN, course_MAX, 65, 100)
                    cumulative_GP += converted_grade
                result = cumulative_GP / course_count
                return result / 100 * 4

        elif student_university == "Kings University":
            def sanitize_tables(tables):
                """
                0. drop first row in place, wtf
                1. Unify column names
                2. Drop the row if it contains NaN or the CR. column is not a number.
                """
                for t in tables:
                    t.columns = t.iloc[0]
                    t.drop([0]).reset_index(drop=True)
                c_names = tables[0].columns
                for t_idx, t in enumerate(tables):
                    t.columns = c_names
                    for idx in range(t.index[-1] + 1):
                        CR_cell, row = t['CR.'].loc[idx], t.loc[idx]
                        if row.isnull().values.any() or isinstance(CR_cell, str) and not CR_cell.isnumeric():
                            # print(f'Table {t_idx} dropped row at line {idx}')
                            t.drop(idx, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                cur_GP = 0
                cur_CR = 0
                for i in range(df.shape[0]):
                    cur_CR += float(df.loc[i, 'CR.'])
                    cur_GP += float(df.loc[i, 'GP'])
                return cur_GP / cur_CR

        elif student_university == "Rajasthan Technical University":
            def sanitize_tables(tables):
                """
                0. Unify column names
                1. Drop the tables with wrong column names(for example, no cloumn called "Subject Name")
                2. Drop the row if it contains NaN or the 'Marks Obtained' column is not a number.
                """
                for t in tables:
                    t.columns = t.iloc[0]
                    t.drop([0]).reset_index(drop=True)
                tables_to_drop = []
                c_names = tables[0].columns
                for t_idx, t in enumerate(tables):
                    if t.columns[0] != 'Subject Name':
                        print(f'Table {t_idx} dropped')
                        tables_to_drop.append(t_idx)
                        continue
                    t.columns = c_names
                    for idx in range(t.index[-1] + 1):
                        CR_cell, row = t.loc[idx, 'Marks Obtained'], t.loc[idx]
                        if row.isnull().values.any() or isinstance(CR_cell, str) and not CR_cell.isnumeric():
                            #                 print(t.loc[idx].isnull().values.any(), not isinstance(t.loc[idx,'CR.'], float),isinstance(t.loc[idx,'CR.'], str) and not t.loc[idx,'CR.'].isnumeric(), )
                            print(f'Table {t_idx} dropped row at line {idx}')
                            t.drop(idx, inplace=True)
                for t_idx in tables_to_drop[::-1]:
                    tables.pop(t_idx)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                mappings = {}  # knowledge base
                result = 0
                cur_GP = 0
                cur_CR = 0
                for i in range(df.shape[0]):
                    # map them at here
                    cur_CR += float(df.loc[i, 'Max Marks'])
                    cur_GP += float(df.loc[i, 'Marks Obtained'])
                result = cur_GP / (cur_CR)
                return result * 4

        elif student_university == "Beijing University of Posts and Telecommunications":
            def sanitize_tables(tables, server_response):
                """
                . drop tables with wrong names
                . drop rows with low conf
                . Unify column names
                . Drop the tables with wrong column names(for example, no cloumn called "Subject Name")
                . Drop the row if it contains NaN or the 'Marks Obtained' column is not a number.
                """
                for idx, t in reversed(list(enumerate(tables))):  # drop low conf rows and unify columns
                    t.columns = t.iloc[0]
                    if t.shape[0] <= 5:
                        tables.pop(idx)
                        continue
                    row_indice_to_drop = [0] + ExtractTableHandler._table_confidence_check(97, idx, server_response,
                                                                                           "ROW")
                    rows = t.index[[row_indice_to_drop]]
                    t.drop(rows, inplace=True)
                    t.reset_index(drop=True, inplace=True)
                #     print(t)
                c_names = tables[0].columns
                for t_idx, t in enumerate(tables):
                    t.columns = c_names
                    for idx in range(t.index[-1] + 1):
                        #             CR_cell, row = t.loc[idx, 'Marks Obtained'], t.loc[idx]
                        row = t.loc[idx]
                        if row.isnull().values.any():
                            #                 print(t.loc[idx].isnull().values.any(), not isinstance(t.loc[idx,'CR.'], float),isinstance(t.loc[idx,'CR.'], str) and not t.loc[idx,'CR.'].isnumeric(), )
                            print(f'Table {t_idx} dropped row at line {idx}')
                            t.drop(idx, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                result = 0
                cumulative_GP = 0
                cumulative_CR = 0
                for i in range(df.shape[0]):
                    course_Credit, course_Grade = float(df.loc[i, 'Credit']), float(df.loc[i, 'Mark']) / 100
                    cumulative_CR += course_Credit
                    cumulative_GP += course_Grade * course_Credit
                #         print(course_Credit, course_Grade, cumulative_GP, cumulative_CR)
                result = cumulative_GP / cumulative_CR
                return result * 4

        elif student_university == "Beijing University of Technology":
            def sanitize_tables(tables, server_response):
                """
                . drop tables with wrong names
                . drop rows with low conf
                . Unify column names
                . Drop the tables with wrong column names(for example, no cloumn called "Subject Name")
                . Drop the row if it contains NaN or the 'Marks Obtained' column is not a number.
                """
                for idx, t in reversed(list(enumerate(tables))):  # drop low conf rows and unify columns
                    if t.shape[0] <= 7:
                        tables.pop(idx)
                        continue
                    t.columns = ['Semester', 'Title', 'Credits', 'Grade']
                    row_indice_to_drop = [0] + ExtractTableHandler._table_confidence_check(70, idx, server_response,
                                                                                           "ROW")
                    rows = t.index[[row_indice_to_drop]]
                    t.drop(rows, inplace=True)
                    t.reset_index(drop=True, inplace=True)
                #     print(t)
                grade_mapping = {"A+": 4.2, "A": 4, "A-": 3.8, "B+": 3.6, "B": 3.4, "B-": 3.2, "C+": 3.0, "C": 2.8,
                                 "C-": 2.6, "D+": 2.4, "D": 2.2, "D-": 2.0, "P": 2.0, "E": 1.6, "F": 1.0, "FM": 1.0,
                                 "G": 0.4}
                for t_idx, t in enumerate(tables):
                    for idx in range(t.index[-1] + 1):
                        CR_cell, row = t.loc[idx, 'Grade'], t.loc[idx]
                        row = t.loc[idx]
                        re_match = re.search(r'[ABCDEGP(FM)(NG)][+-]?', str(CR_cell))
                        if re_match:
                            true_grade = re_match[0]
                            t.at[idx, 'Grade'] = grade_mapping[true_grade]
                        else:
                            print(f'Table {t_idx} dropped row at line {idx}. {CR_cell}')
                            t.drop(idx, inplace=True)
                    t.reset_index(drop=True, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                result = 0
                cumulative_GP = 0
                cumulative_CR = 0
                for i in range(df.shape[0]):
                    course_Credit, course_Grade = float(df.loc[i, 'Credits']), float(df.loc[i, 'Grade'])
                    cumulative_CR += course_Credit
                    cumulative_GP += course_Grade * course_Credit
                result = cumulative_GP / cumulative_CR
                return result * (4 / 4.2)

        elif student_university == "Birla Institute Of Technology And Science":
            def sanitize_tables(tables, server_response):
                """
                . drop first 3 columns, split the last one and populate the valus into the last two
                . map grade letter to number
                """
                for idx, t in reversed(list(enumerate(tables))):  # drop low conf rows and unify columns
                    if np.issubdtype(t['4'].dtype, np.number):
                        new_df = t[['4', '5']]
                    else:
                        new_df = t[['3', '4']]
                    new_df.columns = ['Credits', 'Grade']
                    tables[idx] = new_df
                grade_mapping = {"A": 10, "A-": 9, "B": 8, "B-": 7, "C": 6, "C-": 5,
                                 "D": 4, "E": 2}
                for t_idx, t in enumerate(tables):
                    if np.issubdtype(t['Credits'].dtype, np.number):
                        for idx in range(t.index[-1] + 1):
                            if t.loc[idx, 'Grade'] in grade_mapping:
                                t.at[idx, 'Grade'] = grade_mapping[t.loc[idx, 'Grade']]
                            else:
                                t.drop(idx, inplace=True)
                    else:
                        for idx in range(t.index[-1] + 1):
                            fake_credit_cell, gonna_split_cell = t.loc[idx, 'Credits'], t.loc[idx, 'Grade']
                            if pd.isna(fake_credit_cell):
                                t.drop(idx, inplace=True)
                                continue
                            credits, grade = gonna_split_cell.split()[0], gonna_split_cell.split()[1]
                            re_match = re.search(r'[ABCDE][-]?', grade)
                            if re_match:
                                true_grade = re_match[0]
                                t.at[idx, 'Credits'] = credits
                                t.at[idx, 'Grade'] = grade_mapping[true_grade]
                            else:
                                t.drop(idx, inplace=True)
                        t.reset_index(drop=True, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                """
                map them again: 70-100 	A 50-69 	B 35*-49 	C 0-32 	F
                """
                result = 0
                cumulative_GP = 0
                cumulative_CR = 0
                for i in range(df.shape[0]):
                    course_Credit, course_Grade = float(df.loc[i, 'Credits']), float(df.loc[i, 'Grade'])
                    #         if not course_Grade.is
                    converted_Grade = 0
                    if 7 <= course_Grade <= 10:
                        converted_Grade = 4
                    elif 5 <= course_Grade < 7:
                        converted_Grade = 3
                    elif 3.5 <= course_Grade < 5:
                        converted_Grade = 2
                    else:
                        converted_Grade = 1
                    cumulative_CR += course_Credit
                    cumulative_GP += converted_Grade * course_Credit
                #         print(course_Credit, course_Grade, cumulative_GP, cumulative_CR)
                result = cumulative_GP / cumulative_CR
                return result
        elif student_university == "SRM Institute of Technology":
            def sanitize_tables(tables, server_response):
                """
                . drop first 3 columns, split the last one and populate the valus into the last two
                . map grade letter to number
                """
                for idx, t in reversed(list(enumerate(tables))):  # drop low conf rows and unify columns
                    t.columns = t.iloc[1]
                    t.drop([0, 1], inplace=True)
                    t.reset_index(drop=True, inplace=True)
                    print(t.columns.values.tolist())
                    try:
                        new_df = t[['Credits', 'Grade']]
                    except:
                        tables.pop(idx)
                        continue
                    tables[idx] = new_df

                for t_idx, t in enumerate(tables):
                    grade_mapping = {"S": 4, "A+": 4, "A": 4, "A-": 3.8, "B+": 3.6, "B": 3.4, "B-": 3.2, "C+": 3.0,
                                     "C": 2.8,
                                     "C-": 2.6, "D+": 2.4, "D": 2.2, "D-": 2.0, "P": 2.0, "E": 1.6, "F": 1.0, "FM": 1.0,
                                     "G": 0.4}
                    for idx, row in t.iterrows():
                        if row.isnull().values.any():
                            t.drop(idx, inplace=True)
                            continue
                        try:
                            t.loc[idx, 'Grade'] = grade_mapping[row['Grade']]
                        #                 row['Grade'] = grade_mapping[row['Grade']]
                        #                 print(row['Grade'])
                        except:
                            t.drop(idx, inplace=True)
                    t.reset_index(drop=True, inplace=True)
                return tables

            def merge_tables(df):
                concat_tt = pd.concat(df, ignore_index=True)
                return concat_tt

            def calculate_gpa(df):
                result = 0
                cumulative_GP = 0
                cumulative_CR = 0
                for i in range(df.shape[0]):
                    course_Credit, course_Grade = float(df.loc[i, 'Credits']), float(df.loc[i, 'Grade'])
                    cumulative_CR += course_Credit
                    cumulative_GP += course_Grade * course_Credit
                #         print(course_Credit, course_Grade, cumulative_GP, cumulative_CR)
                result = cumulative_GP / cumulative_CR
                return result
        else:
            def sanitize_tables(tables, server_response):
                pass

            def merge_tables(sanitized_tables):
                pass

            def calculate_gpa(merged_table):
                pass

            print("university not found")
            return 0
        tables, server_response = self._read_response(student)
        sanitized_tables = sanitize_tables(tables, server_response)
        merged_table = merge_tables(sanitized_tables)
        print(merged_table.shape)
        gpa = calculate_gpa(merged_table)

        student.gpa = gpa
        student.status = "COMPLETE"
        student.save()
        print(f'GPA of student {student.name} is {gpa}.')
        return round(gpa, 2)

    def _dump_processed_transcripts_to_ProcessedTable(self, tables_in_json, image_file_paths, table_page_mappings):
        new_processed_tables = []
        tables_number = len(tables_in_json)
        for i in range(tables_number):
            new_processed_table = ProcessedTable(page=table_page_mappings[i], table_num=i, table_data=tables_in_json[i],
                                                 image_path=image_file_paths[i])
            new_processed_tables.append(new_processed_table)
        return new_processed_tables

    def get_usage(self):
        usage = self.et_sess.check_usage()
        return usage

    def _compose_paths(self, student):
        paths = {}
        paths['input_file_path'] = os.path.join(BASE_DIR, "media", student.name,
                                                f'{student.name}-raw-transcripts.pdf')
        paths['output_dir'] = os.path.join(BASE_DIR, "media", student.name)
        return paths

    def _dump_response_to_json(self, tables):
        tables_number = len(tables)
        tables_in_json = []
        for i in range(tables_number):
            table = tables[i]
            try:
                table.columns = table.iloc[0]
            except:
                pass
            table = table.iloc[1:, :].fillna('')
            json_string = table.to_json(orient="table")
            tables_in_json.append(json_string)
        return tables_in_json

    def _dump_response(self, outdir, tables):
        """
        dump table data(df as .csv) and raw server response(.json)
        also, dump dfs into json and serialize the json to strings, then save to the database for future use
        """
        try:
            if not os.path.exists(outdir):
                os.mkdir(outdir)
            tables_number = len(self.et_sess.ServerResponse.json()['Tables'])
            for i in range(tables_number):
                tables[i].to_csv(os.path.join(outdir, f'table-{i}.csv'), index=False)
                data_folder = Path(outdir)
                file_to_open = data_folder / "server_response.json"
                f = open(file_to_open, 'w', encoding='utf-8')
                json.dump(self.et_sess.ServerResponse.json(), f, ensure_ascii=False, indent=4)
            # return tables_in_json
            return True
        except:
            return False

    def _read_response(self, student):
        paths = self._compose_paths(student)
        tables = []  # dfs
        server_response = None  # json
        outdir = paths['output_dir']
        print('reading server response...')
        with open(os.path.join(outdir, 'server_response.json')) as json_file:
            server_response = json.load(json_file)
        table_data_files = [f'table-{x}.csv' for x in range(len(server_response['Tables']))]
        for f in table_data_files:
            try:
                t = pd.read_csv(os.path.join(outdir, f))
            except:
                continue
            tables.append(t)
            print('reading', f)
        return tables, server_response

    def _get_cell_confidence(self, i, r, c, server_response):
        """
        i: index of the table
        """
        return server_response['Tables'][i]['TableConfidence'][str(r)][str(c)]

    def _table_confidence_check(self, threshold, i, server_response, mode="ROW"):
        """
        CELL: return a list of coor that has confidence below the threshold
        ROW: return indice of rows that has confidence below the threshold
        """
        result = []  # defective cells
        rate = 0
        confidences = server_response['Tables'][i]['TableConfidence']
        if mode == "CELL":
            valid_cells_count = 0  # non-zero confidence
            for r in confidences:
                for c in confidences[r]:
                    cell_conf = self._get_cell_confidence(i, int(r), int(c), server_response)
                    if cell_conf > 0:
                        valid_cells_count += 1
                        if cell_conf < threshold:
                            result.append((int(r), int(c)))
            acceptance = 1 - len(result) / valid_cells_count
        elif mode == "ROW":
            for r in confidences:
                row_conf, valid_cells_count = 100, 0
                for c in confidences[r]:
                    cell_conf = self._get_cell_confidence(i, int(r), int(c), server_response)
                    if cell_conf > 0:
                        valid_cells_count += 1
                        row_conf = min(cell_conf, row_conf)
                # row_conf = round(row_conf / valid_cells_count, 2)
                # print(r, row_conf)
                if row_conf < threshold:
                    result.append(int(r))
        return result

        # return sorted(result), acceptance

    def _get_table_coor(self, i, server_response, dfs):
        """
        "{row#: {col#: <list(x1,y1,x2,y2)>}}"
        """
        table_coors = server_response['Tables'][i]['TableCoordinates']
        rows, columns = dfs[i].shape
        print(f'table {i} shape:', rows, columns)
        try:
            if table_coors['0']['0']:  # how the fuck could the first cell be empty???
                x1, y1 = table_coors['0']['0'][:2]
                x2, y2 = table_coors['0']['0'][2:]
            else:
                x1, y1, x2, y2 = 0, 0, 0, 0
        except:
            return [0, 0, 0, 0]
        if x1 + y1 == 0:
            for c in range(columns - 1):
                if table_coors['0'][str(c)]:
                    y1 = table_coors['0'][str(c)][1]
                    break
            for r in range(rows - 1):
                if table_coors[str(r)]['0']:
                    x1 = table_coors[str(r)]['0'][0]
                    break
        for c in range(columns - 1):
            if table_coors[str(rows - 1)][str(c)]:
                y2 = table_coors[str(rows - 1)][str(c)][3]
                break
        for r in range(rows - 1):
            if table_coors[str(r)][str(columns - 1)]:
                x2 = table_coors[str(r)][str(columns - 1)][2]
                break
        return [x1, y1, x2, y2]

    def _extract_image_from_pdf_and_dump(self, input_pdf_path, output_path):
        print(input_pdf_path)
        print(output_path)
        doc = fitz.open(input_pdf_path)
        print(doc)
        for i, page in enumerate(doc):
            # page.setRotation(page.rotation)
            pix = page.get_pixmap()
            pix.save(output_path + "\\p%s.png" % (i))

    # for i in range(len(doc)):
    #     for img in doc.get_page_images(i):
    #         xref = img[0]
    #         pix = fitz.Pixmap(doc, xref)
    #         if pix.n < 5:  # this is GRAY or RGB
    #             pix.save(output_path + "\\p%s.png" % (i))
    #         else:  # CMYK: convert to RGB first
    #             pix1 = fitz.Pixmap(fitz.csRGB, pix)
    #             pix1.save(output_path + "\\p%s.png" % (i))
    #             pix1 = None
    #         pix = None

    def _draw_rectangle_on_image_and_dump(self, base_dir, page_idx, table_idx, coors, student):
        input_image_path = os.path.join(base_dir, f"p{page_idx}.png")
        output_image_path = os.path.join(base_dir, f"p{page_idx}-t{table_idx}.png")
        #localhost_image_path = os.path.join("http:\\\\localhost:8080", student_name, f"p{page_idx}-t{table_idx}.png")
        file_path = Path(student.name, f"p{page_idx}-t{table_idx}.png")
        url = urljoin('http://localhost:8000/media/',str(file_path))
        localhost_image_path = url
        image = Image.open(input_image_path)
        width, height = image.size
        draw = ImageDraw.Draw(image)
        draw.rectangle((coors[0] * width, coors[1] * height, coors[2] * width, coors[3] * height), outline=128, width=5)
        #     image.show()
        print(f'compressing p{page_idx}-t{table_idx}.png ...')
        #image = image.resize((int(width * 0.7), int(height * 0.7)), Image.ANTIALIAS)
        image.save(output_image_path, quality=100, subsampling=0)
        return localhost_image_path

    def _get_table_border_images(self, input_pdf_path, output_path, server_response, dfs, student):
        """
        0. read pdf and extract iamges
        1. generate base image (on pages)
        2. draw rectangles (on tables)
        3. save
        input_pdf_path: input pdf path
        """
        self._extract_image_from_pdf_and_dump(input_pdf_path, output_path)
        image_file_paths = []  # localhost path
        table_page_mappings = []  # table i in page x
        for i, table in enumerate(server_response['Tables']):
            print(f'preparing table {i}')
            coors = self._get_table_coor(i, server_response, dfs)
            localhost_image_path = self._draw_rectangle_on_image_and_dump(output_path, table["Page"] - 1, i, coors, student)
            table_page_mappings.append(table["Page"] - 1)
            image_file_paths.append(localhost_image_path)
        return image_file_paths, table_page_mappings


ExtractTableHandler = ExtractTableHandler()
