/* ===========================
   Calendrier — script principal
   Tout en français, responsive,
   mode test + admin (touche "A")
   =========================== */

/* ========== CONFIG ========== */
// URL de ton Apps Script (WebApp)
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbze6o-6VO-NSqDIthSS0xocC5sspPm_q63lUe17QeWVHr8ptEF3cqtcNkbuuzreEfgsgg/exec";

// Ouvre la case seulement à partir de cette heure (ex: 16 = 16:00)
const HEURE_OUVERTURE = 12; // change si tu veux (ex: 9, 16...)

const JOURS = [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19];

const ENIGMES = {
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

/* positions visuelles (réutilisées pour placer les flocons) */
const POSITIONS = [
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

/* ========== MODE TEST & ADMIN ========== */
/* true = mode test activé (simule jour+heure). Mettre false en prod */
let MODE_TEST = true;

/* jour et heure simulés (si MODE_TEST = true) */
let JOUR_SIMULE = 5;   // change le jour ici pour tester
let HEURE_SIMULE = 12; // change l'heure simulée

/* admin secret : appuie sur "A" pour saisir un jour (prompt) */
document.addEventListener("keydown", (e) => {
  if (e.key === "A") {
    const j = prompt("Jour à simuler (1-24) — laisse vide pour désactiver");
    if (j === null) return;
    if (j.trim() === "") {
      MODE_TEST = false;
      alert("Mode test désactivé.");
      return;
    }
    const jj = parseInt(j);
    if (!isNaN(jj)) {
      MODE_TEST = true;
      JOUR_SIMULE = jj;
      alert("Mode test activé → jour simulé : " + JOUR_SIMULE);
      // re-génère l'affichage (optionnel : reload)
      window.location.reload();
    }
  }
});

/* retourne un objet Date utilisé par le site (réel ou simulé) */
function obtenirDateActuelle(){
  const maintenant = new Date();
  if (MODE_TEST) {
    return new Date(maintenant.getFullYear(), 11, JOUR_SIMULE, HEURE_SIMULE, 0, 0);
  }
  return maintenant;
}

/* ========== INIT SCÈNE ========== */
const scene = document.getElementById("scene");
const annee = new Date().getFullYear();
const mois = 11; // décembre

let caseOuverte = null;

/* génération des flocons */
function genererFlocons(){
  scene.innerHTML = "";
  const dateUtilisee = obtenirDateActuelle();

  JOURS.forEach((jour, i) => {
    const fl = document.createElement("div");
    fl.className = "flake";
    fl.style.left = POSITIONS[i % POSITIONS.length].left;
    fl.style.top = POSITIONS[i % POSITIONS.length].top;
    fl.style.animation = `floaty ${5 + (i % 3)}s ease-in-out ${i % 2}s infinite`;
    fl.dataset.jour = jour;

    const num = document.createElement("div");
    num.className = "num";
    num.textContent = jour;
    fl.appendChild(num);

    const dateCase = new Date(annee, mois, jour, HEURE_OUVERTURE, 0, 0);

    if (dateUtilisee < dateCase) {
      fl.classList.add("trop-tot");
    } else if (dateUtilisee.toDateString() !== dateCase.toDateString()) {
      // jour passé
      fl.classList.add("passe");
    }

    fl.addEventListener("click", () => onFlakeClick(jour, fl));
    scene.appendChild(fl);
  });
}

/* appel initial */
genererFlocons();

/* ========== MODAL + FLOW ========== */
const modal = document.getElementById("modal");
const etapeNom = document.getElementById("step-name");
const etapeEnigme = document.getElementById("step-enigme");
const etapeFini = document.getElementById("step-done");

const btnFermer = document.getElementById("modal-close");
const btnDoneClose = document.getElementById("done-close");
if (btnFermer) btnFermer.onclick = () => modal.classList.add("hidden");
if (btnDoneClose) btnDoneClose.onclick = () => modal.classList.add("hidden");

const inputNom = document.getElementById("input-name");
const inputReponse = document.getElementById("input-answer");

const msgNom = document.getElementById("modal-msg");
const msgReponse = document.getElementById("modal-msg-2");

const titreEnigme = document.getElementById("modal-title-enigme");
const texteEnigme = document.getElementById("enigme-text");

/* au clic sur un flocon */
function onFlakeClick(jour, element){
  const dateCase = new Date(annee, mois, jour, HEURE_OUVERTURE, 0, 0);
  const dateUtilisee = obtenirDateActuelle();

  if (dateUtilisee < dateCase) {
    // Pas encore ouvert : préciser l'heure exacte (lisible)
    const options = { weekday:'short', year:'numeric', month:'short', day:'numeric' };
    alert(`Trop tôt — l'énigme s'ouvrira le ${dateCase.toLocaleDateString()} à ${HEURE_OUVERTURE}h.`);
    return;
  }

  if (dateUtilisee.toDateString() !== dateCase.toDateString()) {
    alert("Jour passé — réponses fermées.");
    return;
  }

  // c'est le jour J et l'heure est passée => ouvrir flow
  caseOuverte = jour;
  inputNom.value = "";
  inputReponse.value = "";
  msgNom.textContent = "";
  msgReponse.textContent = "";

  etapeNom.classList.remove("hidden");
  etapeEnigme.classList.add("hidden");
  etapeFini.classList.add("hidden");

  modal.classList.remove("hidden");
}

/* bouton suivant -> afficher énigme */
document.getElementById("to-enigme").onclick = () => {
  if (!inputNom.value.trim()) {
    msgNom.textContent = "Entre ton nom.";
    return;
  }
  msgNom.textContent = "";
  etapeNom.classList.add("hidden");
  etapeEnigme.classList.remove("hidden");

  titreEnigme.textContent = `Jour ${caseOuverte}`;
  texteEnigme.textContent = ENIGMES[caseOuverte] || "Aucune énigme définie.";
  // focus sur la réponse pour console mobile
  setTimeout(()=> inputReponse.focus(), 120);
};

/* envoi de la réponse vers Google Sheets (Apps Script) */
document.getElementById("send-answer").onclick = async () => {
  if (!inputReponse.value.trim()) {
    msgReponse.textContent = "Entre une réponse.";
    return;
  }

  const payload = {
    name: inputNom.value.trim(),
    day: caseOuverte,
    answer: inputReponse.value.trim()
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });

    // parse la réponse (Apps Script renvoie du JSON)
    const data = await res.json();

    if (data.status === "already") {
      msgReponse.textContent = "Tu as déjà répondu pour ce jour.";
      return;
    }
    if (data.status === "ok") {
      etapeEnigme.classList.add("hidden");
      etapeFini.classList.remove("hidden");
      // désactiver visuellement la case
      const fl = document.querySelector(`.flake[data-jour='${caseOuverte}']`);
      if (fl) { fl.classList.add("passe"); fl.style.pointerEvents = "none"; }
      return;
    }

    msgReponse.textContent = "Erreur serveur.";
  } catch (err) {
    console.error(err);
    msgReponse.textContent = "Erreur de connexion (vérifie l'URL Apps Script).";
  }
};

/* ========== NEIGE CANVAS ========== */
const canvas = document.getElementById("snow");
const ctx = canvas.getContext ? canvas.getContext("2d") : null;
let flakes = [];

function initSnow(){
  if(!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  flakes = [];
  for (let i=0;i<120;i++){
    flakes.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      r: Math.random()*3+1,
      d: Math.random()*2+1
    });
  }
}
function drawSnow(){
  if(!ctx) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  for (let f of flakes){
    ctx.beginPath();
    ctx.arc(f.x,f.y,f.r,0,Math.PI*2);
    ctx.fill();
  }
  updateSnow();
}
function updateSnow(){
  for (let f of flakes){
    f.y += f.d;
    if (f.y > canvas.height){ f.y = -10; f.x = Math.random()*canvas.width; }
  }
}

/* lancer neige */
initSnow();
setInterval(drawSnow, 33);
window.addEventListener("resize", initSnow);

/* ========== UTILITAIRES ========== */
/* Pour re-générer l'affichage si tu changes manuellement MODE_TEST / JOUR_SIMULE */
function rafraichir(){
  genererFlocons();
}

/* expose pour console si besoin */
window._calendrier = { genererFlocons, obtenirDateActuelle, rafraichir };
