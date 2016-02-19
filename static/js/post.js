(function(){

  'use strict';


  // Função responsável por "desenhar" um estado de "pego" pro post
  function grabPost(opts) {

    // Define propriedades para o post, após movimentá-lo
    opts.$post_container
      .data("touch-status", "held")
      .addClass("held")
      .removeClass("post-transition");

    $post
      .addClass("card-hover");

    if(opts.video){
      opts.$video_layer.show();
    }

    // Cálculo do movimento do post
    /* Movimenta post usando transform (scale e translate),
    assim como um translate3d para acelerar a placa de vídeo
    do device */
    $post.css("transform",
      "translate3d(0, 0, 0)" +
      "scale(" + opts.scale + ") " +
      "translate(" +
        (proportion * ($post.width()/2 - opts.x)) + "px," +
        (proportion * ($post.height()/2 - opts.y + $post.offset().top)) + "px)");
    
    if(opts.ponctual_held){
      toggleHeaderFeature(opts);  
    }
    else{

    }
  }

  function releasePost(opts){
    toggleHeaderFeature(opts, 1);
  }

  function toggleHeaderFeature(opts, state){
    if(!state){
      opts.$feature_header.stop(true, true).fadeIn(true);
      return false;
    }
    opts.$feature_header.stop(true, true).fadeOut(true);
  }

  function checkHold(opts){
    if (opts.$post_container.data("touch-status") === "held") {
      opts.swipe_check = true;
      return true;
    }

    return false;
  }



  function checkSwipe(opts, page_x, page_y, timeout_id){
    var delta_x = page_x - opts.x;
    var delta_y = page_y - opts.y;

    if (!opts.swipe_check && Math.abs(delta_y) > opts.thresh_y) {
      opts.swipe_check = !opts.swipe_check;
      return false;
    }

    if (!opts.swipe_check && Math.abs(delta_x) > opts.thresh_x) {
      clearTimeout(timeout_id);

      opts.x += delta_x;
      opts.y += delta_y;

      grabPost(opts);
      
      opts.swipe_check = !opts.swipe_check;
      return true;
    }

    return false;
  }

  function checkPosition(opts, page_x, window_y, bg_scale){

    var delta_x = (((page_x-opts.x)/opts.scale)/opts.post_width);

    // Checa se cursor está em cima da feature central
    if (window_y <= 78) {
      if (opts.$feature_header.hasClass("off-feature")) {
        opts.$feature_header
          .removeClass("off-feature")
          .addClass("on-feature");
        opts.$post_container.css("opacity", 0.1);
      }
    } else if (opts.$feature_header.hasClass("on-feature")) {
      opts.$feature_header
        .removeClass("on-feature")
        .addClass("off-feature");
      opts.$post_container.css("opacity", 1);
    }

    // Trata da feature tinder
    var bg_opacity = Math.min(Math.abs(delta_x*Math.abs(delta_x)*opts.bg_scale), 0.4);
    bg_opacity *= (delta_x>0 ? 1 : -1);
    if (!opts.ponctual_held) {
      opts.$bg1.css("opacity", bg_opacity);
      opts.$bg2.css("opacity", -bg_opacity);    
    }
  }

  function setDrop(opts){
    if (opts.client_y <= 78 && opts.ponctual_held) {
      opts.$post.addClass("hidden");
    }
    opts.$post_container
      .removeData("touch-status")
      .addClass("post-transition")
      .off("touchmove");

    opts.$post
      .css("transform", "scale(1) translate(0, 0)")
      .removeClass("card-hover");

    if(opts.delta_x > 160 && !opts.ponctual_held){
      opts.$post_container
        .css("transform", "translate(" + 1.5*(opts.post_width/2) + "px,0)");
      opts.$post
        .css("transform", "scale(1) rotate(7deg)");
      opts.$actions_container.css("opacity", "1");

    } else if(opts.delta_x < -160 && !opts.ponctual_held){
      opts.$post_container
        .css("transform", "translate(" + -1.5*(opts.post_width/2) + "px,0)");
      opts.$post
        .css("transform", "scale(1) rotate(-7deg)");
      opts.$actions_container.css("opacity", "1");

    } else{
      opts.$post_container
        .css("transform", "translate(0,0)");
      opts.$post
        .css("transform", "scale(1) translate(0, 0)");

      // Apaga o background para não ficar com a tela de like/dislike
      opts.$actions_container.css("opacity", "0");

      opts.$feature_header
        .removeClass("on-feature")
        .addClass("off-feature");
    }
  }

  /* Função responsável por movimentar o post
  baseado na posição do dedo do usuário
  */
  function setMovablePost($posts) {

    // Cacheia elementos únicos
    var $feature_header = $("#feature-header");
    var $actions_container = $("#actions-container");
    var $bg1 = $actions_container.find("#bg-1");
    var $bg2 = $actions_container.find("#bg-2");
    var $video_layer = $(".post-video-layer");

    // Escala de diminuição do post
    var scale = 0.98;
    // Ângulo máximo que o post vira
    var angle = 10;
    // Constante da potência de variação do background
    var bg_scale = 3;

    // Seta largura dos posts
    var post_width = $(window).width();

    // Seta limites para swipe vertical e horizontal
    var thresh_x = 30,
        thresh_y = 10;

    // Seta variáveis que dizem qual as coordenadas da posicao inicial do toque
    var initial_x_client;
    var initial_y_client;

    // Seta se post foi segurado ou arrastado
    var ponctual_held = false;


    // Função que acontece quando a pessoa toca na tela
    $posts.on("touchcancel", ".post-container", function(e) {
      // Cacheia elementos necessários
      var $post_container = $(this);

      // Salva a posição xy inicial do dedo na tela
      var initial_x_page = e.originalEvent.touches[0].pageX;
      var initial_y_page = e.originalEvent.touches[0].pageY;
      initial_x_client = initial_x_page;
      initial_y_client = initial_y_page;


      var opts = {
        x: initial_x_page,
        y: initial_y_page,
        thresh_x: thresh_x,
        thresh_y:thresh_y,
        scale: scale,
        angle: angle,
        $feature_header: $feature_header,
        $post_container: $post_container,
        swipe_check: false,
        post_width: post_width,
        $actions_container: $actions_container,
        $bg1: $bg1,
        $bg2: $bg2,
        bg_scale: bg_scale,
        video: $(e.target).hasClass("post-video-layer"),
        ponctual_held: ponctual_held,
        $video_layer: $video_layer
      };

      if(opts.video){
        $video_layer.hide();    
      }

      var timeout_id = setTimeout(function() {
        opts.ponctual_held = true;
        ponctual_held = true;
        grabPost(opts);
      }, 400);

      $actions_container.css("opacity", "0.8");
      $bg1.css("opacity", 0);
      $bg2.css("opacity", 0);

      $post_container
        .data("touch-status", timeout_id)
        .on("touchmove", function(e) {

          var page_x   = e.originalEvent.touches[0].pageX;
          var page_y   = e.originalEvent.touches[0].pageY;
          var window_y = e.originalEvent.touches[0].clientY;

          if (checkSwipe(opts, page_x, page_y, timeout_id) || checkHold(opts)) {
            e.preventDefault();

            $post_container.move(
              (page_x-opts.x)/opts.scale,
              (page_y-opts.y)/opts.scale,
              opts.angle*(((page_x-opts.x)/opts.scale)/opts.post_width));

            checkPosition(opts, page_x, window_y);
          }
          else{
            clearTimeout(timeout_id);
          }

          return true;
        });
    });

    $posts.on("touchcancel", ".post-container", function(e) { 

      // Cacheia elementos
      var $post_container    = $(this);
      var $post              = $post_container.find(".post");

      // Pega posição em que o dedo está, relacionado à janela
      var client_x = e.originalEvent.changedTouches[0].clientX;
      var client_y = e.originalEvent.changedTouches[0].clientY;
      var delta_x = client_x - initial_x_client;
      var delta_y = client_y - initial_y_client;

      // Verifica se post está sendo segurado
      var held = $post_container.hasClass("held");

      // Verifica se clicou em um vídeo
      var video = $(e.target).hasClass("post-video-layer");

      var opts = {
        $post_container: $post_container,
        $post: $post,
        $feature_header: $feature_header,
        $bg1: $bg1,
        $bg2: $bg2,
        video: video,
        client_x: client_x,
        client_y: client_y,
        held: held,
        delta_x: delta_x,
        delta_y: delta_y,
        $actions_container: $actions_container,
        ponctual_held: ponctual_held,
        post_width: post_width
      };

      // Acaba com o timeout, caso ele ainda esteja em espera
      clearTimeout($post_container.data("touch-status"));

      // Evita que o cara entre em um link se tiver segurado o post
      if(held){
        e.preventDefault();
        toggleHeaderFeature({$feature_header: $feature_header}, 1);
        $post_container.removeClass("held");
      }

      // Função que cuida da ação de soltar o post
      setDrop(opts);

      /* Extras relacionados à outras funcionalidades */

      
      
      // Se a pessoa clicou no video, a overlay deve voltar
      if(video){
        setTimeout(function(){
          $video_layer.show();
        }, 1000);  
      }

      ponctual_held = false;
    });
  }

  $(document).ready(function() {

    var $posts = $(".posts-container");

    /* Novo Código */
    /***********************************************************/
    /* Declarações de funções e variáveis */
    
    // Move Function
    /* Move e gira um elemento para uma determinada coordenada */
    $.fn.move = function(x, y, t){
      var opts = {
        left: x,
        top: y
      };
      
      TweenMax.to(this, t, opts);
      return this;
    };

    // Hold Function
    /* Faz a animação de segurar um elemento,
    recebe como parâmetros uma escala para diminuir,
    um x e um y do documento */
    $.fn.toggleHold = function(scale, x, y){
      var left = (1-1/scale)*(this.width()/2-x),
          top =  (1-1/scale)*(this.height()/2+this.offset().top-y);

      this.toggleClass("card-hover")
        .css("transform", "scale(" + scale +
              ") translate(" + left + "px," + top + "px)");

      return this.setState("held");
    };

    $.fn.release = function(){
      var _this = this;
      _this.move(0,0,0.25).toggleHold(1,0,0);
      return this.setState("dropped");
    };

    function toggleShare($share, show){
      var opts = {
        button: {
          bottom: show ? 30 : -80
        },
        text: {
          top: show ? 40 : -40
        },
        text_overlay: {
          display: show ? "block" : "none",
          opacity: show ? 1 : 0
        }
      };
      TweenMax.to($share.button, 0.25, opts.button);
      TweenMax.to($share.text, 0.25, opts.text);
      TweenMax.to($share.text_overlay, 0.25, opts.text_overlay);
    }

    // Retorna o estado em que o post se encontra (ex: held)
    $.fn.getState = function(){
      return this.data("state");
    };

    // Define estado em que post se encontra (ex: held)
    $.fn.setState = function(state){
      if(this.data("state") !== state){
        this.data("state", state);
      }
      
      return this;
    };

    function checkSwipe(coord_0, coord_1, threshold){
      var delta_x = coord_1.x-coord_0.x,
          delta_y = coord_1.y-coord_0.y,
          y = (Math.abs(delta_y) > threshold.y) ? threshold.x : 0,
          x = (Math.abs(delta_x) > threshold.x) ? delta_x : 0,
          swipe = y || x;
      if(swipe < 0){
        return "swipe-x-e";
      }
      else if(swipe > threshold.x){
        return "swipe-x-d";
      }
      else if(swipe == threshold.x){
        return "swipe-y";
      }
      return "moving";
    }

    $.fn.changeOpacityX = function(x, t){
      var opts = {
        opacity: x
      };
      TweenMax.to(this, t, opts);
    };

    function setBgColor($container, $like, $dislike, coord_0, coord_1){
      var delta = coord_1.x-coord_0.x,
          container_width = $container.width(),
          absolute_delta = Math.min(Math.abs(delta), container_width/2),
          proportion = absolute_delta/(container_width/2);

      $dislike_bg.changeOpacityX((delta<0)*proportion, 0);
      $like_bg.changeOpacityX((delta>=0)*proportion, 0);
    }

    function fingerOn($element, x, y){
      var coord = {
        left: $element.position().left,
        top: $element.position().top,
        width: $element.width(),
        height: $element.height()
      };

      return x >= coord.left && x <= coord.left + coord.width &&
        y >= coord.top && x <= coord.top + coord.height;
    }

    // Variáveis para cachear elementos da DOM
    var $posts_container = $("#posts-container"),
        $like_container  = $("#like-container"),
        $like_bg         = $("#like-container-like"),
        $dislike_bg      = $("#like-container-dislike");

    var $share = {
      button: $("#share-button"),
      text: $("#share-text"),
      text_overlay: $("#share-text-overlay")
    };

    // Variáveis que serão usadas durante o programa
    var hold_scale = 0.95,
        timeout_id = 0,
        anchor = false,
        threshold = {
          x: 30,
          y: 10
        };

    /* Programa */
    /*  */
    $posts_container.on("touchstart.post", ".post", function(e){
      var $post = $(this);

      var coord_0 = {
        x:      e.originalEvent.touches[0].pageX,
        y:      e.originalEvent.touches[0].pageY,
        y_cli:  e.originalEvent.touches[0].clientY
      };

      var post_pos = {
        left: $post.position().left,
        top:  $post.position().top
      };

      var $target = $(e.target);
      anchor = $target.is("a") ? $target : false;

      // Variável que define estado do post
      var state;
      timeout_id = setTimeout(function() {
        if (!state) {
          $post.toggleHold(hold_scale, coord_0.x, coord_0.y);
          toggleShare($share, true);
          state = "held";

        }
      }, 400);

      $post.on("touchmove", function(e2){
        var coord_1 = {
          x:      e2.originalEvent.touches[0].pageX,
          y:      e2.originalEvent.touches[0].pageY,
          y_cli:  e2.originalEvent.touches[0].clientY
        };

        /* Garante que, se o post for movido antes do timeout acabar,
        seja impossível do post ser segurado */
        if(!state){
          clearTimeout(timeout_id);
          state = "moving";
          $post.setState("moving");
        }

        if(state === "held"){
          if (fingerOn($share.button, coord_1.x, coord_1.y_cli)) {
            if(!$share.button.hasClass("share-hover")){
              $share.button.addClass("share-hover"); 
            }
          } else{
            if($share.button.hasClass("share-hover")){
              $share.button.removeClass("share-hover");
            }
          }

          $post.move(post_pos.left + (coord_1.x-coord_0.x),
                     (coord_1.y-coord_0.y),
                     0);

          return false;
        } else if (state=="moving") {
          state = checkSwipe(coord_0, coord_1, threshold);
          $post.setState(state);
          return true;
        } else if (state==="swipe-y") {
          return true;
        } else if (state==="swipe-x-d"){
          $post.move(post_pos.left + coord_1.x-coord_0.x-threshold.x, 0, 0);
          setBgColor($like_container, $like_bg, $dislike_bg, coord_0, coord_1);
          return false;
        } else if (state==="swipe-x-e"){
          $post.move(post_pos.left + coord_1.x-coord_0.x+threshold.x, 0, 0);
          setBgColor($like_container, $like_bg, $dislike_bg, coord_0, coord_1);
          return false;
        }
      });
    });

    $posts_container.on("touchend", ".post", function(e){
      var $post = $(this),
          state = $post.getState(),
          coord_f = {
            x:      e.originalEvent.changedTouches[0].pageX,
            y:      e.originalEvent.changedTouches[0].pageY,
            y_cli:  e.originalEvent.changedTouches[0].clientY
          };

      // Cancela eventos que ainda estejam ocorrendo ou possam ocorrer
      clearTimeout(timeout_id);
      $post.off("touchmove");

      if(state==="held"){
        $share.button.removeClass("share-hover");
        toggleShare($share, false);
        // Se soltar o post em cima do botão de compartilhar
        if(fingerOn($share.button, coord_f.x, coord_f.y_cli)){
          //location = $post.find(".share-action").attr("href");
          $post.find(".share-action")[0].click();
        }
        anchor = false;
        $post.release();
      } else if (state==="swipe-x-e" || state==="swipe-x-d"){
        anchor = false;
        $post.release();
      } else if (state==="swipe-y" || state==="moving"){
      } else{
        if(anchor){
          window.location.href = anchor.data("url");
        }
      }
      console.log(state);
      state = false;
      anchor = false;
      
      return false;
    });
  });
})();