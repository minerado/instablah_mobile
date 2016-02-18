import requests
import requests_cache

from flask import Flask, abort, render_template
from waitress import serve


# Setup

app = Flask(__name__)
DEBUG = bool(os.environ.get('DEBUG'))
app.debug = DEBUG
PORT = 8081
ENDPOINT = "http://www.instablah.com.br/api/v1"
requests_cache.install_cache('instablah_api', expire_after=30)


# Model

def get_item_from_url(url):
    res = requests.get(url).json()

    # API doesn't return proper http status codes, so we gotta check for
    # message property for non-existent items
    if res.get('message'):
        abort(404)

    return res


def get_hashtag_meta(slug):
    url = "{}/hashtags/slug/{}".format(ENDPOINT, slug)
    return get_item_from_url(url)


def get_hashtag_posts(slug):
    url = "{}/hashtags/slug/{}/posts".format(ENDPOINT, slug)
    return get_item_from_url(url)


def get_post_content(post_id):
    url = "{}/posts/{}".format(ENDPOINT, post_id)
    return get_item_from_url(url)


# Routes

@app.route("/")
def index():
    return show_hashtag(slug="Instablah")


@app.route("/<slug>")
def show_hashtag(slug):
    hashtag = get_hashtag_meta(slug)
    posts   = get_hashtag_posts(slug)
    return render_template('hashtag.html', hashtag=hashtag, posts=posts)


@app.route("/<string:hashtag_slug>/<string:post_slug>/<int:post_id>")
def show_post(hashtag_slug, post_slug, post_id):
    post = get_post_content(post_id)
    hashtag = get_hashtag_meta(hashtag_slug)
    return render_template('post.html', post=post, hashtag=hashtag)


@app.route("/<string:hashtag_slug>/<string:post_slug>/<int:post_id>/richcontent")
def show_post_richcontent(hashtag_slug, post_slug, post_id):
    post = get_post_content(post_id)
    if not post.get('richcontent'):
        abort(404)
    hashtag = get_hashtag_meta(hashtag_slug)
    return render_template('post.html', post=post, hashtag=hashtag)


@app.errorhandler(404)
def not_found(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('400.html'), 400


@app.errorhandler(500)
def internal_error(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('500.html'), 500


if __name__ == "__main__":
    if app.debug:
        # werkzeug (waitress doesn't reload on change)
        app.run(port=PORT)
    else:
        serve(app, port=PORT)
    db.close()
