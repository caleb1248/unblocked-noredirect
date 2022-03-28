var canvas = document.createElement('canvas');
var width = window.innerWidth;
var height = window.innerHeight;
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');
var bgcolor = '#000000';
ctx.fillStyle = bgcolor;
ctx.font = "30px Arial";
ctx.fillRect(0,0,width,height);
aimg = document.getElementById('asteroid');
pimg = document.getElementById('player');

const start = performance.now();

var player = {
    x:width/2,
    y:height-100,
    width: 30*0.7452830188679245,
    height: 30,
    xvelocity: 0,
    yvelocity: 0,
    is_shooting: false,
    shoot_left: 50,
    max_shoot: 100,
    has_shoot_over: false
}
var score = 0

var stars = []
for (let i = 0; i < 500; i++) {
  stars.push([Math.random()*canvas.width,Math.random()*(canvas.height+10)-20,Math.random()*3,Math.random()*3])
}

var falling = []
function killthedumbplayer() {
    clearInterval(theinterval)
    ctx.fillStyle = '#000000'
    ctx.fillRect(0,0,width,height)
    ctx.fillStyle='#ff0000'
    ctx.textAlign = "center";
    ctx.fillText('You died. Your score was: '
    +Math.floor(score), width/2,100)
    ctx.textAlign = "start";
    document.getElementById('holderdiv').style.display='block'
		history.go(0)
    return false
}
function renderplayer () {
    for (var thingy of falling) {
        if (thingy.x<player.x+player.width && player.x<thingy.x+thingy.width && thingy.y<player.y+player.height && player.y<thingy.y+thingy.height) {
            killthedumbplayer();
            return false;
        }
    }
    player.x+=player.xvelocity
    player.y += player.yvelocity
    if (player.x<0) {
        //player.x = 0
        killthedumbplayer();
        return false;
    }
    else if (player.x+player.width>width) {
        //player.x = width-player.width
        killthedumbplayer();
        return false;
    }
    else if (player.y<0) {
        killthedumbplayer();
        return false;
    }
    else if (player.y+player.height > height) {
        killthedumbplayer()
        return false;
    }
    ctx.fillStyle = '#ff0000'
    ctx.drawImage(pimg, player.x,player.y,player.width,player.height)
}
function renderammo() {
    var amw = 70;
    var amh = 20
    var siding = 5;
    ctx.fillStyle ='#FFA500'
    ctx.fillRect(width-siding*2-amw, 0, siding*2+amw,siding*2+amh)
    ctx.fillStyle = '#ffff00'
    ctx.fillRect(width-amw-siding, siding, player.shoot_left/player.max_shoot*amw, amh)
}
function rendercanvas() {
    ctx.fillStyle=bgcolor
    ctx.fillRect(0,0,width,height)
    ctx.fillStyle='#FFFFFF'
    for (let i = 0; i < stars.length; i++) {
      ctx.fillRect(stars[i][0],stars[i][1],stars[i][2],stars[i][2])
      stars[i][1] += stars[i][3]
      if (stars[i][1] > canvas.height) {
        stars[i][1] = Math.random() * -10;
      }
    }
}

function renderscore() {
    ctx.fillStyle = '#ff0000'
    ctx.fillText("Score: "+Math.floor(score.toString()), 10,30)
}
function renderfallings(){
    ctx.fillStyle = '#FFFFFF'
    for (var i = falling.length-1; i>-1; i--) {
        thingy = falling[i]
        if (thingy.strongness<1) {
            falling.splice(i,1)
            score+=1
            continue;
        }
        thingy.y += thingy.velocity * (performance.now() - start) / 7000;
        ctx.translate(thingy.x+thingy.width/2, thingy.y+thingy.height/2)
        ctx.rotate(thingy.rot)
        ctx.drawImage(aimg, 0,0, thingy.width, thingy.height)
        ctx.rotate(-thingy.rot)
        ctx.translate(-(thingy.x+thingy.width/2), -(thingy.y+thingy.height/2))
        // the rotation matrix starts out at (0,0) so you need to change it to the center of the image, because that's where it rotates around
        // and you need to put the translate to the center and then back to (0,0) ok hey
        // yeah
        // also maybe we get like 3 different images for asteroids
        // ye
        // you get them ok
        //we are forgetting something !
    }

    renderammo()
}
function addathingy() {
    size = Math.random()*20+20
    let thingy = {
        x: Math.random()*(width),
        y: -100,
        velocity: Math.random()*4+2,
        width:size,
        height:size,
        rot: Math.random()*360,
        strongness: Math.floor(Math.random()*4+4)
    }
    falling.push(thingy)
}

function checkallbelow() {
    for (let i = falling.length-1; i>-1; i--) {
        thingy = falling[i]
        if (thingy.y>height+30) {
            falling.splice(i,1)
            score += 1
        }
    }
}
function shootthelazer() {
    if (!player.is_shooting) {
        if (player.shoot_left<player.max_shoot) {
            player.shoot_left += 1
        }
        return false
    }
    if (player.has_shoot_over) {
        if (player.shoot_left>= player.max_shoot) {
            player.has_shoot_over = true;
        }
        else {
            return false
        }
    }
    if (player.shoot_left<1) {
        player.is_shooting = false
        player.has_shoot_over = true
        return false
    }
    player.shoot_left -= 1
    var best = null;
    for (var thingy of falling) {
        if (thingy.x<player.x + player.width - 8 && player.x+3<thingy.x+thingy.width && thingy.y < player.y-thingy.height) {
            if (best != null) {
                if (thingy.y>best.y) {
                    best = thingy
                }
            } else {
                best = thingy
            }
        }
    }
    var heightgoto = height+100
    if (best != null) {
        falling[falling.indexOf(best)].strongness -= 1.5
        heightgoto = player.y - best.y-best.height
        
    }
    ctx.fillStyle = '#ffff00'
    
    ctx.fillRect(player.x+8, player.y, player.width-16, -heightgoto)
}
var theinterval = 0
function onkeydown(e) {
    if (e.keyCode==37) {
        if(player.xvelocity>-6) {
            player.xvelocity += -6
        }
    }
    if (e.keyCode == 39) {
        if (player.xvelocity <6) {
            player.xvelocity += 6
        }
    }
    if (e.keyCode == 38) {
        if (player.yvelocity>-6) {
            player.yvelocity -= 6
        }
    }
    if (e.keyCode == 40) {
        if (player.yvelocity < 6) {
            player.yvelocity += 6
        }
    }
    if (e.keyCode == 32) {
        player.is_shooting = true
    }
}
function onkeyup(e) {
    if (e.keyCode == 37) {
        player.xvelocity +=6
    }
    if (e.keyCode == 39) {
        player.xvelocity -= 6
    }
    if (e.keyCode == 38) {
        if (player.yvelocity<6) {
            player.yvelocity += 6
        }
    }
    if (e.keyCode == 40) {
        if (player.yvelocity > -6) {
            player.yvelocity -= 6
        }
    }
    if (e.keyCode = 32) {
        player.is_shooting = false
        player.has_shoot_over = false
    }
}
function enabledoommode() {
    player.max_shoot = 1000000000
    player.shoot_left = 1000000000
}
window.addEventListener('keydown', onkeydown)
window.addEventListener('keyup', onkeyup)
var hardness = 100
if (localStorage.getItem('h')!= null) {
    hardness = localStorage.getItem('h')
}

var amount = 1000/(width/hardness)
var ain = setInterval(addathingy, amount)
function looping() {
    rendercanvas()
    renderfallings()
    checkallbelow()
    renderscore()
    renderplayer()
    shootthelazer()
    
}
theinterval=  setInterval(looping, 22)
document.getElementById('thebtn').addEventListener('click', function(){history.go(0);})/*
document.getElementById('easy').addEventListener('click', function() {
    if (hardness<100) {
        hardness += 10
    }
    localStorage.setItem('h', hardness)
})
document.getElementById('hard').addEventListener('click', function() {
    if (hardness>10) {
        hardness -= 10
    }
    localStorage.setItem('h', hardness)
})*/
setInterval(function(){
    hardness-=1;
    if(hardness<1){hardness=1};
    clearInterval(ain);
    ain = setInterval(addathingy, amount)
},2000)