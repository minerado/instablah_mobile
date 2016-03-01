(function() {
    $(document).ready(function() {
        /* Variable declaration */
        var $posts_container = $(".posts-container");
        var hashtag_slug = $posts_container.data("hashtag-slug");

        /* Function declaration */
        function page_view(slug) {
            amplitude.logEvent("pageview", {
                slug: slug
            });
        }

        function share(hashtag_slug, post_slug, post_type) {
            amplitude.logEvent("share", {
                hashtag:   hashtag_slug,
                post:      post_slug,
                post_type: post_type
            });
        }

        /* Events */
        $posts_container.on('touchstart', '.post-share-button', function(){
            var $post = $(this).closest('.post');
            share(hashtag_slug, $post.data('slug'), $post.data('type'));
        });

        /* Main */

        page_view(hashtag_slug);
    });
})();