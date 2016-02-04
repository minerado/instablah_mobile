import requests
import requests_cache

from flask import Flask, render_template
from pprint import pprint

# Setup
app = Flask(__name__)
ENDPOINT = "http://www.instablah.com.br/api/v1"
requests_cache.install_cache('instablah_api', expire_after=300)


@app.route("/<hashtag_slug>")
def show_hashtag(hashtag_slug):
    url_hashtag = "{}/hashtags/slug/{}".format(ENDPOINT, hashtag_slug)
    hashtag = requests.get(url_hashtag).json()
    # pprint(hashtag.text)
    url_posts = "{}/hashtags/slug/{}/posts".format(ENDPOINT, hashtag_slug)
    posts = requests.get(url_posts).json()
    # pprint(posts.text)
    return render_template('hashtag.html', hashtag=hashtag, posts=posts)


@app.route("/<string:hashtag_slug>/<string:slug>/<int:post_id>/richcontent")
def show_post(hashtag_slug, slug, post_id):
    url = "{}/posts/{}".format(ENDPOINT, post_id)
    json_response = requests.get(url).json()

    return render_template('post.html', post=json_response)


if __name__ == "__main__":
    app.debug = True
    app.run(host='0.0.0.0')
