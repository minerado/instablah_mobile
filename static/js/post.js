(function(){

  'use strict';

  $(document).ready(function() {

    var $posts = $(".posts-container");

    /* Novo Código */
    /***********************************************************/
    /* Declarações de funções e variáveis */
    
    // Move Function
    /* Move e gira um elemento para uma determinada coordenada */
    $.fn.move = function(x, y, scale){

      this.css({
        "transform": "translate(" + x + "px, " + y + "px) scale(" + scale + ") translate3d(0,0,0)"
      });
      return this;
    };

    // Hold Function
    /* Faz a animação de segurar um elemento,
    recebe como parâmetros uma escala para diminuir,
    um x e um y do documento */
    $.fn.hold = function(x, y, scale){
      this
        .addClass("card-hover")
        .css({ "transform": "scale(" + scale +
                 ") translate(" + (1-1/scale)*(this.width()/2-x) + "px," +
                 (1-1/scale)*(this.height()/2+this.offset().top-y) + "px) translate3d(0,0,0)",
               "transition": "transform 0s, box-shadow .25s"
             });
      return this;
    };

    $.fn.release = function(){
      this
        .css("transition", "transform .2s, box-shadow .25s")
        .removeClass("card-hover")
        .move(0,0,1);
        // .css("transform", "translate(0, 0) translate3d(0,0,0)")
      return this;
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
      var state = this.data("state");

      if(state) return state;

      return Error("Estado veio indefinido: " + state);
    };

    // Define estado em que post se encontra (ex: held)
    $.fn.setState = function(state){
      if(!state) return Error("Não pode declarar este estado: " + state);

      if(this.data("state") !== state){
        this.data("state", state);
      }
      $("#test2").text(state);

      return state;
    };

    function checkSwipe(coord_0, coord_1, threshold, post_state){
      var delta_x = coord_1.x-coord_0.x,
          delta_y = coord_1.y_cli-coord_0.y_cli,
          y = (Math.abs(delta_y) > threshold.y) ? threshold.x : 0,
          x = (Math.abs(delta_x) > threshold.x) ? delta_x : 0,
          swipe = y || x;

      // if(Math.abs(delta_y) > threshold.y){
      //   return post_state.swipe_y;
      // }

      if(swipe < 0){
        return post_state.swipe_x_e;
      }
      else if(swipe > threshold.x){
        return post_state.swipe_x_d;
      }
      else if(swipe == threshold.x){
        return post_state.swipe_y;
      }
      return post_state.pre_swipe;
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
        left:   $element.position().left,
        top:    $element.position().top,
        width:  $element.width(),
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
      button:       $("#share-button"),
      text:         $("#share-text"),
      text_overlay: $("#share-text-overlay")
    };

    // Define estados possíveis para post
    var post_state = {
      held:      "held",
      clicked:   "clicked",
      dropped:   "dropped",
      pre_swipe: "pre-swipe",
      swipe_x_d: "swipe-x-d",
      swipe_x_e: "swipe-x-e",
      swipe_y:   "swipe-y"
    };

    // Variáveis que serão usadas durante o programa
    var hold_scale = 0.95,
        timeout_id = 0,
        threshold = {
          x: 20,
          y: 5
        };

    /* Programa */
    /*  */
    $posts_container.on("touchstart", ".post", function(e){
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

      // Variável que define estado do post
      var state = $post.setState(post_state.clicked);

      $post.css({ "transition": "transform 0s, box-shadow .25s" });

      /*
      timeout_id = setTimeout(function() {
        if(state===post_state.clicked){
          $post.hold(coord_0.x, coord_0.y, hold_scale);
          toggleShare($share, true);
          state = $post.setState(post_state.held);
        }
      }, 400);
      */

      $post.on("touchmove.post", function(e2){
        var coord_1 = {
          x:     e2.originalEvent.touches[0].pageX,
          y:     e2.originalEvent.touches[0].pageY,
          y_cli: e2.originalEvent.touches[0].clientY
        };

        if(state===post_state.clicked){
          // clearTimeout(timeout_id);
          state = $post.setState(post_state.pre_swipe);
        } else if(state===post_state.held){
          /* if(fingerOn($share.button, coord_1.x, coord_1.y_cli)) $share.button.addClass("share-hover");
          else $share.button.removeClass("share-hover");
          $post.move(
            (coord_1.x-coord_0.x)+(1-1/hold_scale)*($post.width()/2-coord_0.x),
            (coord_1.y_cli-coord_0.y_cli)+(1-1/hold_scale)*($post.height()/2+$post.offset().top-coord_0.y),
            hold_scale);
          $("#test3").text((coord_1.y_cli-coord_0.y_cli)+(1-1/hold_scale)*($post.height()/2+$post.offset().top-coord_0.y));
          return false; */
        } else if(state===post_state.pre_swipe){
          state = $post.setState(checkSwipe(coord_0, coord_1, threshold, post_state));
        } else if(state===post_state.swipe_y){
        } else if(state===post_state.swipe_x_d){
          // LEMBRAR DE SETAR TRANSITION TRANSFORM PARA 0
          $post.move(post_pos.left+coord_1.x-coord_0.x-threshold.x, 0, 1);
          setBgColor($like_container, $like_bg, $dislike_bg, coord_0, coord_1);
          return false;
        } else if(state===post_state.swipe_x_e){
          $post.move(post_pos.left+coord_1.x-coord_0.x+threshold.x, 0, 1);
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
      $posts_container.off("touchmove");
      $post.off("touchmove");

      // Trata página, dependendo de como o post está
      if(state===post_state.held){
        // Remove parte de share
        $share.button.removeClass("share-hover");
        toggleShare($share, false);

        // Solta post
        $post.release();

        // Se soltar o post em cima do botão de compartilhar
        if(fingerOn($share.button, coord_f.x, coord_f.y_cli)){
          //location = $post.find(".share-action").attr("href");
          $post.find(".share-action")[0].click();
        }
      } else if (state===post_state.swipe_x_e || state===post_state.swipe_x_d){
        $post.release();
      } else if (state===post_state.swipe_y){
        return false;
      } else if (state===post_state.pre_swipe){
      } else if (state===post_state.clicked){
        $post.release();
      }
      
      return true;
    });
  });
})();