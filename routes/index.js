const child_process = require('child_process');
var express = require('express');
var router = express.Router();
var connection  = require('../lib/db');
var mqtt = require('mqtt')
const fs = require('fs');

var client = mqtt.connect('mqtt://localhost');
client.on('connect', function () {
    console.log('Connected via MQTT')
    client.subscribe(['starter','terminator'],{ rh:true});
})

client.on('message', function (topic, message) {
        console.log(`${topic.toString()}: ${message.toString()}`)
        //{"id_user":"1","id_type":"1","script":"login-register.spec.js"}
        
        let data = JSON.parse(message.toString());
        
        if(topic.toString()==="starter"){
            // Type 1=E2E Cypress
            if(data.id_type==1) {
                let file_not_ext = data.script.split(".")[0];
                

                if(data.action==="prepare") {
                    console.log(`Uploading file for Cypress Test: ${file_not_ext}`);
                }

                if(data.action==="test") {
                    connection.query(`INSERT INTO test_executed 
                        (id_type, started, id_user, script) 
                        values 
                        (${data.id_type},NOW(), ${data.id_user}, "${data.script}")`,function(err,rows) {
                        if(err){
                            console.log(`Error: ${err} `)
                        }else{
                            child_process.exec(`ECHO "Execution of ${data.script} in progress..." > result.log`).toString('utf8');
                            child_process.exec(`rm ./cypress/videos/${data.script}.spec.js.mp4`).toString('utf8');

                            //child_process.exec(`npx cypress run --quiet --headless --spec "cypress/integration/${currentTest}.spec.js" >> result_${currentTest}.log`).toString('utf8');
                            const ls=child_process.spawn('npx', ['cypress','run','--quiet', '--headless', '--spec',`./cypress/integration/${data.script}.spec.js`]);
                            
                            ls.stdout.on("data", datax => {
                                console.log(`stdout: ${datax}`);
                            });

                            ls.stdout.on("close", (datax)=>{
                                console.log("Finish")
                                client.publish('terminator', `{"script":"${data.script}"}`);
                                let queryInsertTerminator=`UPDATE test_executed SET finished=NOW() WHERE id_execution=${rows.insertId}`
                                console.log(queryInsertTerminator);
                                connection.query(`${queryInsertTerminator}`,function(err,rows) {
                                        if(err){
                                            console.log(`Error: ${err} `)
                                        }
                                })
                            })
                        }
                    });
                }

            // End Type=1
            }

            if(data.id_type==2) {
                let file_not_ext = data.script.split(".")[0];

                if(data.action==="prepare") {
                    console.log(`Replicating for BackstopJS ${file_not_ext}`);
                    const ls=child_process.spawn('./backstop-solution/replicate.sh', [`${file_not_ext}`]);
                    ls.stdout.on("data", datax => {
                        console.log(`${datax}`);
                    });

                    ls.stdout.on("close", (datax)=>{
                        console.log("Replication Finished")
                    });
                    
                }
                if(data.action==="reference") {
                    connection.query(`INSERT INTO test_executed 
                        (id_type, started, id_user, script) 
                        values 
                        (${data.id_type},NOW(), ${data.id_user}, "${data.script}")`,function(err,rows) {
                        if(err){
                            console.log(`Error: ${err} `)
                        }else{
                            console.log("Ejecutando comando reference")
                            console.log(`./backstop-solution/backstop.sh test ${file_not_ext}`);
                            const ls=child_process.spawn('./backstop-solution/backstop.sh', ['reference',`${file_not_ext}`]);
                            ls.stdout.on("data", datax => {
                                console.log(`stdout: ${datax}`);
                            });
                            ls.stdout.on("close", (datax)=>{
                                console.log("Finish Backstop reference")
                            });
                        }
                    });
                }
                if(data.action==="test") {
                    console.log("Taking Snapshot and check if matching")
                    connection.query(`UPDATE test_executed SET finished=NOW() WHERE id_execution=36`,function(err,rows) {
                        if(err){
                            console.log(`Error: ${err} `)
                        }else{
                            console.log("Ejecutando comando test")
                            console.log(`./backstop-solution/backstop.sh test ${file_not_ext}`);
                            const ls=child_process.spawn('./backstop-solution/backstop.sh', ['test',`${file_not_ext}`]);
                            ls.stdout.on("data", datax => {
                                console.log(`stdout: ${datax}`);
                            });
                            ls.stdout.on("close", (datax)=>{
                                console.log("Finish Backstop test")
                            });
                        }
                    });
                }
            }

            if(data.id_type==3) {
                console.log(`Mutation Testing ${data.script}`)
                // Store data about execution
                connection.query(`INSERT INTO test_executed 
                        (id_type, started, id_user, script) 
                        values 
                        (${data.id_type},NOW(), ${data.id_user}, "${data.script}")`,function(err,rows) {
                    if(err){
                        console.log(`Error: ${err} `)
                    }else{
                        fs.readFile(`./MutAPK/parameters-template.json`, 'utf8', function (err,datafile) {
                            if (err) {
                              return console.log(err);
                            }
                            // Cloning & Replacing the parameters-template
                            var result = datafile.replace(/#amountMutants/g, `${data.amountMutants}`);
                            result = result.replace(/#apkPath/g, `${data.script}.apk`);
                            result = result.replace(/#appName/g, `${data.appName}`);
                          
                            fs.writeFile(`./MutAPK/parameters-${data.script}.json`, result, 'utf8', function (err) {
                               if (err) return console.log(err);
                               console.log(`Parameters file created: parameters.${data.script}`)
                            
                               // Executing MutAPK
                               const ls=child_process.spawn('./MutAPK/run.sh', [`parameters-${data.script}.json`,`${data.appName}`]);
                               console.log(`Wait, We're running MutAPK`); 
                               ls.stdout.on("data", datax => {
                                   // console.log(`${datax}`);
                                });
        
                                ls.stdout.on("close", (datax)=>{
                                  console.log("Execution Finished")
                                });
                            });
                        }); 
                    }
                }); 
            }
            
        }
})

router.get('/', (req, res) => {
    res.send("I'm a worker over a testing engine not a monkey =D")
});

module.exports = router;