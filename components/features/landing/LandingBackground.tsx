/**
 * 文件名: LandingBackground.tsx
 * 功能: 落地页动态背景组件，实现沉浸式视觉效果。
 * 核心逻辑:
 * 1. 使用 Canvas 绘制下雪/粒子动画。
 * 2. 实现积雪堆积和自然融化的物理效果。
 * 3. 根据页面滚动和 Footer 位置动态调整地面高度，使雪花自然落在页脚上方。
 */

import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  radius: number;
  speed: number;
  opacity: number;
  angle: number;
  spinSpeed: number;
  melting: boolean;
  meltRate: number;
}

export const LandingBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let snowflakes: Snowflake[] = [];
    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    
    // 关键变量：Footer 的高度偏移量
    let footerOffset = 0;

    // 地面高度图
    const resolution = 4; 
    let cols = Math.ceil(w / resolution);
    let groundHeight = new Float32Array(cols);

    // 获取 Footer 高度并更新画布尺寸
    const resizeCanvas = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      
      // 尝试获取页面上的 Footer 元素高度
      const footerEl = document.querySelector('footer');
      // 如果找到了 Footer，且 Footer 在视口内（简单的判断），则将地面抬高
      // 这里假设 Footer 是 Sticky 或者 Fixed 在底部的
      footerOffset = footerEl ? footerEl.clientHeight : 0;

      cols = Math.ceil(w / resolution);
      
      // 初始化地面高度：基准线是 (屏幕高度 - Footer高度)
      // 这样雪花就会落在 Footer 的上边缘
      const baseGround = h - footerOffset;
      groundHeight = new Float32Array(cols).fill(baseGround);
    };

    const createSnowflakes = (count: number) => {
      for (let i = 0; i < count; i++) {
        snowflakes.push(resetSnowflake({} as Snowflake));
      }
    };

    const resetSnowflake = (flake: Snowflake): Snowflake => {
      flake.x = Math.random() * w;
      // 从屏幕上方随机位置开始
      flake.y = Math.random() * -h; 
      
      // 大尺寸雪花
      flake.radius = Math.random() * 3 + 2; 
      
      flake.speed = Math.random() * 1 + 0.5;
      flake.opacity = Math.random() * 0.5 + 0.3;
      flake.melting = false;
      flake.meltRate = Math.random() * 0.005 + 0.002;
      
      flake.angle = Math.random() * Math.PI * 2;
      flake.spinSpeed = (Math.random() - 0.5) * 0.02;
      
      return flake;
    };

    const drawSnowflake = (ctx: CanvasRenderingContext2D, flake: Snowflake) => {
      ctx.save();
      ctx.translate(flake.x, flake.y);
      ctx.rotate(flake.angle);
      
      ctx.strokeStyle = `rgba(255, 255, 255, ${flake.opacity})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';

      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        ctx.moveTo(-flake.radius, 0);
        ctx.lineTo(flake.radius, 0);
        ctx.rotate(Math.PI / 3);
      }
      ctx.stroke();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // 地面基准线（用于判断是否在 Footer 上方）
      const baseGround = h - footerOffset;

      // 1. 地面自然融化
      for(let i = 0; i < cols; i++) {
          // 只有当积雪高于基准线时才融化（数值越小越靠上，所以是 < baseGround）
          if (groundHeight[i] < baseGround && Math.random() > 0.96) {
              groundHeight[i] += 0.3; // 塌陷
          }
      }

      snowflakes.forEach(flake => {
        const colIndex = Math.floor(flake.x / resolution);
        // 获取当前列的地面高度
        const currentGroundY = (colIndex >= 0 && colIndex < cols) ? groundHeight[colIndex] : baseGround;

        if (!flake.melting) {
          flake.y += flake.speed;
          flake.angle += flake.spinSpeed;

          // 触底检测：现在的底是 currentGroundY (即 Footer 顶部 + 积雪)
          if (flake.y + flake.radius >= currentGroundY) {
            flake.y = currentGroundY - flake.radius;
            flake.melting = true;
            
            // 堆积逻辑
            if (colIndex >= 0 && colIndex < cols) {
               // 限制最大堆积高度：比如 Footer 上方 100px
               const pileLimit = baseGround - 100; 
               
               // 只有没超过堆积限制才继续堆
               if (groundHeight[colIndex] > pileLimit) {
                   groundHeight[colIndex] -= flake.radius * 0.8; 
                   // 平滑处理
                   if(colIndex > 0) groundHeight[colIndex - 1] -= flake.radius * 0.4;
                   if(colIndex < cols - 1) groundHeight[colIndex + 1] -= flake.radius * 0.4;
               }
            }
          }
        } else {
          // 融化逻辑
          flake.opacity -= flake.meltRate;
          if (flake.opacity <= 0) {
            resetSnowflake(flake);
          }
        }

        drawSnowflake(ctx, flake);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // 初始化
    window.addEventListener('resize', resizeCanvas);
    
    // 延迟一点执行 resize，确保 React 已经把 Footer 渲染出来了
    const timer = setTimeout(() => {
        resizeCanvas();
        createSnowflakes(150); 
        animate();
    }, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0A0A0A]">
      {/* 保持原有的背景层 */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-600/15 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A/80]"></div>

      <canvas ref={canvasRef} className="absolute inset-0 z-[1]" />
    </div>
  );
};