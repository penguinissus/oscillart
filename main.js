//referencing elements created in index.html
const input = document.getElementById('input');
const color_picker = document.getElementById('color');
const vol_slider = document.getElementById('vol-slider');
const recording_toggle = document.getElementById('record');

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
notenames.set("c",261.6);
notenames.set("d",293.7);
notenames.set("e",329.6);
notenames.set("f",349.2);
notenames.set("g",392.0);
notenames.set("a",440);
notenames.set("b",493.9);
notenames.set("C",(261.6*2));
notenames.set("D",(293.7*2));
notenames.set("E",(329.6*2));
notenames.set("F",(349.2*2));
notenames.set("G",(392*2));
notenames.set("A",(880));
notenames.set("B",(493.9*2));
notenames.set("X",0);

//define canvas variables
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d"); //ctx is just the part of the canvas we draw on
var width = ctx.canvas.width;
var height = ctx.canvas.height;

var interval = null;
var reset = false;

//making sure any length fits in the drawing box
var timepernote = 0;
var length = 0;

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
    y = height/2 + vol_slider.value * Math.sin(x * 2 * Math.PI * freq * 0.5 * length);
    ctx.strokeStyle = color_picker.value; //setting colour of line
    ctx.lineTo(x,y);
    ctx.stroke();
    x = x+1;
    counter++;
    if (counter>(timepernote/20)){
        clearInterval(interval);
    }
}

function frequency(pitch){
    freq = pitch / 10000;
    gainNode.gain.setValueAtTime(vol_slider.value, audioCtx.currentTime);
    setting = setInterval(() => {gainNode.gain.value = vol_slider.value}, 1);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    setTimeout(() => {
        clearInterval(setting);
        gainNode.gain.value = 0;
    }, ((timepernote)-10));
    //they said remove this line but the audio doesn't stop without this
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + ((timepernote/1000)-0.1));
}

function handle(){
    reset = true;
    //needs to be at top of function
    audioCtx.resume();
    gainNode.gain.value = 0;
    
    var usernotes = String(input.value);
    var noteslist = [];

    length = usernotes.length;
    timepernote = (6000/length);

    for (i = 0; i < usernotes.length; i++){
        noteslist.push(notenames.get(usernotes.charAt(i)));
    }

    j = 0;
    repeat = setInterval(() => {
        if (j < noteslist.length) {
            frequency(parseInt(noteslist[j]));
            console.log(noteslist[j]);
            drawWave();
            j++;
        } else {
            clearInterval(repeat)
        }
    }, timepernote);
}

var blob, recorder = null;
var chunks = [];
function startRecording(){
    const canvasStream = canvas.captureStream(20); //frame rate of canvas
    const audioDestination = audioCtx.createMediaStreamDestination();
    gainNode.connect(audioDestination);
    const combinedStream = new MediaStream();
    canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
    audioDestination.stream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
    recorder = new MediaRecorder(combinedStream, {mimeType: 'video/webm'});

    recorder.ondataavailable = e => {
        if(e.data.size > 0){
            chunks.push(e.data);
        }
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, {type: 'video/webm'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.webm';
        a.click();
        URL.revokeObjectURL(url);
    };

    recorder.start();
}

var is_recording = false;
function toggle(){
    is_recording = !is_recording;
    if(is_recording){
        recording_toggle.innerHTML = "Stop Recording";
        startRecording();
    } else {
        recording_toggle.innerHTML = "Start Recording";
        recorder.stop();
    }
}