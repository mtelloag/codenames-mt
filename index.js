const Joi= require('joi');
const express= require('express');
const app= express();
const http= require('http').createServer(app);
const path= require('path');
const socket= require('socket.io');
const rooms=[];
const myObj= require('./public/objects.js');
const { on } = require('process');
let connnection_counter=0;
let playerTurn= null;


//PORT Enviroment Variable. Used because the port 3000 can be busy sometimes 
const port= process.env.PORT || 3000;
const server= http.listen(port,()=>{
    console.log(`Listening in Port ${port}...`);
});


//starting the socket
const io= socket(server);

//new connection
function connectionManager(){
    io.on('connection',(socket)=>{
        console.log('a user connected with id '+ socket.id);
        connnection_counter+=1;
        // Detect the new room
        socket.on('flipCard', (data)=>{
            console.log("message from the server");
            console.log("the room "+ data.roomname);
            console.log("fliped the card : "+ data.card);
            console.log("Player color  : "+ data.role);
            let index= rooms.findIndex(e=> e.roomname===data.roomname);
            let keysValues= Object.values(rooms[index].game.sockets);
            keysValues.forEach(players=>{
                players.emit("cardFlipped", data.card);
            })
        });
        socket.on("startnewgame",(data)=>{
            /* console.log("start new game ");
            let index= rooms.findIndex(e=> e.roomname===data);
            let keysValues= Object.values(rooms[index].game.sockets);
            keysValues.forEach(players=>{
                players.emit("newgamestarted", data);
            })  */
            emitToPlayers("newgamestarted",data);
        })
        
        socket.on("spyMasterSelected",(data)=>{
            emitToPlayers("spyMasterSelected",data);
        })

        socket.on("spyMaster2Selected",(data)=>{
            //window.location.href = "/"+location;
            /* console.log("Spymaster Selected");
            let index= rooms.findIndex(e=> e.roomname===data);
            let keysValues= Object.values(rooms[index].game.sockets);
            keysValues.forEach(players=>{
                players.emit("spyMaster2Selected",data);
            }) */ 
            emitToPlayers("spyMaster2Selected",data);
        })

        socket.on("roomConnection",(data) =>{
            console.log("New connection in Room : "+ data);
            let index= rooms.findIndex(e=> e.roomname===data);
            rooms[index].game.sockets[socket.id]=socket;
            console.log("connection "+connnection_counter);
            socket.on('disconnect',()=>{
                connnection_counter-=1;
                delete rooms[index].game.sockets[socket.id];
                console.log("room after disconection ");
                console.log(rooms);
                console.log(Object.keys(rooms[index].game.sockets));
                console.log('user disconeccted from room with id ' + socket.id);
                console.log("connection "+connnection_counter);
            });
        })

        socket.on("nextTurn",(data)=>{
            if(data.turn==="red"){
                console.log("Actual turn "+ data.turn);
                data.turn="blue";
                console.log("Next turn "+ data.turn);
                emitToPlayers("nextTurn",data);
            }else{
                console.log("Actual turn "+ data.turn);
                data.turn="red";
                console.log("Next turn "+ data.turn);
                emitToPlayers("nextTurn",data);
            }
        })
        socket.on('disconnect',()=>{
            connnection_counter-=1;
            console.log('user disconeccted with id ' + socket.id);
            console.log("connection "+connnection_counter);
        });
    })
}

connectionManager();


app.use('/static',express.static('public'));
app.use(express.json());

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'/public/index.html'));
})

app.get('/:id',(req,res)=>{
    
    //Look up the course
    let rms= rooms.filter(Boolean);
    //rooms= rms;
    let room= rms.find((e)=>e.roomname===req.params.id);
    if(!room){
        res.status(404).send("The room "+ req.params.id + " was not found");
        return;
    }
    //Return room webpage
    res.sendFile(path.join(__dirname,'/public/index.html'));  
})

app.get('/api/game/:id',(req,res)=>{
    //Look up the course
    let rms= rooms.filter(Boolean);
    let room= rms.find((e)=>e.roomname===req.params.id);
    if(!room){
        res.status(404).send("The room "+ req.params.id + " was not found");
        return;
    } 
    
    res.send({board:room.game.board, turn:room.game.turn});
});

app.get('/api/post/:year/:month',(req,res)=>{
    res.send(req.params)
});

app.post('/',(req,res)=>{

    //Difine schema v17 of joi, different from the video
    let result=validateCourse(req.body)
    if(result.error){
        //400 Bad Request
        res.status(404).send(result.error.details[0]);
        return ;
    }
    
    //validate that the room does not exist already
    let rms= rooms.filter(Boolean);
    let rm= rms.find((e)=>e.roomname===req.body.roomname);
    //console.log(rm);
    if(rm){
        res.status(404).send({
            id:'error',
            message:"The room "+ req.body.roomname + " already exist. Try with a diferent name"
        });
        return;
        
    } else{
        let room={
            //body is case sensitive, check html names or ids before sending 
            roomname:req.body.roomname,
            game:req.body.game
        };
        
        rooms.push(room);
        console.log('SERVER: New rooms available');
        console.log(rooms)
        res.send(room);
    }
});

app.put('/:id',(req,res)=>{   
    console.log(req.body.board);  
    //validate that the room exist
    let rms= rooms.filter(Boolean);
    let rm= rms.find((e)=>e.roomname===req.params.id);
    //console.log(rm);
    if(!rm){
        res.status(404).send({
            id:'error',
            message:"The room "+ req.params.id + " does not exist"
        });
        return;
        
    } else{
        let index= rooms.findIndex(e=> e.roomname===req.params.id);
            /* console.log("room index "+ index);
            console.log("room before "); 
             console.log(rooms); */
        console.log("the new words are : ");
        console.log(req.body.board);  
        rooms[index].game.board=req.body.board;
        res.send(rooms[index].game.board);
    }
    
});

app.delete('/api/courses/:id', (req,res)=>{
    //Look up the course
    //Not existing, return 404 

    //const result=validateCourse(req.body);
    let course= courses.find(c=> c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send("The course was not found");
    
    //Delete
    let index=courses.indexOf(course);
    courses.splice(index,1);

    //Return the same course
    res.send(course);
})

function validateCourse(course){
    //Difine schema v17 of joi, different from the video
    let schema=Joi.object({
        // the variable "roomname" must have the same name as the input in the html file.
        roomname:Joi.string().min(3).required(),
        game:Joi.object()
    });

    return schema.validate(course);
}

function emitToPlayers(message,data){
    if(data.roomname){
        let index= rooms.findIndex(e=> e.roomname===data.roomname);
    let keysValues= Object.values(rooms[index].game.sockets);
    keysValues.forEach(players=>{
        players.emit(message,data);
    }) 
    }else{
        let index= rooms.findIndex(e=> e.roomname===data);
        let keysValues= Object.values(rooms[index].game.sockets);
        keysValues.forEach(players=>{
        players.emit(message,data);
    }) 
    }
    
};