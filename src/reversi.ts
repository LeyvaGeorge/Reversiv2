const rowL: string[] = ['A','B','C','D','E','F','G','H'];
const columnN: string[] = ['1','2','3','4','5','6','7','8'];
const iconLink:HTMLElement | null = document.getElementById('favicon');
let blackScore:HTMLElement | null = document.getElementById('blkScore');
let whiteScore:HTMLElement | null = document.getElementById('whtScore');
let playersTurn:HTMLElement | null = document.getElementById('player');

//Tile class what each box contains

class tile {
    name: string;       //name "A1,A2...B1,B2...H8"
    row: number;        //Row 'A = 1'
    col: number;        //Column '1 = 1'
    fill: boolean;      //Is this tile visible
    color: string;      //What is the color of the tile

    constructor(name:string,row: number, col: number, fill: boolean, color: string){
        this.name = name;
        this.row = row;
        this.col = col;
        this.fill = fill;
        this.color = color;
    }

    addPiece() {
        this.fill = true;       //changes it to true 
    }
    cngColor(color:string) {
        this.color = color;     //adds the color to change
        const element = document.getElementById(this.name);
        if(element)
            element.style.background = color;
    }
}

//The game class that runs the program
class gameSystem {
    tileArr: tile[][] = [];     //The tile array needs 
    scoreBlk: number = 0;
    scoreWht: number = 0;
    turnColor: string  = "black";
    constructor() {

    }

    //Re-sets the game
    strtGame() {
        this.fillArray();         //fills the array with tile
        this.scoreBlk = 0;
        this.scoreWht = 0;
        this.listen();            //Adds EventListeners to the array
        this.turnColor = "black"
        if(playersTurn)             //If playersTurn is not null
            playersTurn.innerHTML = "Black Starts"; //changes the 
    }

    //Fills the array with tiles
    fillArray() {
        for(let i = 0; i < rowL.length; i++) {
            this.tileArr[i] = [];
            for (let j = 0; j < columnN.length; j++) {
                let namestr: string = rowL[i] + columnN[j];
                if( namestr == 'D4' || namestr == "E5") {
                    const newTile = new tile(namestr,i,j,true,"")  //Creates a new tile witha a name
                    this.tileArr[i][j] = newTile                    //Assigns it to the 2-D array
                    this.tileArr[i][j].cngColor("black")            //This changes and assings color           
                }
                else if (namestr == "D5" || namestr == "E4"){
                    const newTile = new tile(namestr,i,j,true,"");
                    this.tileArr[i][j] = newTile
                    this.tileArr[i][j].cngColor("white")
                }  
                else{
                   const newTile = new tile(namestr,i,j,false,"")
                   this.tileArr[i][j] = newTile  
                }
            }
        }
        this. altrpoints();      // This is check on points
    }

    altrpoints() {
        let white: number = 0;
        let black: number = 0;

        for (let i =0; i < rowL.length;i++){
            for (let j = 0; j < columnN.length; j++) {      //Checking for tile color and adding it to the points
                if(this.tileArr[i][j].color == "black"){
                    black++;
                }
                else if (this.tileArr[i][j].color == "white"){
                    white++;
                }
            }
        }
        //Updating the score board
        if(blackScore)
            blackScore.innerHTML = `Black: ${black}`;
        if(whiteScore)
            whiteScore.innerHTML = `White: ${white}`; 
    }

    //Adds EventListener to the array
    listen() {
        for (let i =0; i < rowL.length;i++){
            for (let j = 0; j < columnN.length; j++) {      //Checking for tile color and adding it to the points
                let nameStr:string = rowL[i] + columnN[j];  //Assings the string to look for id
                let divName:HTMLElement | null = document.getElementById(nameStr)
                if(divName){
                    divName.addEventListener('click', () => {   //Adding the click to the id
                        if(this.tileArr[i][j].fill == false) {  //Checking to see if tile is empty
                            if(this.turnColor == 'black'){
                                this.tileArr[i][j].cngColor("black");   //changes the color 
                                this.tileArr[i][j].addPiece();          //adds the fill to true to not enter a filled tile
                                this.chngTurn();
                                this.isValidMove(i,j,'black');
                                this.altrpoints();                      //updates points on screen
                                this.hasWon();                       //Checks to see if tile is full
                                if(iconLink)
                                    iconLink.setAttribute("href","/Assets/whiteIcon.ico");
                            } else if(this.turnColor == 'white'){
                                this.tileArr[i][j].cngColor("white");   //changes the color 
                                this.tileArr[i][j].addPiece();          //adds the fill to true to not enter a filled tile
                                this.chngTurn();
                                this.isValidMove(i,j,'white');          //====Might need to change ===== This might needs to flip i and j
                                this.altrpoints();                      //updates points on screen
                                this.hasWon();                       //Checks to see if tile is full
                                if(iconLink)
                                    iconLink.setAttribute("href","/Assets/blackIcon.ico");
                            }
                        } else {
                            alert("Tile:" + i + "," + j+" is already filled");
                        }
                    })
                }
            }
        }
    }

    //Changes the color on screen
    chngTurn() {
        if(this.turnColor == 'black'){
            this.turnColor = 'white';           
            if(playersTurn)
                playersTurn.innerHTML = "White's Turn"
        } else {
            this.turnColor = 'black';
            if(playersTurn)
                playersTurn.innerHTML = "Black's Turn";
        }
    }

    //Finds if enemy is nearby
    isValidMove(row:number,col:number,playerColor:string) {
        let opponentcolor:string = (playerColor == "white") ? "black" : "white";
        let directions:number[][] = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]

        //Cycles to look around the clicked tile to find any valid opponents to flip
        for(let i = 0; i < directions.length;i++) {
            let r: number = row + directions[i][0];
            let c: number = col + directions[i][1];

            if(r >= 0 && r < 8 && c >= 0 && c < 8) {
                if(this.tileArr[r][c].color == opponentcolor) { //Enemy is located
                    let valid:boolean = this.rabbitHole(r,c,playerColor,opponentcolor,directions[i]) //function to find a friendly among enemies
                    if(valid) {//If true
                        this.tileArr[r][c].cngColor(playerColor)
                    }

                }
            }
        }
    }

    //continues to look for enemies till a friendly is found
    rabbitHole(row:number,col:number,pColor:string,oColor:string,direction:number[]) {
        row += direction[0];
        col += direction[1];

        if (row >=0 && row < 8 && col >=0 && col < 8){
            if(this.tileArr[row][col].color == pColor)
                return true;            //found a friendly
            else if(this.tileArr[row][col].color == oColor) {
                let valid:boolean = this.rabbitHole(row,col,pColor,oColor,direction) //looks further back into same direction
                if(valid == true) {
                    this.tileArr[row][col].cngColor(pColor);
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;       //Reached the end of table
    }

    hasWon() {
        let white: number = 0;
        let black: number = 0;
        //This step counts all the color in the table
        for (let i =0; i < rowL.length;i++){
            for (let j = 0; j < columnN.length; j++) {
                if(this.tileArr[i][j].color == "black"){
                    black++;
                }else if(this.tileArr[i][j].color == "white"){
                    white++;
                }
            }
        }
        let result: number = white + black;
        if(result == 64) {
            if (black > white) {
                alert("Black Won");
            } else if(black < white) {
                alert("White Won");
            } else {
                alert("TIE")
            }
        }    
    }
}

let GAME:gameSystem = new gameSystem(); //Game is Set
GAME.strtGame();