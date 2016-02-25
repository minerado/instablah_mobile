(function(){
  $(document).ready(function(){

    function page_view(slug){
      amplitude.logEvent("pageview", { slug: slug });
    }

    var $posts_container = $(".posts-container");

    // Properties
    var hashtag_slug = $posts_container.data("hashtag-slug");
    
    pageview(hashtag_slug);
  });
})();