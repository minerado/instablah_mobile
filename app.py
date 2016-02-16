import requests
import requests_cache

from flask import Flask, abort, render_template


# Setup
app = Flask(__name__)
ENDPOINT = "http://www.instablah.com.br/api/v1"
requests_cache.install_cache('instablah_api', expire_after=300)


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

@app.route("/<slug>")
def show_hashtag(slug):
    hashtag = get_hashtag_meta(slug)
    posts   = get_hashtag_posts(slug)
    return render_template('hashtag.html', hashtag=hashtag, posts=posts)


@app.route("/<string:hashtag_slug>/<string:post_slug>/<int:post_id>")
def show_post(hashtag_slug, post_slug, post_id):
    post = get_post_content(post_id)
    return render_template('post.html', post=post)


@app.route("/<string:hashtag_slug>/<string:post_slug>/<int:post_id>/richcontent")
def show_post_richcontent(hashtag_slug, post_slug, post_id):
    post = get_post_content(post_id)
    if not post.get('richcontent'):
        abort(404)
    return render_template('post.html', post=post)


@app.errorhandler(404)
def not_found(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('400.html'), 400


@app.errorhandler(500)
def internal_error(error):
    app.logger.error('Server Error: %s', (error))
    return render_template('500.html'), 500


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
