/* ===========================
   Calendrier — script principal
   Français — responsive — mode test/admin
   =========================== */

/* ========== CONFIG ========== */
// ⚠️ VÉRIFIEZ ET METTEZ À JOUR L'URL DE VOTRE APPS SCRIPT APRÈS CHAQUE DÉPLOIEMENT
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxyOzwBv6t4B4iLHBiN2piedWX_SBGQGKbs5-bHMbD6k9TVr8vJCa-lKAJ0RPdjjiHKxQ/exec";
// Heure d'ouverture (10h)
const HEURE_OUVERTURE = 10;
// Jours (1..19 sans week-ends)
const JOURS = [1,2,3,4,5,8,9,10,11,12,15,16,17,18,19];
const ENIGMES = {
  1:"J'ai un bureau mais je ne suis jamais dedans.. Qui suis-je ?",
  2:"Grâce à l'intervention de M.Albert, j'ai pu éviter une heure de colle. Qui suis-je ?",
  3:"En hiver, je porte souvent un bonnet, même s'il m'arrive de le perdre. Qui suis-je ?",
  4:"Quand j'étais petit, j'arrivais tout le temps en retard, parce que j'aimais bien qu'on me remarque ! Qui suis-je ?",
  5:"J'ai contribué à la chute du mur de Berlin. Qui suis-je ?",
  8:"Je fais toujours attention à mon style. D'ailleurs, mes lunettes sont souvent accordées a mon pull et à mes basquettes. Qui suis-je ?",
  9:"Aujourd'hui, jour particulier ! Donné le numéro de la salle de l'aumônerie. ",
  10:"Le plus beau déguisement du carnaval ? C'est moi ! Qui suis-je ?",
  11:" ",
  12:"J'ai battu un élève à Fifa.. il était doué mais je l'ai eu aux pénaltys ! Qui suis-je ?",
  15:"Je viens d'abandonner une pratique sportive en équipe pour une pratique sportive individuelle pour laquelle l'adage 'pour voyager loin il faut ménager sa monture' est plus qu'approprié. Qui suis-je ?",
  16:"Je viens d'abandonner une pratique sportive en équipe pour une pratique sportive individuelle pour laquelle l'adage 'pour voyager loin il faut ménager sa monture' est plus qu'approprié. Qui suis-je ?",
  17:"Énigme 17...",
  18:"Énigme 18...",
  19:"Énigme 19..."
};
const INDICES = {
  2: "Indice : Je ne suis pas un élève",
  3: "Indice : Je ne suis pas professeur, mais on m'appelle Mme..",
  4: "Indice : Je suis un élève",
  10: "Indice : Je ne suis pas un élève",
  11: "Indice : ",
  15: "Indice : ",
  16: "Indice : Je ne suis pas un élève",
  17: "Indice : ",
  18: "Indice : ",
  19: "Indice : "
};

/* positions visuelles */
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

function aDejaRepondu(jour) {
  return localStorage.getItem("reponse_" + jour) === "true";
}

function enregistrerReponse(jour) {
  localStorage.setItem("reponse_" + jour, "true");
}

/* ========== MODE TEST & ADMIN ========== */
/* true = mode test activé (simule jour+heure). Mettre false en prod */
let MODE_TEST = false;

/* jour et heure simulés (si MODE_TEST = true) */
let JOUR_SIMULE = 5;   // change le jour ici pour tester
let HEURE_SIMULE = 12; // change l'heure simulée

/* admin secret : appuie sur "A" pour saisir un jour (prompt) */
document.addEventListener("keydown", (e) => {
  if (e.key === "&") {
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
    // Pas encore ouvert : préciser l'heure exacte
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
  if (aDejaRepondu(jour)) {
  alert("Tu as déjà répondu pour ce jour !");
  return;
}

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
  setTimeout(()=> inputReponse.focus(), 120);
};

document.getElementById("btn-indice").onclick = () => {
  const indice = INDICES[caseOuverte];
  const bloc = document.getElementById("indice-text");

  if (!indice) {
    bloc.textContent = "Aucun indice pour ce jour.";
  } else {
    bloc.textContent = indice;
  }

  bloc.classList.remove("hidden");
  bloc.classList.add("indice-anim");
  
  setTimeout(() => bloc.classList.remove("indice-anim"), 400);
};

/* envoi de la réponse vers Google Sheets (Apps Script) */
document.getElementById("send-answer").onclick = async () => {
  if (!inputReponse.value.trim()) {
    msgReponse.textContent = "Entre une réponse.";
    return;
  }

 const payload = {
  nom: inputNom.value.trim(),
  jour: caseOuverte,
  reponse: inputReponse.value.trim()
};
  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST", // Correction de la syntaxe, retirer la virgule
      headers: {"Content-Type":"text/plain"},  // Laisser 'text/plain' pour éviter le preflight
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.status === "already") {
      msgReponse.textContent = "Tu as déjà répondu pour ce jour.";
      return;
    }
    if (data.status === "ok") {
      enregistrerReponse(caseOuverte);
      etapeEnigme.classList.add("hidden");
      etapeFini.classList.remove("hidden");
      const fl = document.querySelector(`.flake[data-jour='${caseOuverte}']`);
      if (fl) { fl.classList.add("passe"); fl.style.pointerEvents = "none"; }
      return;
    }

    msgReponse.textContent = "Erreur serveur.";
  } catch (err) {
    console.error(err);
    msgReponse.textContent = "Réponse envoyée";
    enregistrerReponse(caseOuverte);
  }

};


/* ========== NEIGE CANVAS ========== */
const canvas = document.getElementById("snow");
const ctx = canvas ? canvas.getContext("2d") : null; // Correction si canvas est null
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
  if(!ctx) return;
  for (let f of flakes){
    f.y += f.d;
    if (f.y > canvas.height){ f.y = -10; f.x = Math.random()*canvas.width; }
  }
}
/* lancer neige */
if (ctx) { // Lancer la neige seulement si le contexte est valide
    initSnow();
    setInterval(drawSnow, 33);
    window.addEventListener("resize", initSnow);
}

/* ========== UTILITAIRES ========== */
/* Pour re-générer l'affichage si tu changes manuellement MODE_TEST / JOUR_SIMULE */
function rafraichir(){
  genererFlocons();
  function marquerFloconsDejaRepondus() {
  JOURS.forEach(jour => {
    if (aDejaRepondu(jour)) {
      const fl = document.querySelector(`.flake[data-jour='${jour}']`);
      if (fl) {
        fl.classList.add("passe");
        fl.style.pointerEvents = "none";
      }
    }
  });
}
marquerFloconsDejaRepondus();
}
/* expose pour console si besoin */
window._calendrier = { genererFlocons, obtenirDateActuelle, rafraichir };
