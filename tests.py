from unittest import TestCase
from flask.ext.webtest import TestApp
from app import app


class AppTest(TestCase):
    def setUp(self):
        self.app = app
        self.w = TestApp(self.app)

    def test_home_has_hashtag_in_context(self):
        r = self.w.get("/")
        self.assertIsInstance(r.context['hashtag'], dict)

    def test_home_uses_correct_template(self):
        r = self.w.get("/")
        self.assertEqual(r.template, 'hashtag.html')

    def test_hashtag_object_has_models_list(self):
        r = self.w.get("/")
        assert len(r.context['posts']['models']) > 0

    def test_home_returns_200(self):
        r = self.w.get("/")
        self.assertEqual(r.status_code, 200)

    def test_400_error(self):
        r = self.w.get("/url-that-doesnt-exist-lllllll", expect_errors=True)
        print r.status_code
        self.assertEqual(r.status_code, 400)
