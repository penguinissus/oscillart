const input = document.getElementById('input');

//create web audio api elements
const audioCtx = new AudioContext();
const gainNode = audioCtx.createGain();

//create oscillator node
const oscillator = audioCtx.createOscillator();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = "sine";

//setup
oscillator.start();
gainNode.gain.value = 0;

//create a map of notes
notenames = new Map();
notenames.set("C",261.6);
notenames.set("D",293.7);
notenames.set("E",329.6);
notenames.set("F",349.2);
notenames.set("G",392.0);
notenames.set("A",440);
notenames.set("B",493.9);

//define canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //ctx is just the part of the canvas we draw on
var width = ctx.canvas.width;
var height = ctx.canvas.height;

var amplitude = 40;
var interval = null;
var reset = false;

var counter = 0;
function drawWave(){
    clearInterval(interval);
    if(reset){
        ctx.clearRect(0, 0, width, height); //clears canvas
        x = 0;
        y = height/2;
        ctx.moveTo(x,y);
        ctx.beginPath();
    }
    
    counter = 0;
    interval = setInterval(line, 20);
    reset = false;
}

function line(){
    y = height/2 + (amplitude * Math.sin(x * 2 * Math.PI * freq));
    ctx.lineTo(x,y);
    ctx.stroke();
    x = x+1;
    counter++;
    if (counter>50){
        clearInterval(interval);
    }
}

function frequency(pitch){
    freq = pitch / 10000;
    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 0.9);
}

function handle(){
    reset = true;
    //needs to be at top of function
    audioCtx.resume();
    gainNode.gain.value = 0;
    
    var usernotes = String(input.value);
    var noteslist = [];
    for (i = 0; i < usernotes.length; i++){
        noteslist.push(notenames.get(usernotes.charAt(i)));
    }

    let j = 0;
    repeat = setInterval(() => {
        if (j < noteslist.length) {
            frequency(parseInt(noteslist[j]));
            drawWave();
            j++;
        } else {
            clearInterval(repeat)
        }
    }, 1000);
}