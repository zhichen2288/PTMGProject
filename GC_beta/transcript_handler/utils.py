from PyPDF2 import PdfFileReader, PdfFileWriter
from pathlib import Path
from io import BytesIO, BufferedReader
import os


def extract_pages_from_raw_file(raw_file: BytesIO, pages: list) -> BytesIO:
    """
    Extract desired pages from a pdf file.

    @param raw_file: An io stream.
    @param pages: A list of int which indicates the desired page numbers.
    @return: An io stream(BytesIO).
    """
    pdf = PdfFileReader(raw_file)
    if not isinstance(pdf, PdfFileReader):
        raise Exception('File type not valid')
    pages, number_of_pages = sorted(pages), pdf.getNumPages()
    if not pages or not (pages[-1] <= number_of_pages and pages[0] >= 0):
        raise Exception('pages out of range.')
    pdf_writer = PdfFileWriter()
    for page in pages:
        pdf_writer.addPage(pdf.getPage(page))
    buffer = BytesIO()
    pdf_writer.write(buffer)
    buffer.seek(0)
    return buffer


def get_transcripts_and_dump_into_disk(student, BASE_DIR):
    """
    Retrieve transcript from Mongo and save them into hard disk with the abs path returned.
    Why not a file or an IO stream? Simply cuz the ExtracTable doesn't like it.

    @param student: Mongoengine's Student Collection.
    @param BASE_DIR: String for indicating the base dir.
    @return: Abs path for the dumped file.
    """
    pdf = PdfFileReader(student.transcript.raw_file)
    pdf_writer = PdfFileWriter()
    for i in range(pdf.getNumPages()):
        pdf_writer.addPage(pdf.getPage(i))
    outpur_file_dir = os.path.join(BASE_DIR, "media", student.name)
    # output_file_path = os.path.join(outpur_file_dir,f'{student.id}-[{",".join(map(str, student.transcript.valid_pages))}].pdf')
    output_file_path = os.path.join(outpur_file_dir, f'{student.name}-raw-transcripts.pdf')
    print('dumping file to:', output_file_path)
    if not os.path.isdir(outpur_file_dir):
        Path(outpur_file_dir).mkdir(parents=True, exist_ok=True)
    with open(output_file_path, 'wb') as output_pdf:
        pdf_writer.write(output_pdf)
    return output_file_path

