let bgm = undefined;
let velocity = 10;
window.onload = function(){
    canv = document.createElement('canvas');
    canv.id = 'gc';
    canv.width = 400;
    canv.height = 400;
    document.body.appendChild(canv);
    ctx=canv.getContext("2d");

    bgm =  document.getElementById('bgm');

    scoreStorage = new ScoreStorage();

    score = 0;
    scoreText = document.getElementById("game__score--value");

    maxScore = scoreStorage.ReadMaxScore();
    maxScoreText = document.getElementById("game__score--maxValue");
    maxScoreText.innerHTML = maxScore;

    document.addEventListener("keydown",keyPush);
    setInterval(game,1000/velocity);
}

nextRotation = 10;
px=py=10;
gs=tc=20;
ax=ay=15;
xv=yv=0;
trail=[];
tail = 5;

function game() {
    px+=xv;
    py+=yv;
    if(px<0) {
        px = tc-1;
    }
    if(px>tc-1) {
        px = 0;
    }

    if(py<0) {
        py = tc-1;
    }
    if(py>tc-1) {
        py = 0;
    }

    ctx.fillStyle="black";
    ctx.fillRect(0,0,canv.width,canv.height);

    alterColors('snake');

    for(var i = 0; i<trail.length;i++){
        ctx.fillRect(trail[i].x*gs,trail[i].y*gs,gs-2,gs-2);
        if(trail[i].x == px && trail[i].y == py) {
            tail = 5;
            score=0;
            nextRotation=10;
            canv.style.transform = `rotateZ(${0}deg)`;
            scoreText.innerHTML = score;
        }
    }

    trail.push({x:px,y:py});

    while(trail.length>tail){
        trail.shift();
    }

    if(ax==px && ay==py) {
        tail++;
        score+=1;
        scoreText.innerHTML = score;
        if(score > maxScore) {
            maxScore = score;
            maxScoreText.innerHTML = maxScore;
            scoreStorage.WriteMaxScore(maxScore);
        }

        //get current canvas rotation and add 10 degrees to it
        if(score>=10) {
            alterRotation(score);
        }

        ax=Math.floor(Math.random()*tc);
        ay=Math.floor(Math.random()*tc);
    }

    alterColors('food');
    ctx.fillRect(ax*gs,ay*gs,gs-2,gs-2);
}

function alterRotation(score) {
    let currentRotation = parseInt(canv.style.transform.match(/\d+/)[0]);
    if(score === nextRotation) {
        canv.style.transform = `rotateZ(${currentRotation+1}deg)`;
        if(score <=5){
            nextRotation+=10;
        } else {
            nextRotation+=5;
            if(score > 10) {
                velocity++;
            }
        }
    }
}

function alterColors(type) {
    let canvas = document.getElementById('gc');
    switch (type) {
        case 'snake':
            if(score <10) {
                ctx.fillStyle="#5d2133"
                canvas.style.boxShadow = "0 0px 50px #5d2133";
            }
            if(score >=10 && score <20) {
                ctx.fillStyle="#ff0000"
                canvas.style.boxShadow = "0 0px 50px #ff0000";
            }
            if(score >=20 && score <30) ctx.fillStyle="#ff00ff";
            if(score >=30 && score <40) ctx.fillStyle="#00ff00";
            if(score >=40 && score <50) {
                ctx.fillStyle="#0000ff";
                canvas.style.boxShadow = "0 0px 50px #0000ff";
            }
            if(score >=50 && score <60) {
                ctx.fillStyle="#ffff00";
                canvas.style.boxShadow = "0 0px 50px #ffff00";
            }
            if(score >=60 && score <70) ctx.fillStyle="#ff00ff";
            if(score >=70 && score <80) ctx.fillStyle="#00ffff";
            if(score >=80 && score <90) {
                ctx.fillStyle="#ff0000";
                canvas.style.boxShadow = "0 0px 50px #ff0000";
            }
            if(score >=90 && score <100) ctx.fillStyle="#00ff00";
            break;
        case 'food':
            if(score <10) ctx.fillStyle="#00ffff";
            if(score >=10 && score <20) ctx.fillStyle="#f0e68c";
            if(score >=20 && score <30) {
                ctx.fillStyle="#f0e68c";
                canvas.style.boxShadow = "0 0px 50px #f0e68c";
            }
            if(score >=30 && score <40) {
                ctx.fillStyle="#0de0ff";
                canvas.style.boxShadow = "0 0px 50px #0de0ff";
            }
            if(score >=40 && score <50) ctx.fillStyle="#ff0000";
            if(score >=50 && score <60) ctx.fillStyle="#00ff00";
            if(score >=60 && score <70) {
                ctx.fillStyle="#0000ff";
                canvas.style.boxShadow = "0 0px 50px #0000ff";
            }
            if(score >=70 && score <80) {
                ctx.fillStyle="#ff0f32";
                canvas.style.boxShadow = "0 0px 50px #ff0f32";
            }
            if(score >=80 && score <90) ctx.fillStyle="#ff00ff";
            if(score >=90 && score <100) {
                ctx.fillStyle="#ffff00";
                canvas.style.boxShadow = "0 0px 50px #ffff00";
            }
            break;
    }
}

class ScoreStorage {
    constructor() {
        this.score = 0;
        this.maxScore = 0;
        if(typeof (Storage) !== "undefined") {
            this.ReadMaxScore();
        } else {
            alert("Sorry! No Web Storage support..");
        }
    }

    WriteMaxScore(maxScore) {
        localStorage.setItem("maxScore",maxScore);
    }

    ReadMaxScore(){
        this.maxScore = localStorage.getItem("maxScore");
        return this.maxScore;
    }
}

function keyPush(evt) {
    switch(evt.keyCode) {
        case 37:
            xv=-1;yv=0;
            break;
        case 38:
            xv=0;yv=-1;
            break;
        case 39:
            xv=1;yv=0;
            break;
        case 40:
            xv=0;yv=1;
            break;
    }

    //check if bgm is playing
    if(bgm.paused) {
        bgm.play();
    }
}