import subprocess

def install(packages):
    for package in packages:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])

if __name__ == '__main__':
    packages = ['asgiref==3.4.1', 'Django==3.2.7', 'django-cors-headers==3.8.0', 'djangorestframework==3.12.4', 'djongo==1.3.6', 'pymongo==3.12.0', 'pytz==2021.1', 'sqlparse==0.2.4','PyPDF2~=1.26.0','mongoengine~=0.23.1','ExtractTable~=2.2.0','django-rest-framework-mongoengine~=3.4.1','django-rest-framework-nested~=0.0.1','Pillow~=9.2.0']
    install(packages)