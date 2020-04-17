var express = require('express');
var app = express();
var server = app.listen(8080);

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', newConnection);
io.sockets.on('close', newDisconnect);

var fs = require('fs');
var database = JSON.parse(fs.readFileSync('database.json', 'utf8'));

dl = require('delivery');

function newConnection(socket) {
  console.log(socket.id + "Har lige Connected");

  // login a brugere
  socket.on("login", (data) => {
    console.log(data);
    let login = false;
    for (let i = 0; i < database.profiles.length; i++) {
      if (database.profiles[i].username == data.username) {
        if (database.profiles[i].password == data.password) {
          login = true;
          break;
        }
      }
    }
      console.log(login);
      if (login) {
        console.log(data.username + " har lige logget på");
        socket.emit("accept");
      } else {
        socket.emit("fail");
      }
    
  });
  
  // registering af brugere
  socket.on("register", (data) => {
    let ingenproblemer = true;
    for (let i = 0; i < database.profiles.length - 1; i++) {
      if (database.profiles[i].username == data.username) {
        ingenproblemer = false;
      }
      if (database.profiles[i].email == data.email) {
        ingenproblemer = false;
      }
    }

    if (ingenproblemer) {
      database.profiles[database.profiles.length] = {
        username: data.username,
        email: data.email,
        password: data.password,
        købteprogrammer: []
      }
      socket.emit("regiSuccess");
      fs.writeFileSync("database.json", JSON.stringify(database));

    } else {
      socket.emit("regiFail");
    }
  });

  // gør socket klar til at modtage og sende filer
  var delivery = dl.listen(socket);

  delivery.on('delivery.connect', function (delivery) {
    socket.on("fileData", (data) => {
      database.annocer[database.annocer.length] = {
        titel: data.title,
        deskription: data.description,
        features: data.feature,
        filnavn: ""
      }
    })
    delivery.on('receive.start', function (filePackage) {
      console.log(filePackage.name);
    });
    delivery.on('receive.success', function (file) {
      //checker om navnet på fil er et navn vi allerede har
        for (let i = 0; i < database.annocer.length; i++) {
          if (database.annocer[i].filnavn == file.name) {
          file.name += database.annocer.length;
          }
      }
      //prøver at gemme filen hvis succefuld så gemmer den navnet og derfor placering med også
      fs.writeFile("./filer/" + file.name, file.buffer, function (err) {
        if (err) {
          console.log('Fil kunne ikke gemmes ' + err);
        } else {
          console.log('Fil gemt');
          database.annocer[database.annocer.length-1].filnavn = file.name;
          fs.writeFileSync("database.json", JSON.stringify(database));
          socket.emit("UploadCompleted");
        };
      });
    });
  });

}

function newDisconnect(socket) {
  console.log(socket.id + "Har lige disconnected");
}