// Digira Esports - Hero Section Three.js Animations

(function() {
  'use strict';

  // ========================================
  // Three.js Scene Setup
  // ========================================
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  let scene, camera, renderer;
  let particles, particleSystem;
  let mouseX = 0, mouseY = 0;
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  let animationId;

  // Check if Three.js is loaded
  if (typeof THREE === 'undefined') {
    console.error('Three.js library not loaded. Please check the CDN link.');
    return;
  }

  // Initialize Three.js scene
  function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Create particle system
    createParticleSystem();

    // Create floating geometric shapes
    createGeometricShapes();

    // Create animated grid lines
    createGridLines();

    // Event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);

    // Start animation loop
    animate();
  }

  // ========================================
  // Particle System (Animation 1)
  // ========================================
  function createParticleSystem() {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const color1 = new THREE.Color(0x1e88d9); // Main blue
    const color2 = new THREE.Color(0x5bb7f2); // Light blue

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Position
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;

      // Color (interpolate between blue shades)
      const colorMix = Math.random();
      const color = new THREE.Color().lerpColors(color1, color2, colorMix);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: new THREE.Vector2(0, 0) }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        uniform vec2 mouse;
        
        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Animate particles in wave pattern
          pos.x += sin(time * 0.5 + position.y * 0.1) * 0.5;
          pos.y += cos(time * 0.3 + position.x * 0.1) * 0.5;
          
          // Mouse interaction
          float dist = distance(pos.xy, mouse * 10.0);
          pos.xy += normalize(pos.xy - mouse * 10.0) * (1.0 / (dist + 1.0)) * 2.0;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          gl_FragColor = vec4(vColor, alpha * 0.6);
        }
      `,
      transparent: true,
      vertexColors: true
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  // ========================================
  // Floating Geometric Shapes (Animation 2)
  // ========================================
  function createGeometricShapes() {
    const shapes = [];
    const shapeCount = 8;

    for (let i = 0; i < shapeCount; i++) {
      let geometry;
      const rand = Math.random();

      if (rand < 0.33) {
        geometry = new THREE.TetrahedronGeometry(0.3, 0);
      } else if (rand < 0.66) {
        geometry = new THREE.OctahedronGeometry(0.3, 0);
      } else {
        geometry = new THREE.IcosahedronGeometry(0.3, 0);
      }

      const material = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0x1e88d9 : 0x5bb7f2,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      });

      const mesh = new THREE.Mesh(geometry, material);
      
      // Random position
      mesh.position.set(
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10
      );

      // Store animation properties
      mesh.userData = {
        speed: Math.random() * 0.02 + 0.01,
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.02
        },
        amplitude: Math.random() * 2 + 1
      };

      shapes.push(mesh);
      scene.add(mesh);
    }

    // Store shapes for animation
    scene.userData.shapes = shapes;
  }

  // ========================================
  // Animated Grid Lines (Animation 3)
  // ========================================
  function createGridLines() {
    const gridHelper = new THREE.GridHelper(20, 20, 0x1e88d9, 0x1e88d9);
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Create animated lines
    const lineGeometry = new THREE.BufferGeometry();
    const lineCount = 50;
    const positions = new Float32Array(lineCount * 6);

    for (let i = 0; i < lineCount; i++) {
      const i6 = i * 6;
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 10;

      positions[i6] = x;
      positions[i6 + 1] = y;
      positions[i6 + 2] = z;
      positions[i6 + 3] = x + (Math.random() - 0.5) * 2;
      positions[i6 + 4] = y + (Math.random() - 0.5) * 2;
      positions[i6 + 5] = z + (Math.random() - 0.5) * 2;
    }

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x5bb7f2,
      transparent: true,
      opacity: 0.2
    });

    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
    scene.userData.lines = lines;
  }

  // ========================================
  // Animation Loop
  // ========================================
  function animate() {
    animationId = requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Animate particles
    if (particleSystem) {
      particleSystem.material.uniforms.time.value = time;
      particleSystem.material.uniforms.mouse.value.set(
        (mouseX / window.innerWidth) * 2 - 1,
        -(mouseY / window.innerHeight) * 2 + 1
      );
      particleSystem.rotation.y += 0.0005;
    }

    // Animate geometric shapes
    if (scene.userData.shapes) {
      scene.userData.shapes.forEach((shape, index) => {
        shape.rotation.x += shape.userData.rotationSpeed.x;
        shape.rotation.y += shape.userData.rotationSpeed.y;
        shape.rotation.z += shape.userData.rotationSpeed.z;

        // Floating animation
        shape.position.y += Math.sin(time * shape.userData.speed + index) * 0.01;
        shape.position.x += Math.cos(time * shape.userData.speed * 0.7 + index) * 0.01;

        // Mouse interaction
        const mouseInfluence = 0.5;
        const dx = (mouseX / window.innerWidth - 0.5) * mouseInfluence;
        const dy = -(mouseY / window.innerHeight - 0.5) * mouseInfluence;
        shape.position.x += dx * 0.01;
        shape.position.y += dy * 0.01;
      });
    }

    // Animate camera (subtle movement)
    camera.position.x += (mouseX * 0.0001 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 0.0001 - camera.position.y) * 0.05;

    renderer.render(scene, camera);
  }

  // ========================================
  // Event Handlers
  // ========================================
  function onMouseMove(event) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
  }

  function onTouchMove(event) {
    if (event.touches.length > 0) {
      mouseX = event.touches[0].clientX - windowHalfX;
      mouseY = event.touches[0].clientY - windowHalfY;
    }
  }

  function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  // ========================================
  // Cleanup on page unload
  // ========================================
  window.addEventListener('beforeunload', () => {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    window.removeEventListener('resize', onWindowResize);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('touchmove', onTouchMove);
  });

  // Initialize when DOM is ready and Three.js is loaded
  function checkAndInit() {
    if (typeof THREE !== 'undefined' && document.getElementById('hero-canvas')) {
      init();
    } else if (typeof THREE === 'undefined') {
      // Retry after a short delay if Three.js hasn't loaded yet
      setTimeout(checkAndInit, 100);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInit);
  } else {
    checkAndInit();
  }
})();

