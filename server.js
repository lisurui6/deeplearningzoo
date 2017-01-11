var express = require('express');
var app = express();

var fs = require('fs');
var formidable = require('formidable')
var im = require('imagemagick');

var exec = require('child_process').exec;
var child;
var util = require('util');

app.use(express.static('public'));
app.use('/', express.static(__dirname + '/'));
app.get('/index.html', function (req, res) {
   res.sendFile( __dirname + "/" + "index.html" );
})

app.get('/process_get', function (req, res) {
   // Prepare output in JSON format
   response = {
      first_name:req.query.first_name,
      last_name:req.query.last_name
   };
   console.log(response);
   res.end(JSON.stringify(response));
})

app.post('/yolo', function(req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

      fs.readFile(files.image.path, function(err,data) {

        var imageName = files.image.name
        if(!imageName){
            console.log("There was an error")
            res.redirect("/");
            res.end();
          } else {
            var newPath = __dirname + "/projects/darknet/uploads/" + imageName;
            // write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function (err) {
              // let's see it
                console.log('Upload image successful.');
              });
            child = exec("./darknet detect cfg/yolo.cfg yolo.weights uploads/"+imageName, {cwd:'./projects/darknet'},function(error, stdout, stderr){
               console.log('childProcess stdout:' + stdout);
		fs.readFile('./projects/darknet/predictions.png', function(err, data) {
                  if (err) throw err;
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.write('<img src="data:image/png;base64,');
                  res.write(new Buffer(data).toString('base64'));
                  res.end('" class="img-responsive" />');
               });
               
               child.on('exit', function(code){
               console.log('exit childProcess' + code);
              });
            });
          }
        });
    });
});

app.post('/bw2color', function(req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

      fs.readFile(files.image.path, function(err,data) {

        var imageName = files.image.name
        if(!imageName){
            console.log("There was an error")
            res.redirect("/");
            res.end();
          } else {
            var newPath = __dirname + "/projects/bw2color/uploads/" + imageName;
            // write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function (err) {
              // let's see it
                console.log('Upload image successful.');
              });
               child = exec("python main.py -i uploads/"+imageName, {cwd:'./projects/bw2color'},function(error, stdout, stderr){
               console.log('childProcess stdout:' + stdout);
		fs.readFile('./projects/bw2color/output.png', function(err, data) {
                  if (err) throw err;
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.write('<img src="data:image/png;base64,');
                  res.write(new Buffer(data).toString('base64'));
                  res.end('" class="img-responsive" />');
               });
               child.on('exit', function(code){
               console.log('exit childProcess' + code);
              });
            });
          }
        });
    });
});

app.post('/text2image', function(req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
      var description = fields.description
      console.log(description)
      var newPath = __dirname + "/projects/text-to-image/Data/sample_captions.txt";
      fs.writeFile(newPath,description, function(err){
          console.log('Description upload successful');
      });

     
        child = exec("python generate_thought_vectors.py && python generate_images.py", {cwd:'./projects/text-to-image'}, function(error, stdout, stderr){
        console.log('childProcess stdout:' + stdout);
	fs.readFile('./projects/text-to-image/Data/val_samples/combined_image_0.jpg', function(err, data) {
                  if (err) throw err;
                  res.writeHead(200, {'Content-Type': 'text/html'});
                  res.write('<img src="data:image/png;base64,');
                  res.write(new Buffer(data).toString('base64'));
                  res.end('" class="img-responsive" />');
               });
        child.on('exit', function(code){
        console.log('exit childProcess' + code);
        });
      });
  });
});

app.post('/neuraltalk2', function(req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {

      fs.readFile(files.image.path, function(err,data) {

        var imageName = files.image.name
        if(!imageName){
            console.log("There was an error")
            res.redirect("/");
            res.end();
          } else {
            var newPath = __dirname + "/projects/image_captioning/neuraltalk2/uploads/" + imageName;
            // write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function (err) {
              // let's see it
                console.log('Upload image successful.');
              });
               child = exec("th eval.lua -model model.t7 -image_folder uploads/ -num_images 1 && rm uploads/*", {cwd:'./projects/image_captioning/neuraltalk2'},function(error, stdout, stderr){
               console.log('childProcess stdout:' + stdout);
               res.redirect("./projects/image_captioning/neuraltalk2/vis/index.html");
               child.on('exit', function(code){
               console.log('exit childProcess' + code);
              });
            });
          }
        });
    });
});

app.post('/neural_storyteller', function(req, res) {

  var form = new formidable.IncomingForm();

  form.parse(req, function(err, fields, files) {
      fs.readFile(files.image.path, function(err,data) {
      
        var imageName = files.image.name
        if(!imageName){
            console.log("There was an error")
            res.redirect("/");
            res.end();
          } else {
            var newPath = __dirname + "/projects/neural_storyteller/neural-storyteller/uploads/" + imageName;
            // write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function (err) {
              // let's see it
		    console.log('Upload image successful.');
              });
               child = exec("python main.py -i "+imageName+" -> output.txt", {cwd:'./projects/neural_storyteller/neural-storyteller'},function(error, stdout, stderr){
               console.log('childProcess stdout:' + stdout);
               res.redirect("./projects/neural_storyteller/neural-storyteller/output.txt");
               child.on('exit', function(code){
               console.log('exit childProcess' + code);
              });
            });
          }
        });
    });
});

var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)

})
