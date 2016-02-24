from fabric.api import *


env.user = "instablah"
env.hosts = ['104.41.59.33']
env.port = 22
env.timeout = 30
env.connection_attempts = 3
env.home = '/home/instablah/www/instablah_mobile'
env.venv = '/home/instablah/.venvs/instablah-mobile/bin/activate'


def restart_supervisor():
    sudo("supervisorctl restart m.instablah.com.br")


def pull_latest_code():
    with cd(env.home):
        sudo('git pull', user=env.user)


def delete_pyc():
    with cd(env.home):
        sudo('find . -name \'*.pyc\' -delete', user=env.user)


def update_requirements():
    with cd(env.home):
        with prefix('source {0}'.format(env.venv)):
            run('pip install -r requirements.txt')


def deploy():
    pull_latest_code()
    delete_pyc()
    update_requirements()
    restart_supervisor()
