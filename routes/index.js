const child_process = require('child_process');
var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var mqtt = require('mqtt')

var client = mqtt.connect('mqtt://localhost');
client.on('connect', function () {
    console.log('Connected via MQTT')
    client.subscribe(['starter','terminator']);
})

client.on('message', function (topic, message) {
        console.log(`${topic.toString()}: ${message.toString()}`)
        //{"id_user":"1","id_type":"1","script":"login-register.spec.js"}
        
        let data = JSON.parse(message.toString());
        
        if(topic.toString()==="starter"){
            connection.query(`INSERT INTO test_executed 
                        (id_type, started, id_user, script) 
                        values 
                        (${data.id_type},NOW(), ${data.id_user}, "${data.script}")`,function(err,rows) {
                if(err){
                 
                 console.log(`Error: ${err} `)
                }else{
                    console.log(rows);
                }
            });
        }
})

router.get('/', (req, res) => {
    res.send("I'm Worker over a testing engine not a monkey =D")
});

module.exports = router;