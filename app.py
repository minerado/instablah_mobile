import requests
import requests_cache

from flask import Flask, render_template
from pprint import pprint

# Setup
app = Flask(__name__)
ENDPOINT = "http://www.instablah.com.br/api/v1"
requests_cache.install_cache('instablah_api', expire_after=300)


# Model

def get_hashtag_meta(slug):
    url = "{}/hashtags/slug/{}".format(ENDPOINT, slug)
    return requests.get(url).json()


def get_hashtag_posts(slug):
    url = "{}/hashtags/slug/{}/posts".format(ENDPOINT, slug)
    return requests.get(url).json()


def get_post_content(post_id):
    url = "{}/posts/{}".format(ENDPOINT, post_id)
    return requests.get(url).json()


# Routes

@app.route("/<slug>")
def show_hashtag(slug):
    hashtag = get_hashtag_meta(slug)
    posts   = get_hashtag_posts(slug)
    return render_template('hashtag.html', hashtag=hashtag, posts=posts)


@app.route("/<string:hashtag_slug>/<string:post_slug>/<int:post_id>/richcontent")
def show_post(hashtag_slug, post_slug, post_id):
    post = get_post_content(post_id)
    return render_template('post.html', post=post)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
