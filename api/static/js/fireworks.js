let isAnimating = false;
let fireworks = [];
let animationStarted = false;
let isShootingFireworks

export function startFireworks() {
    if (animationStarted) return; // for preventing multiple animations from starting
    animationStarted = true;
    isShootingFireworks = true;

    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fireworks = []; 
    isAnimating = true; 

    class Firework {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.targetY = Math.random() * (canvas.height); // Target height for explosion
            this.speed = 2.2 + Math.random() * 1.5; // 5
            this.color = `hsl(${Math.random() * 360}, 100%, 70%)`;
            this.exploded = false;
            this.particles = [];
            this.trail = [];
        }

        update() {
            if (!this.exploded) {
                this.trail.push({ x: this.x, y: this.y, alpha: 0.5 });
                if (this.trail.length > 10) this.trail.shift();

                this.y -= this.speed;

                if (this.y <= this.targetY) this.explode(); 

            } else {
                this.particles.forEach(particle => particle.update());
            }
        }

        draw() {
            if (!this.exploded) {
                this.trail.forEach((trailPoint, i) => {
                    ctx.beginPath();
                    ctx.arc(trailPoint.x, trailPoint.y, 2, 0, Math.PI * 2);// 5
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = trailPoint.alpha - i * 0.03; //0.05
                    ctx.fill();
                });
                ctx.globalAlpha = 1;

                ctx.beginPath();
                ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();
            } else {
                this.particles.forEach(particle => particle.draw());
            }
        }

        explode() {
            this.exploded = true;

            const explosionSound = new Audio('../static/sounds/explosion.wav');
            explosionSound.play(); 

            const particleCount = 70 + Math.random() * 30;
            for (let i = 0; i < particleCount; i++) {
                this.particles.push(new Particle(this.x, this.y, this.color));
            }
        }
    }
    class Particle {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.size = Math.random() * 3 + 1;
            this.speed = Math.random() * 2 + 2;
            this.deceleration = 0.97; 
            this.angle = Math.random() * Math.PI * 2;
            this.alpha = 1;
            this.alphaDecay = 0.006 + Math.random() * 0.006;  
            this.gravity = 0.02;  
        
            // calculating initial velocity based on angle and speed
            this.vx = Math.cos(this.angle) * this.speed;
            this.vy = Math.sin(this.angle) * this.speed;
        }
    
        update() {
            this.vy += this.gravity; //aplying gravity to vertical speed
            
            this.vx *= this.deceleration;
            this.vy *= this.deceleration;
            
            // Update position based on velocity
            this.x += this.vx;
            this.y += this.vy;
            
            this.alpha -= this.alphaDecay;
        }
    
        draw() {
            if (this.alpha > 0) {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }
        }
    }

    let lastSpawnTime = 0;
    const fireworkInterval = 150;

    function animate(timestamp) {
        if (!isAnimating) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (isShootingFireworks) {
            if (timestamp - lastSpawnTime >= fireworkInterval) {
                spawnRandomFirework();
                lastSpawnTime = timestamp;
            }
        }

        fireworks.forEach((firework, index) => {
            firework.update();
            firework.draw();
            if (firework.exploded && firework.particles.every(p => p.alpha <= 0)) {
                fireworks.splice(index, 1);
            }
        });

        requestAnimationFrame(animate);
    }

    function spawnRandomFirework() {
        const x = Math.random() * canvas.width;
        const y = canvas.height;
        fireworks.push(new Firework(x, y));
    }

    requestAnimationFrame(animate);
}

export async function stopFireworks() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    isShootingFireworks = false;
       
    const canvas = document.getElementById('fireworksCanvas');
    const ctx = canvas.getContext('2d');

    await sleep(6000)
    isAnimating = false; 
    fireworks = [];  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
