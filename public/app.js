
const socketIO= io();
document.addEventListener('DOMContentLoaded', () =>{ 
    const myForm= document.getElementById('myForm');
    let roomy;
    //const mapOfWords= new Board();
    function sendForm(){
            myForm.addEventListener('submit',async (e)=>{
                e.preventDefault();
                const formData= new FormData(myForm);
                const post= new PostForm(formData);
                roomy=await post.submitForm;
                console.log(roomy);
                window.location.href = "/"+roomy.roomname;
            });
    } 

    async function createBoard(room, words,newbtn,turn){
        const newgame= new CNGame(room,words,newbtn,turn,socketIO);
        newgame.createGame;
    }


    

    async function setup(){
        console.log(window.location.href); 
        if (window.location.href==="http://localhost:5000/"){
            sendForm();
        }else{
                console.log("window.location.pathname");
                //get the name of the room from URL
                let location=window.location.pathname.substring(1); 
                console.log("location "+location);
                const postRoom= new GetRoom(location);
                
                if(location){
                    //remove Form from 
                    myForm.remove();
                    socketIO.emit("roomConnection",location);
                    //retrive words from room
                    let words= await postRoom.wordsFromRoom;
                    let turn= await postRoom.turn;
                    console.log("First turn of "+ turn);


                    //New Game button
                    let newbtn= document.createElement('button');
                    newbtn.setAttribute('type','button');
                    newbtn.textContent="Start New Game";
                    newbtn.addEventListener('click', async()=>{
                        //console.log('New Game from app!')
                        let putWords= new PutNewGame(location);
                        words=await putWords.wordsFromRoom;
                        socketIO.emit("startnewgame",location);
                    });

                    socketIO.on("newgamestarted",(data)=>{
                        //console.log("starting new game in room "+data);
                        window.location.href = "/"+data;
                    });

                createBoard(location,words,newbtn,turn);
                

            }else{
                sendForm();
            }
            
            
        }
    }
    

    setup();
    
})

