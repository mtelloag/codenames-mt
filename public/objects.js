class PutNewGame{
    #newWords
    constructor(room){
        this.room= room;
        
    }

    get wordsFromRoom(){
        
        let req = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            // the information to be post
            body: this.creategameObject()
        };

        let f= this.myfetch(req)
        .then(result=>{
            //console.log(result);
            this.#newWords= result;
           
            return this.#newWords;
        })
        .catch(error =>{
            alert(error);
        }); 
        return f;
     }
 
     async myfetch(req){
         let response= await fetch('/'+this.room,req);
         let result = await response.json();
         if (result.message){
             throw result.message;
         }
         else{
             return result;
         }
     }

     createBoardWords(){
        const boardWords= new Board();
        return boardWords.createMap;
    }

    creategameObject(){
        let go={
            board: this.createBoardWords()
        }

        return JSON.stringify(go);
    }

}

class GetRoom{
    constructor(room){
        this.room=room;
        this.turn={};

    }

    get wordsFromRoom(){
       let ftc=this.myfetch('/api/game/'+this.room) 
                .then(result=>{
                    this.turn= result.turn;
                    return result.board;
                })
                .catch(error =>{
                    alert(error);
                });
        //console.log(ftc);
        return ftc;
    }

    async myfetch(req){
        let response= await fetch(req);
        let result = await response.json();
        if (result.message){
            throw result.message;
        }
        else{
            return result;
        }
    }

}
class PostForm {
    #obj
    #res
    
    constructor(formData) {
        this.formData= formData;
    }

    set form2JSON(obj){
        for(let key of this.formData.keys()){
            obj[key]=this.formData.get(key);
        }
        this.#obj=obj.roomname;
    }

    get form2JSON(){
        return this.#obj; //this.JSONObj;
    }

    

    set gameRoom(objroom){
        this.#res=objroom;// JSON.stringify(objroom);
    }


    get submitForm(){
        //to set JSONObj use "=" sign 
        this.form2JSON={};
        let req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // the information to be post
            body: this.creategameObject()//this.#obj
        };

        let f= this.myfetch(req)
        .then(result=>{
            //console.log(result);
            this.gameRoom= result;
            
            return this.#res;
        })
        .catch(error =>{
            alert(error);
        }); 
        return f;
        
    }

    async myfetch(req){
        let response= await fetch('/',req);
        let result = await response.json();
        if (result.message){
            throw result.message;
        }
        else{
            return {
                roomname:result.roomname,
                game: result.game
            }

        }
    }

    createBoardWords(){
        const boardWords= new Board();
        return boardWords.createMap;//JSON.stringify(boardWords.createMap);
    }

    creategameObject(){
        let go={
            roomname:this.#obj,
            game:{
                board: this.createBoardWords(),
                sockets:{},
                turn:this.turnGenerator()
            }
        }
        return JSON.stringify(go);
    }

    turnGenerator(){
        if(Math.random()<0.5){
            return 'red'
        }else{
            return 'blue'
        }
    }
}

class Board {
    #mapWordsColors;
    constructor(){
        this.#mapWordsColors=[];  
    }


    get createMap(){
        
        // sort of words array randomly to take the first 16 words of the array
        wordsArray.sort(()=>0.5-Math.random())

        // the board has a maximum of 16 cards
        // Assign every card a property: red, blue , black or bomb
        for(let i=0; i<16; i++){
            //set the first word as a bomb; first element of the colorsArray
            if(i===0){
                 this.#mapWordsColors.push(
                    {
                        word:wordsArray[i],
                        color:colorsArray[0]
                    }
                 )                   
            } 
            ////set the next 4 words as blue; second element of the colorsArray
            if (i>0 && i<= 4){
                this.#mapWordsColors.push(
                    {
                        word:wordsArray[i],
                        color:colorsArray[1]
                    }
                 )                
               // console.log(mapWordsColors[i].color); 
            }
            ////set the next 4 words as red; third element of the colorsArray
            if (i>4 && i<=8){
                this.#mapWordsColors.push(
                    {
                        word:wordsArray[i],
                        color:colorsArray[2]
                    }
                 )                
                //console.log(mapWordsColors[i].color); 
            }
            ////set the next 4 words as black; fourth element of the colorsArray
            if (i>8 && i<=16){
                this.#mapWordsColors.push(
                    {
                        word:wordsArray[i],
                        color:colorsArray[3]
                    }
                 )                
            }
        }  
    
        //shaffle the words in the array randomly 
        this.#mapWordsColors.sort(()=>0.5-Math.random());
        
        /* for(var i in this.#mapWordsColors){
            console.log(this.#mapWordsColors[i]);
        } */
        return this.#mapWordsColors;
    }

}

class CNGame {
    #redCards;
    #blueCards;
    #resultDisplay;
    #resultDisplay1;
    #cardsChosen;
    #cboxSpy;
    #cboxSpy2;
    #allCards;
    #cboxRed;
    #cboxBlue;
    constructor(room, gameWords,sngBtn,turn,socket){
        this.wordAndcolor=gameWords;
        this.staticroom=room;
        this.socketIO=socket;
        this.gameIsOver=false; 
        this.bombFound=false;
        this.#blueCards= 4;
        this.#redCards= 4;
        this.blueCards= 4;
        this.redCards= 4;
        this.#cardsChosen=[];
        this.#allCards=[];
        this.newGameBtn=sngBtn;
        this.#cboxSpy={};
        this.#cboxSpy2={};
        this.#cboxRed={};
        this.#cboxBlue={};
        this.playerRole=null;
        this.playerTurn=turn;
        this.createGrid();
    }
    static nr;

    set staticroom(room){
       CNGame.nr=room;
    }

    get createGame(){
        this.#resultDisplay= document.querySelector('#redscore');
        this.#resultDisplay1= document.querySelector('#bluescore');
        // Setting the number of blue and red cards reminding 
        this.#resultDisplay.textContent= ": "+this.#redCards;
        this.#resultDisplay1.textContent= ": "+this.#blueCards;
        let grid=document.querySelector('.game-grid')
        if(grid.hasChildNodes()){
            //console.log("grid has children");
            for(let i=0; i<16; i++){    
                document.getElementById("span"+i).textContent=this.wordAndcolor[i].word;
            }
        }else{
            for(let i=0; i<16; i++){
                let card = document.createElement('div')
                    card.setAttribute('id', i)
                    card.setAttribute('class', 'grid-item')
                    grid.appendChild(card);
                //attach word to every card
                let span = document.createElement('span')
                let spanid= 'span'+i
                span.setAttribute('id', spanid)
                span.setAttribute('class','span-item');
                
                document.getElementById(spanid)
                document.getElementById(i).appendChild(span)
                document.getElementById("span"+i).textContent=this.wordAndcolor[i].word;
            }
        }

        this.#cboxSpy.addEventListener('click',()=>{
            if(this.#cboxSpy.checked){
                this.#cboxSpy.disabled=true;
                this.#cboxSpy2.disabled=true;
                this.#cboxBlue.disabled=true;
                this.#cboxRed.disabled=true;
                
                for(let i=0; i<this.#allCards.length; i++){
                    this.#allCards[i].removeEventListener('click',listener);
                    this.showColorSpy(this.#allCards[i]);
                }
                alert(this.playerTurn+" team starts.");
                socketIO.emit("spyMasterSelected",CNGame.nr);
            }
        })

        this.#cboxSpy2.addEventListener('click',()=>{
            if(this.#cboxSpy2.checked){
                this.#cboxSpy.disabled=true;
                this.#cboxSpy2.disabled=true;
                this.#cboxBlue.disabled=true;
                this.#cboxRed.disabled=true;
                
                for(let i=0; i<this.#allCards.length; i++){
                    this.#allCards[i].removeEventListener('click',listener);
                    this.showColorSpy(this.#allCards[i]); 
                }
                alert(this.playerTurn+" team starts.");
                socketIO.emit("spyMaster2Selected",CNGame.nr); 
            }
            
        })

        this.#cboxRed.addEventListener('click', ()=>{
            
            if(this.playerRole===null){
                this.#cboxSpy.disabled=true;
                this.#cboxSpy2.disabled=true;
                this.#cboxBlue.disabled=true;
                this.#cboxRed.disabled=true;
                this.playerRole='red';
                console.log('role is '+this.playerRole);
                alert(this.playerTurn+" team starts.");
            }else{
                alert('Your role was already selected. You are in the team '+ this.playerRole);
            }
            
        })

        this.#cboxBlue.addEventListener('click', ()=>{
            if(this.playerRole===null){
                this.#cboxSpy.disabled=true;
                this.#cboxSpy2.disabled=true;
                this.#cboxBlue.disabled=true;
                this.#cboxRed.disabled=true;
                this.playerRole='blue';
                console.log('role is '+this.playerRole);
                alert(this.playerTurn+" team starts.");
            }else{
                alert('Your role was already selected. You are in the team '+ this.playerRole);
            }
            
        })

        this.#allCards = document.querySelectorAll(".grid-item");
        const listener= (event)=>{
            if(event.path[1].attributes.hasOwnProperty('id')){
                //console.log(event.path[1].attributes.id);
                let id=event.path[1].attributes.id.value;
                if(this.playerRole===null){
                    alert("choose a Team or Spymaster role")
                }else{
                    
                    if(this.playerRole!==this.playerTurn){
                        alert(this.playerTurn+ "'s turn. You belong to the "+ this.playerRole+ " team.")
                    }else{

                        let cardColor=this.showColor(this.#allCards[id]);
                        
                        socketIO.emit("flipCard",{
                            roomname:CNGame.nr,
                            card:this.#allCards[id].getAttribute('id'),
                            role:this.playerRole
                        });
                        if(cardColor!==this.playerRole){
                            //console.log("Card Color is different to the player ");
                            socketIO.emit("nextTurn", {roomname:CNGame.nr,turn:this.playerRole});
                        }

                        
                    }
                   
                }
            }else{
                return;
            } 
        };

        for(let i=0; i<this.#allCards.length; i++){
            this.#allCards[i].addEventListener('click',listener,false)
            
        }

        socketIO.on("cardFlipped", (data)=>{
            console.log("message from client, the card flipped is : " + this.#allCards[data].getAttribute('id'));
            this.showColor(this.#allCards[data]);
            this.#allCards[data].removeEventListener('click',listener);
        });

        socketIO.on("spyMasterSelected", (data)=>{
            console.log("spymaster Red selected" );
            this.#cboxSpy.disabled=data;
            
        });

        socketIO.on("spyMaster2Selected", (data)=>{
            console.log("spymaster Blue selected" );
            
            this.#cboxSpy2.disabled=data;
            
        });

        socketIO.on("nextTurn", (data)=>{
            if(data.turn!=='bomb'){
                this.playerTurn= data.turn;
                alert(data.turn + "'s turn!")
            }
            
        })

    }

    

    showColor(card){
        if(this.bombFound===true || this.gameIsOver===true ){
            this.gameOver();
        }
        else{
            
            let cardId= card.getAttribute('id');
            let color = this.wordAndcolor[cardId].color;

            if(color==='red'){
                card.setAttribute('class','grid-item-red')
                this.checkForMatch(cardId,color)
            }
            if(color === 'blue'){
                card.setAttribute('class','grid-item-blue')
                this.checkForMatch(cardId,color)
            }
            if(color === 'black'){
                card.setAttribute('class','grid-item-black')
            }
            if(color =='bomb'){
                card.setAttribute('class','grid-item-bomb')
                this.checkForMatch(cardId,color)
            }

            return color;
        }  

        
    }

    showColorSpy(card){
        if(this.bombFound===true || this.gameIsOver===true ){
            this.gameOver();
        }
        else{
            
            let cardId= card.getAttribute('id');
            let color = this.wordAndcolor[cardId].color;

            if(color==='red'){
                card.setAttribute('class','grid-item-red-spymaster')
            }
            if(color === 'blue'){
                card.setAttribute('class','grid-item-blue-spymaster')
            }
            if(color === 'black'){
                card.setAttribute('class','grid-item-black')
            }
            if(color =='bomb'){
                card.setAttribute('class','grid-item-bomb')
            }
        }  

        
    }



    //Check for matches
    checkForMatch(cardId,color){
    
    if(color==='bomb'){
        this.bombFound=true
        setTimeout(()=>{this.gameOver(color)},200)       
    }
    else{
        if(!(this.#cardsChosen.indexOf(cardId)>-1)){
            this.#cardsChosen.push(cardId)
            if(color==='red'){
                this.#redCards-=1
                this.#resultDisplay.textContent=": "+this.#redCards
            }else{
                this.#blueCards-=1
                this.#resultDisplay1.textContent=": "+this.#blueCards
            }

            if(this.#redCards===0|| this.#blueCards===0){
                setTimeout(()=>this.gameOver(color),200)
            };
        }
    }
    
}

    gameOver(card){
        this.gameIsOver=true
        if(card==='red'){
            
            alert("Game Over. "+ card + " wins!!")
    
        }
        if(card==='blue'){
            
            alert("Game Over. "+ card + " wins!!")
        }
        if(card==='bomb'){
            
            alert("Game Over. "+ card + " found."+this.playerTurn+ " winns")
            
        }
    }

    
    createGrid(){

        let appli=document.querySelector('.application');
        let flag= document.querySelector('#score');
        if(!flag){
             //Score Divition
            let newScorediv= document.createElement('div')
            newScorediv.setAttribute('id','score')
            

            //grid division
            
            let newGrid= document.createElement('div');
            newGrid.setAttribute('class','game-grid');
            
            // New Game Button Division
            let ngbtnDiv= document.createElement('div');
            ngbtnDiv.setAttribute('class','newgamebtn');
            ngbtnDiv.appendChild(this.newGameBtn);

            // Checkbox Spymaster
            this.#cboxSpy= document.createElement("INPUT");
            this.#cboxSpy.setAttribute("id","spycheck")
            this.#cboxSpy.setAttribute("class","spy")
            this.#cboxSpy.setAttribute("type", "checkbox");
            
            this.#cboxSpy2= document.createElement("INPUT");
            this.#cboxSpy2.setAttribute("id","spycheck2")
            this.#cboxSpy2.setAttribute("class","spy")
            this.#cboxSpy2.setAttribute("type", "checkbox");
            
            let checkSpy= document.createElement('h4');
            checkSpy.textContent= "I'm Spymaster red: ";
            let checkSpy2= document.createElement('h4');
            checkSpy2.textContent= "I'm Spymaster blue: ";
            checkSpy.appendChild(this.#cboxSpy);
            checkSpy2.appendChild(this.#cboxSpy2);

            // Checkbox Players
            this.#cboxRed= document.createElement("INPUT");
            this.#cboxRed.setAttribute("id","redplayercheck")
            this.#cboxRed.setAttribute("class","player")
            this.#cboxRed.setAttribute("type", "checkbox");
            
            this.#cboxBlue= document.createElement("INPUT");
            this.#cboxBlue.setAttribute("id","blueplayercheck")
            this.#cboxBlue.setAttribute("class","player")
            this.#cboxBlue.setAttribute("type", "checkbox");


            let checkRed= document.createElement('h4');
            checkRed.textContent= "I'm red player: ";
            let checkBlue= document.createElement('h4');
            checkBlue.textContent= "I'm blue player: ";
            checkRed.appendChild(this.#cboxRed);
            checkBlue.appendChild(this.#cboxBlue);
            
            ngbtnDiv.appendChild(checkRed);
            ngbtnDiv.appendChild(checkBlue);
            ngbtnDiv.appendChild(checkSpy);
            ngbtnDiv.appendChild(checkSpy2);
            
            // Next turn button
            //Create Elemments 
            this.createScore(newScorediv,"red");
            this.createScore(newScorediv,'blue');
            
            //append elements
            appli.appendChild(newScorediv);
            appli.appendChild(newGrid);
            appli.appendChild(ngbtnDiv);
        }
        
    }
    
    createScore(element, colorScore){
        let score= document.createElement('h3');
        let scorenumber= document.createElement('span');
        scorenumber.setAttribute('id',colorScore+"score")
        scorenumber.setAttribute('style', "color:black;")
        score.setAttribute('style',"color:"+colorScore+";")
        score.textContent=colorScore;
        score.appendChild(scorenumber)
        element.appendChild(score)
     }

    turnAdmin(playerColor, cardColor){
        if(playerColor===cardColor){
            console.log(true);
        }else if (playerColor!== cardColor){
            console.log(false);
        }
    }

    /* createNewGameBtn(){
        //New Game button
        let newbtn= document.createElement('button');
        newbtn.setAttribute('type','button');
        newbtn.textContent="Start New Game";
        newbtn.addEventListener('click', async()=>{
            console.log('New Game from app!')
            let putWords= new PutNewGame(CNGame.nr);
            words=await putWords.wordsFromRoom; /// define the words variable
            socketIO.emit("startnewgame",CNGame.nr);
        });

        return newbtn;
    } */

}

