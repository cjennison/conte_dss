/** The UI Module
 */
(function () {
  Streams.ui = {};
  
  function makeImageBox (options) {
    var box   = $('<div class="image_box">');
    var title = $('<div class="image_box_title">');
    var image = $('<img class="image_box_image">');

    title.html(options.title || '');    
    image.attr('src', options.url);

    box.append(title);
    box.append(image);

    image.width('150px');
    image.height('100px');
    
    Streams.map.view.append(box);
    console.log(Streams.ui.view);
    console.log('added box');
    box.position({ my : 'center top',
                   at : 'center top',
                   of : Streams.map.view
                 });

    box.resizable({ alsoResize: image });    
    box.draggable();
  }

  Streams.ui.makeImageBox = makeImageBox;
})();