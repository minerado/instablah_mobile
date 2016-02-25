(function(){
  $(document).ready(function(){

    function page_view(slug){

    }
    var $posts_container = $(".posts-container");

    amplitude.logEvent("pageview", { slug: $posts_container.data("hashtag-slug") });

  });
})();