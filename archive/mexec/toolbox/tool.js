function mkdir_p(dirPath, mode, callback) {
  //Call the standard fs.mkdir
  require('fs').mkdir(dirPath, mode, function(error) {
    //When it fail in this way, do the custom steps
    if (error && error.errno === 34) {
      //Create all the parents recursively
      mkdir_p(require('path').dirname(dirPath), mode, callback);
      //And then the directory
      mkdir_p(dirPath, mode, callback);
    }
    //Manually run the callback since we used our own callback to do all these
    callback && callback(error);
  });
}

exports.mkdir_p = mkdir_p;