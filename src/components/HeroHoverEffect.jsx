import { useEffect, useRef } from 'react'

const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform vec2 uMouse;
  uniform vec2 uVelocity;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 screen, vec2 image) {
    float screenRatio = screen.x / screen.y;
    float imageRatio = image.x / image.y;
    vec2 scale = vec2(1.0);

    if (screenRatio > imageRatio) {
      scale.y = imageRatio / screenRatio;
    } else {
      scale.x = screenRatio / imageRatio;
    }

    return (uv - 0.5) * scale + 0.5;
  }

  // --- helpers ---
  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    vec2 uv = coverUv(vUv, uResolution, uImageResolution);
    vec2 mouse = vec2(uMouse.x, 1.0 - uMouse.y);

    // Correct for screen aspect ratio so the shape is a true circle
    float aspect = uResolution.x / uResolution.y;
    vec2 delta = (vUv - mouse) * vec2(aspect, 1.0);
    float dist = length(delta);
    float influence = smoothstep(0.48, 0.0, dist) * uIntensity;

    // --- Chromatic aberration (RGB split) ---
    // Spread increases toward edge and wobbles over time
    float spread = influence * 0.022 * (1.0 + 0.4 * sin(uTime * 2.1));
    vec2 dir = normalize(delta + 0.0001);
    float r = texture2D(uTexture, clamp(uv + dir * spread, 0.0, 1.0)).r;
    float g = texture2D(uTexture, clamp(uv,                0.0, 1.0)).g;
    float b = texture2D(uTexture, clamp(uv - dir * spread, 0.0, 1.0)).b;
    vec3 color = vec3(r, g, b);

    // --- Brightness boost ---
    color *= mix(1.0, 1.35, influence);

    // --- Saturation boost ---
    float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = mix(color, mix(vec3(luma), color, 1.8), influence);

    // --- Film grain (keeps it from looking flat) ---
    float grain = rand(vUv + fract(uTime * 0.07)) * 0.06 - 0.03;
    color += grain * influence;

    gl_FragColor = vec4(clamp(color, 0.0, 1.0), influence);
  }
`

export default function HeroHoverEffect({ imageUrl, videoUrl }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const hero = mount?.parentElement

    if (!mount || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let disposed = false
    let cleanupThree = () => {}

    import('three').then((THREE) => {
      if (disposed) return

      const uniforms = {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uImageResolution: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
      }

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
      mount.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        depthTest: false,
      })
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
      scene.add(mesh)

      let video = null
      let texture = null

      if (videoUrl) {
        video = document.createElement('video')
        video.src = videoUrl
        video.muted = true
        video.loop = true
        video.playsInline = true
        video.autoplay = true
        video.preload = 'auto'
        video.addEventListener('loadedmetadata', () => {
          uniforms.uImageResolution.value.set(video.videoWidth || 16, video.videoHeight || 9)
        })
        video.play().catch(() => {})
        texture = new THREE.VideoTexture(video)
      } else {
        const textureLoader = new THREE.TextureLoader()
        texture = textureLoader.load(imageUrl, (loadedTexture) => {
          const image = loadedTexture.image
          uniforms.uImageResolution.value.set(image.naturalWidth || image.width, image.naturalHeight || image.height)
        })
      }

      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.LinearFilter
      texture.magFilter = THREE.LinearFilter
      uniforms.uTexture.value = texture

      const resize = () => {
        const { width, height } = hero.getBoundingClientRect()
        renderer.setSize(width, height, false)
        uniforms.uResolution.value.set(width, height)
      }

      let previousMouse = null

      const updateMouse = (event) => {
        const rect = hero.getBoundingClientRect()
        const nextMouse = new THREE.Vector2(
          (event.clientX - rect.left) / rect.width,
          (event.clientY - rect.top) / rect.height
        )

        if (previousMouse) {
          uniforms.uVelocity.value.copy(nextMouse).sub(previousMouse)
        }

        uniforms.uMouse.value.copy(nextMouse)
        previousMouse = nextMouse
      }

      let hovered = false
      let frameId = 0
      const clock = new THREE.Clock()

      const animate = () => {
        uniforms.uTime.value = clock.getElapsedTime()
        const target = hovered ? 1 : 0
        uniforms.uIntensity.value += (target - uniforms.uIntensity.value) * 0.08
        uniforms.uVelocity.value.multiplyScalar(0.92)
        renderer.render(scene, camera)
        frameId = window.requestAnimationFrame(animate)
      }

      const handlePointerEnter = (event) => {
        hovered = true
        previousMouse = null
        updateMouse(event)
        hero.classList.add('hero--fx-active')
      }

      const handlePointerMove = (event) => {
        updateMouse(event)
      }

      const handlePointerLeave = () => {
        hovered = false
        hero.classList.remove('hero--fx-active')
      }

      const observer = new ResizeObserver(resize)
      observer.observe(hero)
      resize()
      animate()

      hero.addEventListener('pointerenter', handlePointerEnter)
      hero.addEventListener('pointermove', handlePointerMove)
      hero.addEventListener('pointerleave', handlePointerLeave)

      cleanupThree = () => {
        window.cancelAnimationFrame(frameId)
        observer.disconnect()
        hero.removeEventListener('pointerenter', handlePointerEnter)
        hero.removeEventListener('pointermove', handlePointerMove)
        hero.removeEventListener('pointerleave', handlePointerLeave)
        hero.classList.remove('hero--fx-active')
        if (video) {
          video.pause()
          video.removeAttribute('src')
          video.load()
        }
        texture.dispose()
        material.dispose()
        mesh.geometry.dispose()
        renderer.dispose()
        renderer.domElement.remove()
      }
    })

    return () => {
      disposed = true
      cleanupThree()
    }
  }, [imageUrl, videoUrl])

  return <div className="hero-fx" ref={mountRef} aria-hidden="true" />
}
