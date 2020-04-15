$(function(){
    var socket = io.connect('http://185.107.15.247:8080');
    
    socket.on('connect', function(){
      var delivery = new Delivery(socket);
  
      delivery.on('delivery.connect',function(delivery){
        $("input[type=submit]").click(function(evt){
          var file = $("input[type=file]")[0].files[0];

      //Her hentes dataen fra elementerne i titel, feature og description felterne på mainpage siden via document.getElementById metoden
              var dataTitle = document.getElementById('titel');
              var dataFeature = document.getElementById('features');
              var dataDescription = document.getElementById('description');

      //laver en datapakke, der indeholder værdierne fra inputfelterne
                fileData = {
                  title: dataTitle.value,
                  feature: dataFeature.value,
                  description: dataDescription.value
                }
      //Sender datapakken med navnet "fileData" til serveren
                socket.emit("fileData", fileData);

                //Kalder delivery funktionen til den valgte fil
          delivery.send(file);
          evt.preventDefault();
        });
      });
  
      delivery.on('send.success',function(fileUID){
        console.log("file was successfully sent.");
      });
    });
  });