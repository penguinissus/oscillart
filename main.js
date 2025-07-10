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
notenames.set("C4",261.6);
notenames.set("D4",293.7);
notenames.set("E4",329.6);
notenames.set("F4",349.2);
notenames.set("G4",392.0);
notenames.set("A4",440);
notenames.set("B4",493.9);

function frequency(pitch){
    gainNode.gain.setValueAtTime(100, audioCtx.currentTime);
    oscillator.frequency.setValueAtTime(pitch, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime + 1);
}

function handle(){
    //needs to be at top of function
    audioCtx.resume();
    gainNode.gain.value = 0;
    
    var usernotes = String(input.value);
    frequency(notenames.get(usernotes));
}