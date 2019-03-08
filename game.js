/**************************************************\
 INIT
\**************************************************/
const domElts = {};
for(let i = 1; i <= 2; i++) {
    domElts[`player${i}`] = {};
    let playerElts = domElts[`player${i}`];

    playerElts.root = document.querySelector(`*[data-player="${i}"]`);
    playerElts.name = document.querySelector(`*[data-player="${i}"] .playerName`);
    playerElts.indicator =document.querySelector(`*[data-player="${i}"] .current`);
    playerElts.life = document.querySelector(`*[data-player="${i}"] *[data-life] .bar`);
    playerElts.strength = document.querySelector(`*[data-player="${i}"] *[data-strength] .bar`);
}


/**************************************************\
 Etat initial
\**************************************************/
let action = null;
let joueurs = {
    joueur1: {
        vie: 100,
        force: 10
    },
    joueur2: {
        vie: 100,
        force: 10
    }
};
let numeroJoueurCourant = 1;
let joueurCourant = joueurs.joueur1;
let adversaireCourant = joueurs.joueur2;

/**************************************************\
 Boucle principale : ton terrain de jeu
\**************************************************/
async function tourDeJeu() {
    if(action=="attaque"){
        attaque();
    }
    else {
        defense();
    }
    verifieStats();

    await animateAction();
    action = null;

    changerJoueurCourant();
    draw();

    if(joueurCourant.vie == 0 || adversaireCourant.vie == 0) {
        finDeJeu();
    }

    if(numeroJoueurCourant == 2 && useNai()) {
        pasTropIntelligenceArtificielle();
    }
    else if(numeroJoueurCourant == 2 && useAi()) {
        intelligenceArtificielle();
    }
}

function pasTropIntelligenceArtificielle() {
    if(Math.random() <= 0.5) {
        action = "attaque";
    }
    else {
        action = "defense";
    }
    tourDeJeu();
}

function intelligenceArtificielle() {
    const diffActuelle = joueurCourant.force - adversaireCourant.force;
    if(diffActuelle >= 20 || joueurCourant.force == 100) {
        action = "attaque";
    }
    else {
        const resAttaque = simulateAttack();
        const resDefense = simulateDefense();
        const diffAttaque = resAttaque.joueur2.force - resAttaque.joueur1.force;
        const diffDefense = resDefense.joueur2.force - resDefense.joueur1.force;
        if(diffAttaque >= diffDefense || resAttaque.joueur1.vie <= 0){
            action = "attaque";
        }
        else {
            action = "defense";
        }
    }
    tourDeJeu();
}

function attaque() {
    adversaireCourant.vie =  adversaireCourant.vie - 20 - (joueurCourant.force - adversaireCourant.force);
    joueurCourant.force = joueurCourant.force + 10;
}

function defense() {
    joueurCourant.vie = joueurCourant.vie * 1.75;
    adversaireCourant.force = adversaireCourant.force * 0.9;
    joueurCourant.force = joueurCourant.force * 1.75;
}

function verifieStats() {
    joueurCourant.vie = Math.max(Math.min(joueurCourant.vie, 100), 0);
    adversaireCourant.vie = Math.max(Math.min(adversaireCourant.vie, 100), 0);
    joueurCourant.force = Math.max(Math.min(joueurCourant.force, 100), 0);
    adversaireCourant.force = Math.max(Math.min(adversaireCourant.force, 100), 0);
}

function changerJoueurCourant() {
    adversaireCourant = joueurCourant;
    numeroJoueurCourant = (numeroJoueurCourant % 2) + 1;
    joueurCourant = joueurs[`joueur${numeroJoueurCourant}`];
}

function finDeJeu() {
    disableButtons();
}

/**************************************************\
 Outils
\**************************************************/
async function draw() {
    for(let i = 1; i <= 2; i++) {
        let playerElts = domElts[`player${i}`];
        playerElts.indicator.classList.remove('visible');
        playerElts.life.style.width = `${joueurs[`joueur${i}`].vie}%`;
        playerElts.strength.style.width = `${joueurs[`joueur${i}`].force}%`;
        playerElts.life.innerHTML = Math.round(joueurs[`joueur${i}`].vie);
        playerElts.strength.innerHTML = Math.round(joueurs[`joueur${i}`].force);
    }
    domElts[`player${numeroJoueurCourant}`].indicator.classList.add('visible');
}

async function animateAction() {
    if(action === "attaque") {
        domElts[`player${(numeroJoueurCourant%2 + 1)}`].root.classList.add("attack");
    } else {
        domElts[`player${numeroJoueurCourant}`].root.classList.add("defend");
    }

    return new Promise((resolve) => {
        disableButtons();
        setTimeout(() => {
            for(let i = 1; i <= 2; i++) {
                domElts[`player${i}`].root.classList.remove("attack", "defend");
            }
            enableButtons();
            resolve(true);
        }, 600);
    });
}

function useAi() {
    return document.querySelector('input[name="p2"]:checked').dataset.ai == "ai";
}

function useNai() {
    return document.querySelector('input[name="p2"]:checked').dataset.ai == "nai";
}

function simulateAttack() {
    const playersBu = JSON.parse(JSON.stringify(joueurs));
    attaque();
    const res = JSON.parse(JSON.stringify(joueurs));
    joueurs = playersBu;
    joueurCourant = joueurs[`joueur${numeroJoueurCourant}`];
    adversaireCourant = joueurs[`joueur${(numeroJoueurCourant%2)+1}`];
    return res;
}

function simulateDefense() {
    const playersBu = JSON.parse(JSON.stringify(joueurs));
    defense();
    const res = JSON.parse(JSON.stringify(joueurs));
    joueurs = playersBu;
    joueurCourant = joueurs[`joueur${numeroJoueurCourant}`];
    adversaireCourant = joueurs[`joueur${(numeroJoueurCourant%2)+1}`];
    return res;
}

function enableButtons() {
    [].slice.call(document.querySelectorAll('.actions button')).forEach(button => {
        button.disabled = false;;
    });
}

function disableButtons() {
    [].slice.call(document.querySelectorAll('.actions button')).forEach(button => {
        button.disabled = true;
    });
}

[].slice.call(document.querySelectorAll('.actions button')).forEach(button => {
    button.onclick = () => {
        action = button.dataset.action;
        tourDeJeu();
    };
});

draw();