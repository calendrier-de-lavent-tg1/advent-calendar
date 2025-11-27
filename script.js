////////////////////////////
// CONFIG
////////////////////////////
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbze6o-6VO-NSqDIthSS0xocC5sspPm_q63lUe17QeWVHr8ptEF3cqtcNkbuuzreEfgsgg/exec";

const jours = [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19];

// MODE TEST — Ouvre tous les jours
const today = new Date(2025, 11, 19, 12, 0, 0); 

const enigmes = {
  1:"Je commence la journée sans effort et termine souvent en musique. Qui suis-je ?",
  2:"Qu’est-ce qui a des clés mais n’ouvre aucune porte ?",
  3:"Énigme 3...",
  4:"Énigme 4...",
  5:"Énigme 5...",
  8:"Énigme 8...",
  9:"Énigme 9...",
  10:"Énigme 10...",
  11:"Énigme 11...",
  12:"Énigme 12...",
  15:"Énigme 15...",
  16:"Énigme 16...",
  17:"Énigme 17...",
  18:"Énigme 18...",
  19:"Énigme 19..."
};

// positions visuelles
const positions = [
  {left:"10%", top:"8%"},
  {left:"78%", top:"10%"},
  {left:"8%", top:"32%"},
  {left:"38%", top:"62%"},
  {left:"70%", top:"44%"},
  {left:"52%", top:"18%"},
  {left:"22%", top:"46%"},
  {left:"12%", top:"72%"},
  {left:"80%", top:"66%"},
  {left:"50%", top:"36%"},
  {left:"28%", top:"12%"},
  {left:"62%", top:"78%"},
  {left:"40%", top:"8%"},
  {left:"86%", top:"36%"},
  {left:"66%", top:"54%"}
];

////////////////////////////
// INIT SCÈNE
////////////////////////////
const scene = document.getElementById("scene");

const today = new Date();
const year = today.getFullYear();
const month = 11; // décembre

let openedDay = null;

// création flocons
jours.forEach((day,i)=>{
  const fl=document.createElement("div");
  fl.className="flake";
  fl.style.left=positions[i].left;
  fl.style.top=positions[i].top;
  fl.style.animation=`floaty ${5+(i%3)}s ease-in-out infinite`;

  fl.dataset.day=day;

  const num=document.createElement("div");
  num.className="num";
  num.textContent=day;
  fl.appendChild(num);

  const dCase = new Date(year,month,day,12,0,0);

  if(today < dCase){
    fl.classList.add("trop-tot");
  } else if(today.toDateString() !== dCase.toDateString()){
    fl.classList.add("passe");
  }

  fl.addEventListener("click",()=> onFlake(day));
  scene.appendChild(fl);
});

////////////////////////////
// MODAL + FLOW
////////////////////////////
const modal=document.getElementById("modal");
const stepName=document.getElementById("step-name");
const stepEnigme=document.getElementById("step-enigme");
const stepDone=document.getElementById("step-done");
const modalClose=document.getElementById("modal-close");
const doneClose=document.getElementById("done-close");

const inputName=document.getElementById("input-name");
const inputAnswer=document.getElementById("input-answer");

const msg1=document.getElementById("modal-msg");
const msg2=document.getElementById("modal-msg-2");

const titreEnigme=document.getElementById("modal-title-enigme");
const enigmeText=document.getElementById("enigme-text");

modalClose.onclick=()=>modal.classList.add("hidden");
doneClose.onclick=()=>modal.classList.add("hidden");

function onFlake(day){
  const dateCase = new Date(year,month,day,12,0,0);

  if(today < dateCase){
    alert("Trop tôt !");
    return;
  }

  if(today.toDateString() !== dateCase.toDateString()){
    alert("Jour passé.");
    return;
  }

  openedDay=day;
  inputName.value="";
  inputAnswer.value="";
  msg1.textContent="";
  msg2.textContent="";

  stepName.classList.remove("hidden");
  stepEnigme.classList.add("hidden");
  stepDone.classList.add("hidden");

  modal.classList.remove("hidden");
}

document.getElementById("to-enigme").onclick=()=>{
  if(!inputName.value.trim()){
    msg1.textContent="Entre ton nom.";
    return;
  }

  msg1.textContent="";
  stepName.classList.add("hidden");
  stepEnigme.classList.remove("hidden");

  titreEnigme.textContent=`Jour ${openedDay}`;
  enigmeText.textContent=enigmes[openedDay];
};

document.getElementById("send-answer").onclick=async ()=>{
  if(!inputAnswer.value.trim()){
    msg2.textContent="Entre une réponse.";
    return;
  }

  const payload = {
    name: inputName.value.trim(),
    day: openedDay,
    answer: inputAnswer.value.trim()
  };

  try{
    const res = await fetch(SCRIPT_URL,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const data = await res.json();

    if(data.status==="already"){
      msg2.textContent="Tu as déjà répondu.";
      return;
    }

    if(data.status==="ok"){
      stepEnigme.classList.add("hidden");
      stepDone.classList.remove("hidden");
    }
  } catch(e){
    msg2.textContent="Erreur de connexion.";
  }
};
