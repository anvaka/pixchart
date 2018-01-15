/**
 * Handles dropped files into the browser.
 */
module.exports = fileDrop;

function fileDrop(dropHandler, onDropped) {
  dropHandler.addEventListener('drop', handleDrop, true);
  dropHandler.addEventListener('dragover', handleDragOver);
  dropHandler.addEventListener('dragenter', prevent);
  dropHandler.addEventListener('dragleave', handleDragEnd)
  dropHandler.addEventListener('dragend', handleDragEnd);

  return {
    dispose
  }

  function dispose() {
    dropHandler.removeEventListener('drop', handleDrop);
    dropHandler.removeEventListener('dragover', handleDragOver);
    dropHandler.removeEventListener('dragenter', prevent);
    dropHandler.removeEventListener('dragleave', handleDragEnd)
    dropHandler.removeEventListener('dragend', handleDragEnd);
  }

  function prevent(e) {
    e.preventDefault();
  }

  function handleDrop(ev) {
    handleDragEnd();
    ev.preventDefault();
    // If dropped items aren't files, reject them
    var dt = ev.dataTransfer;
    var files = []
    if (dt.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < dt.items.length; i++) {
        if (dt.items[i].kind == "file") {
          var file = dt.items[i].getAsFile();
          files.push(file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (var i=0; i < dt.files.length; i++) {
        var file = dt.files[i];
        files.push(file);
      } 
    }

    onDropped(files);
  }


  function handleDragOver(e) {
    e.preventDefault();
    dropHandler.classList.add('drag-over');
  }

  function handleDragEnd() {
    dropHandler.classList.remove('drag-over');
  }
}