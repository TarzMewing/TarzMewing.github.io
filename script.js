const canvas =
document.getElementById("game");

const ctx =
canvas.getContext("2d");

const holdCanvas =
document.getElementById("holdCanvas");

const holdCtx =
holdCanvas.getContext("2d");

const nextCanvas =
document.getElementById("nextCanvas");

const nextCtx =
nextCanvas.getContext("2d");

// SOUND
const clearSound =
new Audio(
"https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3"
);

clearSound.volume = 0.4;

// CONFIG
const COLS = 10;
const ROWS = 20;

let SIZE;

function resizeGame(){

  SIZE = Math.floor(
    Math.min(
      window.innerWidth * 0.08,
      window.innerHeight * 0.04
    )
  );

  if(SIZE < 18) SIZE = 18;
  if(SIZE > 32) SIZE = 32;

  canvas.width = COLS * SIZE;
  canvas.height = ROWS * SIZE;

}

resizeGame();

window.addEventListener(
"resize",
resizeGame
);

// BOARD
let board = [];

let score = 0;

function createBoard(){

  board = [];

  for(let r=0;r<ROWS;r++){

    let row = [];

    for(let c=0;c<COLS;c++){

      row.push(0);

    }

    board.push(row);

  }

}

createBoard();

// PIECES
const PIECES = [

{
color:"#00d4ff",
shape:[[1,1,1,1]]
},

{
color:"#ffd600",
shape:[[1,1],[1,1]]
},

{
color:"#cc00ff",
shape:[[0,1,0],[1,1,1]]
},

{
color:"#00e676",
shape:[[0,1,1],[1,1,0]]
},

{
color:"#ff1744",
shape:[[1,1,0],[0,1,1]]
}

];

let current;

let nextPiece;

let holdPieceData = null;

let canHold = true;

function makePiece(){

  const p =
  PIECES[
    Math.floor(
      Math.random()*PIECES.length
    )
  ];

  return{

    x:3,
    y:0,

    color:p.color,

    shape:JSON.parse(
      JSON.stringify(p.shape)
    )

  };

}

function randomPiece(){

  if(!nextPiece){

    nextPiece = makePiece();

  }

  current = nextPiece;

  nextPiece = makePiece();

  canHold = true;

  drawNext();

}

randomPiece();

function drawMini(ctxMini,piece){

  ctxMini.clearRect(0,0,80,80);

  if(!piece) return;

  const mini = 18;

  for(let r=0;r<piece.shape.length;r++){

    for(let c=0;c<piece.shape[r].length;c++){

      if(piece.shape[r][c]){

        ctxMini.fillStyle =
        piece.color;

        ctxMini.fillRect(
          c*mini+10,
          r*mini+10,
          mini-2,
          mini-2
        );

      }

    }

  }

}

function drawNext(){

  drawMini(nextCtx,nextPiece);

}

function drawHold(){

  drawMini(holdCtx,holdPieceData);

}

function hold(){

  if(!canHold) return;

  canHold = false;

  if(!holdPieceData){

    holdPieceData = {

      shape:current.shape,

      color:current.color

    };

    randomPiece();

  }else{

    const temp = {

      shape:current.shape,

      color:current.color

    };

    current = {

      x:3,
      y:0,

      shape:holdPieceData.shape,

      color:holdPieceData.color

    };

    holdPieceData = temp;

  }

  drawHold();

}

function drawCell(x,y,color){

  const px = x * SIZE;

  const py = y * SIZE;

  ctx.shadowColor = color;

  ctx.shadowBlur = 10;

  ctx.fillStyle = color;

  ctx.fillRect(
    px,
    py,
    SIZE-1,
    SIZE-1
  );

  ctx.fillStyle =
  "rgba(255,255,255,0.15)";

  ctx.fillRect(
    px,
    py,
    SIZE-8,
    4
  );

  ctx.shadowBlur = 0;

}

function drawBoard(){

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  for(let r=0;r<ROWS;r++){

    for(let c=0;c<COLS;c++){

      if(board[r][c]){

        drawCell(
          c,
          r,
          board[r][c]
        );

      }

    }

  }

}

function drawPiece(){

  for(let r=0;r<current.shape.length;r++){

    for(let c=0;c<current.shape[r].length;c++){

      if(current.shape[r][c]){

        drawCell(
          current.x+c,
          current.y+r,
          current.color
        );

      }

    }

  }

}

function draw(){

  drawBoard();

  drawPiece();

}

function collide(nx,ny,shape){

  for(let r=0;r<shape.length;r++){

    for(let c=0;c<shape[r].length;c++){

      if(!shape[r][c]) continue;

      let x = nx+c;

      let y = ny+r;

      if(x<0||x>=COLS)
      return true;

      if(y>=ROWS)
      return true;

      if(y>=0&&board[y][x])
      return true;

    }

  }

  return false;

}

function merge(){

  for(let r=0;r<current.shape.length;r++){

    for(let c=0;c<current.shape[r].length;c++){

      if(current.shape[r][c]){

        board[current.y+r]
        [current.x+c]
        = current.color;

      }

    }

  }

}

function shake(){

  canvas.style.transform =
  "translateX(4px)";

  setTimeout(()=>{

    canvas.style.transform =
    "translateX(-4px)";

  },40);

  setTimeout(()=>{

    canvas.style.transform =
    "translateX(0px)";

  },80);

}

function clearLines(){

  let cleared = false;

  for(let r=ROWS-1;r>=0;r--){

    let full = true;

    for(let c=0;c<COLS;c++){

      if(!board[r][c]){

        full = false;

        break;

      }

    }

    if(full){

      cleared = true;

      board.splice(r,1);

      board.unshift(
      Array(COLS).fill(0)
      );

      score += 100;

      r++;

    }

  }

  if(cleared){

    clearSound.currentTime = 0;

    clearSound.play();

    shake();

    canvas.style.boxShadow =
    "0 0 20px #00d4ff";

    setTimeout(()=>{

      canvas.style.boxShadow =
      "0 0 10px rgba(0,212,255,0.3)";

    },150);

    const scoreEl =
    document.getElementById("score");

    scoreEl.innerText = score;

    scoreEl.classList.add("pop");

    setTimeout(()=>{

      scoreEl.classList.remove("pop");

    },200);

  }

}

function rotate(){

  let old = current.shape;

  let rotated = [];

  for(let c=0;c<old[0].length;c++){

    let row = [];

    for(let r=old.length-1;r>=0;r--){

      row.push(old[r][c]);

    }

    rotated.push(row);

  }

  if(
    !collide(
      current.x,
      current.y,
      rotated
    )
  ){

    current.shape = rotated;

  }

}

let drop = 0;

let speed = 500;

function update(time=0){

  if(time-drop>speed){

    if(
      !collide(
        current.x,
        current.y+1,
        current.shape
      )
    ){

      current.y++;

    }else{

      merge();

      clearLines();

      randomPiece();

    }

    drop = time;

  }

  draw();

  requestAnimationFrame(update);

}

update();

function left(){

  if(
    !collide(
      current.x-1,
      current.y,
      current.shape
    )
  ){

    current.x--;

  }

}

function right(){

  if(
    !collide(
      current.x+1,
      current.y,
      current.shape
    )
  ){

    current.x++;

  }

}

function down(){

  if(
    !collide(
      current.x,
      current.y+1,
      current.shape
    )
  ){

    current.y++;

  }

}

function hardDrop(){

  while(
    !collide(
      current.x,
      current.y+1,
      current.shape
    )
  ){

    current.y++;

  }

}

document.getElementById("left")
.onclick = left;

document.getElementById("right")
.onclick = right;

document.getElementById("down")
.onclick = down;

document.getElementById("rotate")
.onclick = rotate;

document.getElementById("drop")
.onclick = hardDrop;

document.getElementById("hold")
.onclick = hold;

document.addEventListener(
"keydown",
(e)=>{

if(e.key==="ArrowLeft")
left();

if(e.key==="ArrowRight")
right();

if(e.key==="ArrowDown")
down();

if(e.key==="ArrowUp")
rotate();

if(e.code==="Space")
hardDrop();

if(e.key==="c")
hold();

});