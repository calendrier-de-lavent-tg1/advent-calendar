////////////////////////////
// CONFIGURATION
////////////////////////////

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbze6o-6VO-NSqDIthSS0xocC5sspPm_q63lUe17QeWVHr8ptEF3cqtcNkbuuzreEfgsgg/exec";

const jours = [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19];

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

// positions des flocons
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
// MODE TEST / MODE ADMIN
////////////////////////////

// true = permet de simuler un jour
const MODE_TEST = true;

// jour simulé par défaut si MODE_TEST = true
let jourSimule = 5;

// mode admin (touche "A")
document.addEventListener("keydown", (e)=>{
  if(e.key === "A"){
    const j = prompt("Jour à simuler ?");
    if(j && !isNaN(j)){
      jourSimule = parseInt(j);
      alert("Simulation du jour " + jourSimule);
    }
  }
});

// retourne la date du jour réel ou simulé
function getAujourdhui(){
  const now = new Date();
  if(MODE_TEST){
    return new Date(now.getFullYear(), 11, jourSimule, 12, 0, 0);
  }
  return now;
}

let aujourdHui = getAujourdhui();
const annee = aujourdHui.getFullYear();
const mois = 11; // décembre

////////////////////////////
// CRÉATION SCÈNE
////////////////////////////

const scene = document.getElementById("scene");
let jourOuvert = null;

jours.forEach((jour, i) => {

  const fl = document.createElement("div");
  fl.className = "flake";
  fl.style.left = positions[i].left;
  fl.style.top = positions[i].top;
  fl.style.animation = `floaty ${5 + (i%3)}s ease-in-out infinite`;

  fl.dataset.jour = jour;

  const num = document.createElement("div");
  num.className = "num";
  num.textContent = jour;
  fl.appendChild(num);

  const dateCase = new Date(annee, mois, jour, 12, 0, 0);
  aujourdHui = getAujourdhui();

  if(aujourdHui < dateCase){
    fl.classList.add("trop-tot");
  } else if(aujourdHui.toDateString() !== dateCase.toDateString()){
    fl.classList.add("passe");
  }

  fl.addEventListener("click",()=> ouvrirCase(jour));
  scene.appendChild(fl);
});

////////////////////////////
// MODAL + LOGIQUE
////////////////////////////

const modal = document.getElementById("modal");
const etapeNom = document.getElementById("step-name");
const etapeEnigme = document.getElementById("step-enigme");
const etapeFini = document.getElementById("step-done");

const fermer1 = document.getElementById("modal-close");
const fermer2 = document.getElementById("done-close");
fermer1.onclick = ()=> modal.classList.add("hidden");
fermer2.onclick = ()=> modal.classList.add("hidden");

const inputNom = document.getElementById("input-name");
const inputRep = document.getElementById("input-answer");

const msgNom = document.getElementById("modal-msg");
const msgRep = document.getElementById("modal-msg-2");

const titre = document.getElementById("modal-title-enigme");
const texteEnigme = document.getElementById("enigme-text");

function ouvrirCase(jour){
  const dateCase = new Date(annee, mois, jour, 12, 0, 0);
  aujourdHui = getAujourdhui();

  if(aujourdHui < dateCase){
    alert("Trop tôt !");
    return;
  }

  if(aujourdHui.toDateString() !== dateCase.toDateString()){
    alert("Jour passé.");
    return;
  }

  jourOuvert = jour;

  inputNom.value = "";
  inputRep.value = "";
  msgNom.textContent = "";
  msgRep.textContent = "";

  etapeNom.classList.remove("hidden");
  etapeEnigme.classList.add("hidden");
  etapeFini.classList.add("hidden");

  modal.classList.remove("hidden");
}

// Passe à l’énigme
document.getElementById("to-enigme").onclick = () => {
  if(!inputNom.value.trim()){
    msgNom.textContent = "Entre ton nom.";
    return;
  }

  etapeNom.classList.add("hidden");
  etapeEnigme.classList.remove("hidden");

  titre.textContent = `Jour ${jourOuvert}`;
  texteEnigme.textContent = enigmes[jourOuvert];
};

// Envoi de la réponse
document.getElementById("send-answer").onclick = async () => {

  if(!inputRep.value.trim()){
    msgRep.textContent = "Entre une réponse.";
    return;
  }

  const payload = {
    name: inputNom.value.trim(),
    day: jourOuvert,
    answer: inputRep.value.trim()
  };

  try{
    const res = await fetch(SCRIPT_URL, {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });

    const data = await res.json();

    if(data.status === "already"){
      msgRep.textContent = "Tu as déjà répondu.";
      return;
    }

    if(data.status === "ok"){
      etapeEnigme.classList.add("hidden");
      etapeFini.classList.remove("hidden");
    }

  }catch(e){
    msgRep.textContent = "Erreur de connexion.";
  }
};
