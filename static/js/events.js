$(document).ready(function() {
    /* Variable declaration */
    var $posts_container = $('.posts-container');
    var page_slug = $posts_container.data('slug') || 'undefined';
    var page_type = $posts_container.data('type') || 'undefined';

    /* Function declaration */
    function page_view(slug, type) {
        alert(page_slug);
        amplitude.logEvent('pageview', {
            slug: slug,
            type: type
        });
    }

    function share(page_slug, post_slug, post_type) {
        amplitude.logEvent('share', {
            hashtag:   page_slug,
            post:      post_slug,
            post_type: post_type
        });
    }

    function click_related(page_slug, post_slug, post_type, related_slug) {
        amplitude.logEvent('clickrelated', {
            hashtag:   page_slug,
            post:      post_slug,
            post_type: post_type,
            related:   related_slug
        });
    }

    

    /* Events */
    $posts_container.on('click', '.post-share-button', function(){
        var $post = $(this).closest('.post');
        share(page_slug, $post.data('slug'), $post.data('type'));
    });

    $posts_container.on('click', '.related', function(){
        var $post = $(this).closest('.post');
        click_related(page_slug, $post.data('slug'), $post.data('type'), $(this).data('slug'));
    });

    /* Main */

    page_view(page_slug, page_type);
});