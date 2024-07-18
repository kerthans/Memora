document.addEventListener('DOMContentLoaded', function() {
    const popup = document.getElementById('popup');
    const innerContent = document.getElementById('inner-content');
    const logo = document.getElementById('logo');
    const greeting = document.getElementById('greeting');
    const strengthSlider = document.getElementById('strength-slider');
    const statusInfo = document.getElementById('status-info');
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    const colors = {
        light: ['#E6E6FA', '#8A2BE2', '#4B0082'],
        dark: ['#4B0082', '#8A2BE2', '#E6E6FA']
    };

    let currentMode = 'light';
    let particles = [];
    let isMemorizing = true;

    // 设置canvas尺寸
    canvas.width = innerContent.offsetWidth;
    canvas.height = innerContent.offsetHeight;

    // 粒子类
    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.size > 0.2) this.size -= 0.1;
        }
        draw() {
            ctx.fillStyle = 'rgba(255,255,255,0.8)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 创建粒子
    function createParticles(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(x, y));
        }
    }

    // 更新和绘制粒子
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            if (particles[i].size <= 0.2) {
                particles.splice(i, 1);
                i--;
            }
        }
        requestAnimationFrame(animateParticles);
    }

    // 监听鼠标移动
    canvas.addEventListener('mousemove', createParticles);

    // 开始动画
    animateParticles();

    // 打字效果函数
    function typeWriter(text, element, index = 0) {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            setTimeout(() => typeWriter(text, element, index + 1), 100);
        }
    }

    // 初始化打字效果
    typeWriter("Hi I'm your Memora", greeting);

    // 更新颜色函数
    function updateColors() {
        const value = parseInt(strengthSlider.value);
        const currentColor = colors[currentMode][value];
        const nextColor = colors[currentMode][value + 1] || colors[currentMode][value];
        document.documentElement.style.setProperty('--bg-color', currentColor);
        document.documentElement.style.setProperty('--slider-color-start', currentColor);
        document.documentElement.style.setProperty('--slider-color-end', nextColor);
        document.documentElement.style.setProperty('--slider-thumb-color', currentColor);
        document.documentElement.style.setProperty('--bg-color-start', currentColor);
        document.documentElement.style.setProperty('--bg-color-end', nextColor);
    }

    // 初始化颜色
    updateColors();

    // 监听滑块变化
    strengthSlider.addEventListener('input', updateColors);

    // 状态切换
    statusInfo.addEventListener('click', function() {
        isMemorizing = !isMemorizing;
        logo.style.opacity = '0';
        setTimeout(() => {
            logo.src = isMemorizing ? 
                "./images/cute.png":
                "./images/black.png";
            logo.style.opacity = '1';
        }, 250);

        statusInfo.classList.add('fade-out');
        setTimeout(() => {
            statusInfo.textContent = isMemorizing ? "记忆中" : "停止记忆";
            statusInfo.classList.remove('fade-out');
            statusInfo.classList.add('fade-in');
        }, 150);
        setTimeout(() => {
            statusInfo.classList.remove('fade-in');
        }, 300);
    });

    // 添加按钮悬浮效果
    statusInfo.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });

    statusInfo.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });

    // 添加按钮点击效果
    statusInfo.addEventListener('mousedown', function() {
        this.style.transform = 'scale(0.95)';
    });

    statusInfo.addEventListener('mouseup', function() {
        this.style.transform = 'scale(1.05)';
    });
});