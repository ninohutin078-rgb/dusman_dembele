document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. GESTION DE LA NAVIGATION DYNAMIQUE
    // ==========================================
    const nav = document.createElement("nav");
    nav.className = "floating-nav";
    
    const currentUser = localStorage.getItem('currentUser');
    const authLabel = currentUser ? `👑 ${currentUser}` : "ACCÈS MEMBRE";

    nav.innerHTML = `
      <div class="nav-logo">DEMBÉLÉ</div>
      <ul class="nav-links">
        <li data-target="clubs">Clubs</li>
        <li data-target="bio">Biographie</li>
        <li data-target="stats">Stats</li>
        <li data-target="salary">Salaire</li>
		<li data-target="Photos">Photos</li>
        <li id="nav-auth" style="
          background: ${currentUser ? 'rgba(255, 215, 0, 0.2)' : 'linear-gradient(45deg, #FFD700, #B8860B)'};
          color: ${currentUser ? '#FFD700' : 'black'};
          margin-left: 20px; 
          padding: 8px 15px; 
          border-radius: 20px; 
          cursor: pointer;
          font-weight: bold;">${authLabel}</li>
      </ul>
    `;
    document.body.appendChild(nav);

    // Défilement fluide (Scroll)
    document.querySelectorAll(".nav-links li").forEach(item => {
        item.addEventListener("click", () => {
            const target = item.getAttribute("data-target");
            if (!target) return; // Évite l'erreur sur le bouton auth

            let element;
            if (target === "clubs") element = document.querySelector(".content");
            if (target === "bio") element = document.querySelector(".bio");
            if (target === "stats") element = document.querySelector(".stats-card");
            if (target === "salary") element = document.getElementById("salary");
			if (target === "Photos") element = document.getElementById("Photos");

            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Redirection Auth
    document.getElementById("nav-auth").addEventListener("click", () => {
        window.location.href = "auth.html";
    });

  // 4. GESTION DU CLIC CONNEXION / DÉCONNEXION
  document.getElementById('nav-auth').addEventListener('click', () => {
    if (currentUser) {
      if (confirm(`Souhaitez-vous vous déconnecter, ${currentUser} ?`)) {
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('welcomeShown');
        window.location.reload();
      }
    } else {
      window.location.href = 'auth.html';
    }
  });

  // 5. GESTION DU SCROLL
  document.querySelectorAll(".nav-links li[data-target]").forEach(item => {
    item.addEventListener("click", () => {
      clickSound.currentTime = 0;
      clickSound.play();
      const target = item.dataset.target;
      let element;
      if (target === "clubs") element = document.querySelector(".content");
      if (target === "bio") element = document.querySelector(".bio");
      if (target === "stats") element = document.querySelector(".stats-card");
      if (target === "salary") element = document.getElementById("salary");
      if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // 6. SYSTÈME DE FEUX D'ARTIFICE
  const canvas = document.getElementById('intro-fireworks');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Particle {
    constructor(x, y, color, velocity) {
      this.x = x; this.y = y; this.color = color; this.velocity = velocity;
      this.alpha = 1; this.decay = 0.02 + Math.random() * 0.02;
    }
    update() { this.x += this.velocity.x; this.y += this.velocity.y; this.alpha -= this.decay; }
    draw() { ctx.globalAlpha = this.alpha; ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); }
  }

  let particles = [];
  function createFirework() {
    const x = Math.random() * canvas.width * 0.8 + canvas.width * 0.1;
    const y = Math.random() * canvas.height * 0.5 + canvas.height * 0.1;
    for (let i = 0; i < 60; i++) {
      const angle = Math.random() * 2 * Math.PI;
      const speed = Math.random() * 5 + 2;
      particles.push(new Particle(x, y, 'gold', { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed }));
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => { p.update(); p.draw(); if (p.alpha <= 0) particles.splice(i, 1); });
    requestAnimationFrame(animate);
  }
  animate();
  const fireworkInterval = setInterval(createFirework, 500);

  // 7. DÉCLENCHEMENT DE L'AFFICHAGE ET JEU
  setTimeout(() => {
    clearInterval(fireworkInterval);
    nav.classList.remove("nav-cinematic-hidden");
    nav.classList.add("nav-cinematic-show");

    document.querySelectorAll(".content, .bio, .stats-card, #salary").forEach((sec, i) => {
      setTimeout(() => sec.classList.add("cinematic-show"), i * 300);
    });

    // --- LOGIQUE MEMBRE (VIDÉO + JEU) ---
    const videoSection = document.getElementById('member-video-section');
    const gameContainer = document.getElementById('game-container');

    if (currentUser) {
      // Afficher la vidéo
      if (videoSection) {
        videoSection.style.display = 'block';
        setTimeout(() => videoSection.classList.add("cinematic-show"), 1200);
      }
      
      // Afficher et lancer le jeu
      if (gameContainer) {
        gameContainer.style.display = 'block';
        setTimeout(() => gameContainer.classList.add("cinematic-show"), 1000);
        initFootballGame();
      }

      if (!sessionStorage.getItem('welcomeShown')) {
        showWelcomeMessage(currentUser);
      }
    }
  }, 3000);

  // 8. FONCTION DU JEU
  function initFootballGame() {
    let score = 0;
    const ball = document.getElementById('ball');
    const keeper = document.getElementById('goalkeeper');
    const gameMsg = document.getElementById('game-msg');
    const scoreVal = document.getElementById('score-val');
    const goal = document.getElementById('goal');

    // Mouvement du gardien Ousmane
    setInterval(() => {
        const movePos = 30 + Math.random() * 40; 
        if(keeper) keeper.style.left = movePos + '%';
    }, 800);

    if (goal && ball) {
        // On tire là où on clique dans la cage
        goal.addEventListener('click', (e) => {
            if (ball.style.bottom === '350px') return; // Anti-spam

            const rect = goal.getBoundingClientRect();
            const clickX = e.clientX - (rect.left + rect.width / 2); 

            // Animation du tir
            ball.style.bottom = '350px';
            ball.style.transform = `translateX(calc(-50% + ${clickX}px)) scale(0.6) rotate(720deg)`;

            setTimeout(() => {
                const keeperRect = keeper.getBoundingClientRect();
                const ballRect = ball.getBoundingClientRect();

                // Détection de collision précise avec l'image
                const isCaught = (
                    ballRect.left < keeperRect.right &&
                    ballRect.right > keeperRect.left &&
                    ballRect.top < keeperRect.bottom &&
                    ballRect.bottom > keeperRect.top
                );

                if (!isCaught) {
                    score++;
                    scoreVal.innerText = score;
                    gameMsg.innerText = "GOOOOAL ! ⚽🔥";
                    gameMsg.style.color = "#FFD700";
                } else {
                    gameMsg.innerText = "ARRÊT D'OUSMANE ! 🧤🛑";
                    gameMsg.style.color = "#FF4500";
                }

                // Reset
                setTimeout(() => {
                    ball.style.bottom = '40px';
                    ball.style.transform = 'translateX(-50%) scale(1) rotate(0deg)';
                    gameMsg.innerText = "";
                }, 1200);
            }, 600);
        });
    }
}

  // 9. GÉNÉRATION STATS
  const careerStats = { "Matchs": 392, "Buts": 110, "Passes D.": 98, "Ballon d'Or": "2025" };
  const statsCard = document.createElement("div");
  statsCard.className = "stats-card cinematic-hidden";
  statsCard.innerHTML = `<h2>📊 Statistiques</h2><div class="stats-content"></div>`;
  for (const [label, value] of Object.entries(careerStats)) {
    statsCard.querySelector(".stats-content").innerHTML += `
      <div class="stat-line"><span class="stat-label">${label}</span><span class="stat-value">${value}</span></div>
    `;
  }
  const container = document.getElementById("stats-container") || document.body;
  container.appendChild(statsCard);
});

function showWelcomeMessage(user) {
  const welcomeMsg = document.createElement('div');
  welcomeMsg.style.cssText = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:rgba(0,0,0,0.95); border:2px solid gold; padding:40px; border-radius:30px; z-index:20000; text-align:center; color:gold; box-shadow:0 0 100px gold;";
  welcomeMsg.innerHTML = `
    <h1 style="margin:0 0 20px 0;">👑 Salut, ${user} !</h1>
    <p style="font-size:1.2rem; color:white;">Le contenu exclusif Ballon d'Or est débloqué tout en bas de la page.</p>
    <button id="close-welcome" style="background:gold; border:none; padding:12px 25px; border-radius:15px; cursor:pointer; font-weight:900; margin-top:20px;">DÉCOUVRIR</button>
  `;
  document.body.appendChild(welcomeMsg);
  document.getElementById('close-welcome').onclick = () => {
    welcomeMsg.remove();
    sessionStorage.setItem('welcomeShown', 'true');
  };
}

// À ajouter à la fin de votre fichier java.js
const boCard = document.querySelector('.trophy-card:has(img[src*="Bo.jpg"])');
if (boCard) {
    setInterval(() => {
        boCard.style.boxShadow = "0 0 50px gold";
        setTimeout(() => {
            boCard.style.boxShadow = "0 10px 30px rgba(255, 215, 0, 0.2)";
        }, 500);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- SYSTÈME DE FEUX D'ARTIFICE PRESTIGE OR ---
    function launchGoldFireworks() {
        const canvas = document.createElement('canvas');
        canvas.style.position = "fixed";
        canvas.style.top = "0";
        canvas.style.left = "0";
        canvas.style.width = "100vw";
        canvas.style.height = "100vh";
        canvas.style.zIndex = "0"; // Derrière les cartes, devant le fond fd.jpg
        canvas.style.pointerEvents = "none";
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor(x, y) {
                this.x = x;
                this.y = y;
                // Palette de couleurs uniquement Or
                const goldTones = ['#FFD700', '#DAA520', '#B8860B', '#FFFACD', '#E6BE8A'];
                this.color = goldTones[Math.floor(Math.random() * goldTones.length)];
                this.velocity = {
                    x: (Math.random() - 0.5) * 7,
                    y: (Math.random() - 0.5) * 7
                };
                this.alpha = 1;
                this.decay = Math.random() * 0.01 + 0.008; // Durée de vie
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                // Petit éclat lumineux autour des grains d'or
                ctx.shadowBlur = 5;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }

            update() {
                this.velocity.y += 0.05; // Gravité
                this.x += this.velocity.x;
                this.y += this.velocity.y;
                this.alpha -= this.decay;
            }
        }

        function createExplosion() {
            const x = Math.random() * canvas.width;
            const y = Math.random() * (canvas.height * 0.6);
            const count = 35; // Nombre de particules par explosion
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(x, y));
            }
        }

        function animate() {
            // clearRect permet de garder fd.jpg visible
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach((p, i) => {
                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                } else {
                    p.update();
                    p.draw();
                }
            });
            requestAnimationFrame(animate);
        }

        animate();
        // Intervalle réglé pour un flux régulier et festif
        setInterval(createExplosion, 700); 
    }

    launchGoldFireworks();
});


// Fonction pour animer le comptage des chiffres
function animateCount(element, target) {
    let current = 0;
    const duration = 1500; // Durée de l'animation en millisecondes
    const increment = target / (duration / 10); // Incrémenter toutes les 10ms

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            clearInterval(timer);
            element.innerText = formatNumber(target) + element.dataset.suffix;
        } else {
            element.innerText = formatNumber(Math.floor(current)) + element.dataset.suffix;
        }
    }, 10);
}

// Fonction utilitaire pour formater les nombres avec des séparateurs de milliers
function formatNumber(num) {
    return num.toLocaleString('fr-FR');
}

// Démarrer l'animation une fois que le DOM est chargé
document.addEventListener("DOMContentLoaded", () => {
    const salaryElements = document.querySelectorAll('.salary-amount');
    
    // Animer chaque montant
    salaryElements.forEach(element => {
        const target = parseInt(element.dataset.target, 10);
        animateCount(element, target);
    });
});

function move(direction) {
    const banner = document.getElementById('banner');
    
    // On retire la classe active pour reset si déjà en cours
    banner.classList.remove('active');
    
    // On force un petit "reflow" pour que le navigateur voit le changement
    void banner.offsetWidth; 
    
    // On définit la direction et on lance
    if (direction === 'left') {
        banner.style.animationName = 'scrollLeft';
    } else {
        banner.style.animationName = 'scrollRight';
    }
    
    banner.classList.add('active');
}

function stopBanner() {
    const banner = document.getElementById('banner');
    banner.classList.remove('active');
    banner.style.animationName = 'none';
}

let currentPos = 0;
let speed = 0; // 0 = stop, positif = droite, négatif = gauche
let animationId = null;

function updateAnimation() {
    const banner = document.getElementById('banner');
    const cardWidth = 280; // 250px + 30px de marge
    const resetPoint = cardWidth * 6; // On reset après 6 images

    currentPos += speed;

    // Boucle infinie fluide
    if (Math.abs(currentPos) >= resetPoint) {
        currentPos = 0;
    }

    banner.style.transform = `translateX(${currentPos}px)`;
    animationId = requestAnimationFrame(updateAnimation);
}

function startScrolling(direction) {
    // On règle la vitesse (augmente le chiffre pour plus de rapidité)
    speed = (direction === 'left') ? -2 : 2;
    
    // On ne lance l'animation que si elle n'est pas déjà en cours
    if (!animationId) {
        updateAnimation();
    }
}

function stopScrolling() {
    speed = 0;
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}


let currentPosX = 0;
let moveSpeed = 0; 
let animationFrameId = null;

function updateScroll() {
    const banner = document.getElementById('banner');
    if (!banner) return;

    // Récupère toutes les photos du premier groupe (les 6 premières)
    const allCards = banner.querySelectorAll('.photo-card');
    const firstGroupCount = allCards.length / 2;
    
    // Calcul de la largeur d'une seule photo + le gap (espacement)
    // On utilise la première carte pour être précis
    const cardWidth = allCards[0].offsetWidth; 
    const gap = 30; // Doit correspondre au gap défini dans ton CSS
    
    // La distance totale d'un groupe avant la répétition
    const resetPoint = (cardWidth + gap) * firstGroupCount;

    currentPosX += moveSpeed;

    // GESTION DE LA BOUCLE "PLUS TÔT"
    if (moveSpeed < 0) { // Défilement vers la gauche
        if (Math.abs(currentPosX) >= resetPoint) {
            currentPosX = 0; // On revient au début sans que ça se voie
        }
    } else if (moveSpeed > 0) { // Défilement vers la droite
        if (currentPosX >= 0) {
            currentPosX = -resetPoint; // On saute à la fin du premier groupe
        }
    }

    banner.style.transform = `translateX(${currentPosX}px)`;
    animationFrameId = requestAnimationFrame(updateScroll);
}

function startScrolling(direction) {
    moveSpeed = (direction === 'left') ? -3 : 3; // Augmenté à 3 pour plus de fluidité
    if (!animationFrameId) {
        updateScroll();
    }
}

function stopScrolling() {
    moveSpeed = 0;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

