var express = require("express")
var formidable = require("formidable")
var path = require('path');
var fs = require('fs');
var app = express();
var spawn = require('child_process').spawn;
var yt2mp3 = require('youtube-to-mp3');
var ytmp3 = new yt2mp3();
var audio_proc = null;
var led = require('./led')
var clock = require('./clock')


var songs = [];
var songsFolder = path.join(__dirname, 'cargo');
console.log(ytmp3);

fs.readdir(songsFolder, function(err, files){
  if(err) return;
  files.forEach(
     function(file){ songs.push(file) });
});

app.use(express.static('public'));

app.get('/songs', function(req, res){
  res.send(JSON.stringify(songs));
});

function play(songname){
  var songpath = path.join(songsFolder, songname);
  stop();
  audio_proc = spawn('omxplayer', [songpath, '--loop', '-o', 'local', '--no-osd']);
  clock.pause();
  songname = songname.slice(0, -4);
  songname = songname.toUpperCase();
  if(songname.length > 15)
    songname = songname.substring(0, 12) + '...'
  led.showMessage('NOW PLAYING - ' + songname).then(clock.start);
}
function stop(){
  if(audio_proc != null){
    console.log('stop');
    audio_proc.stdin.write('q');
    audio_proc.kill();
    audio_proc = null;
  }
}

app.post('/stop', function(req, res){
  stop();
  res.send('ok');
});
app.post('/play', function(req, res){
  console.log('[1/2] play');
  var form = formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    console.log('[2/2] playing song ' + fields.song);
    play(fields.song);
    res.send('playing ' + fields.song);
  });
});

var finished = function(){};
ytmp3.on('finished', function(){
  console.log('finished...');
  finished();
});
ytmp3.on('download', function(title){
  songs.push(title)
});

app.post('/yt', function(req, res){
  var form = formidable.IncomingForm();
  form.parse(req, function(err, fields, files){
    console.log('dowloading ' + fields.ytid);
    ytmp3.videoDownload(fields.ytid, songsFolder+'/');
    finished = function(){ res.send('ok'); }
  });
});

app.post('/upload', function(req, res){
  console.log('[1/3] uploading file...');
  var form = formidable.IncomingForm();
  form.parse(req);
  /*req.on('data', function(chunk){
    console.log('' + chunk);
  });*/
  form.on('fileBegin', function(name, file){
    console.log('[2/3] receiving file ' + file.name);
    file.path = path.join(songsFolder, file.name);
    songs.push(file.name);
  });
  form.on('file', function(name, file){
    console.log('[3/3] uploaded  ' + name + '/' + file.name);
    res.send('ok');
  });
});

app.post('/message', function(req, res){
  formidable.IncomingForm().parse(req, function(err, fields, files){
    if(fields.message){
      clock.pause();
      led.showMessage(fields.message, fields.direction).then(clock.start);
    }
  });
  res.send('ok');
})

clock.start();

app.listen(8090, function(){
  console.log("Listening on port 8090");
});
