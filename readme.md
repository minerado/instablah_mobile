README
------


Steps to use
============

Install environment (installs all app packages): 
    pip install -r requirements_dev.txt

Install dev environment (install testing-related libs)
    pip install -r dev_requirements.txt

Run app server in DEV mode:
    DEBUG=1 python app.py

Deploy to production (make sure you have installed dev_requirements, otherwise it will fail):
    fab deploy

Do a little dance and make a little love.
