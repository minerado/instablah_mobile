// Função responsável por "desenhar" um estado de "pego" pro post
function grabPostUI($post, x, y, scale, angle) {
  var post_half_width = $post.width() / 2;
  var post_half_height = $post.height() / 2;
  var top = $post.offset().top;

  var scale_proportion = ((scale - 1) / scale);

  $post.css("transform",
    "scale(" + scale + ") " +
    "translate(" +
    (scale_proportion * (post_half_width - x)) + "px," +
    (scale_proportion * (post_half_height - y + top)) + "px)");
}

/* Função responsável por movimentar o post
baseado na posição do dedo do usuário
*/
function setMovablePost($posts) {

  var scale = 0.85;
  var angle = 10;

  $posts.on("touchstart", ".post-container", function(e) {

    // Salva a posição xy inicial do dedo na tela
    var initial_x = e.originalEvent.touches[0].pageX;
    var initial_y = e.originalEvent.touches[0].pageY;

    // Cacheia elementos necessários para a mágica
    var $post_container = $(this);
    var $post = $post_container.find(".post");
    var post_width = $post.width();

    // Espera x segundos para ver se o usuário não soltou o dedo
    /*
      Aqui, estou checando se o "touch-status" do post foi modificado
      por algum outro evento, caso tenha sido (muito provavelmente para 0),
      nada deve acontecer.
    */
    var timeout = setTimeout(function() {

      // 1. Muda o estado do post para "held"
      /*
        Estou, com isso, fazendo uma máquina de estados,
        podendo controlar o estado do post dependendo
        do atributo "data"
      */
      $post_container.data("touch-status", "held");

      // 2. Indicar que foi "pego"
      // Muda o tamanho do post para uma escala x predefinida
      /*
        É importante notar que dividi dois transforms:
        um para o post e outro pra seu container pai.
        O post é responsável por girar e o container pai
        por mover. Foi necessário fazer isso devido a problemas
        de herança no z-index e devido à animações que necessitam
        ocorrer simultaneamente.
      */
      grabPostUI($post, initial_x, initial_y, scale, angle);

      // Muda a classe do post para "held"
      /*
        Essa é a parte responsável por deixar o post a cima
        dos outros, além de levemente transparente
      */
      $post_container.addClass("held");

      // 3. Remove classe de transição
      /*
        Deve-se remover a classe de transição
        de animação toda vez que for começar a
        movimentar o post, já que não queremos
        delay no movimento 
      */
      $post_container.removeClass("post-transition");
    }, 100);

    // Muda o status do post para o id do setTimeout
    /*
      Fica mais fácil de cancelar o setTimeout se eu tiver
      guardado seu id
    */
    $post_container.data("touch-status", timeout);

    // Aqui fica a parte responsável pela movimentação do post_container
    $post_container.on("touchmove", function(e) {
      if ($post_container.data("touch-status") === "held") {
        e.preventDefault();
        console.log(((e.originalEvent.touches[0].pageX-initial_x)/scale)/post_width);
        $post_container.css({
          "transform": "translate(" +
            (e.originalEvent.touches[0].pageX-initial_x)/scale + "px, " +
            (e.originalEvent.touches[0].pageY-initial_y)/scale + "px) " +
            "rotate(" + angle*(((e.originalEvent.touches[0].pageX-initial_x)/scale)/post_width) + "deg)"
        });
      } else {
        clearTimeout(timeout);
        $post_container.off("touchmove");
      }
      return true;
    });
  });

  $posts.on("touchend", ".post-container", function(e) {

    var $post_container = $(this);
    var $post = $post_container.find(".post");

    // Acaba com o timeout, caso ele ainda esteja em espera
    clearTimeout($post_container.data("touch-status"));

    // Reseta todo o processo de animação
    $post_container.removeData("touch-status")
      .off("touchmove")
      .removeClass("held")
      .addClass("post-transition")
      .css("transform", "translate(0,0)");
    $post.css("transform", "scale(1) translate(0, 0)");
  });
}

$(document).ready(function() {

  var $posts = $(".posts-container");

  setMovablePost($posts);

});
