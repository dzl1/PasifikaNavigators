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
  uniform float uTime;
  uniform float uIntensity;
  uniform float uProgress;
  uniform float uSeed;
  varying vec2 vUv;

  float rand(vec2 co) {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float sweepMask(vec2 uv, float front, float width) {
    float diagonal = ((1.0 - uv.x) + (1.0 - uv.y)) * 0.5;
    float leadingEdge = smoothstep(width, 0.0, abs(diagonal - front));
    float trailingWake = smoothstep(width * 2.35, 0.0, front - diagonal) * step(diagonal, front);
    return max(leadingEdge, trailingWake * 0.42);
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);

    float sweep = smoothstep(0.0, 1.0, uProgress);
    float diagonalBand = sweepMask(uv, sweep, 0.16);
    float sharpEdge = sweepMask(uv, clamp(sweep + 0.06, 0.0, 1.0), 0.045);

    vec2 columnGrid = vec2(46.0 * aspect, 34.0);
    float column = floor(uv.x * columnGrid.x);
    float columnSeed = rand(vec2(column, uSeed * 13.0));
    float columnGate = smoothstep(0.22, 0.9, rand(vec2(column, floor(uProgress * 9.0) + uSeed * 17.0)));

    float fallHead = fract(columnSeed + uTime * mix(0.13, 0.32, columnSeed) + uProgress * 0.26);
    float trailLength = mix(0.14, 0.34, rand(vec2(column, uSeed * 5.0)));
    float head = smoothstep(0.035, 0.0, abs(uv.y - fallHead));
    float trail = smoothstep(trailLength, 0.0, fallHead - uv.y) * step(uv.y, fallHead);
    float rainColumn = max(head, trail * 0.58) * columnGate;
    float band = max(diagonalBand * rainColumn, sharpEdge * 0.5);

    vec2 blockCount = vec2(42.0 * aspect, 34.0);
    vec2 block = floor(uv * blockCount);
    float blockNoise = rand(block + floor(uTime * 5.0) + uSeed * 41.0);
    float glyphPulse = step(0.38, rand(vec2(block.x, block.y + floor(uTime * 3.0) + uSeed)));
    float activeBlock = step(0.35, blockNoise) * glyphPulse * band;

    float microNoise = rand(block * 1.73 + uSeed + floor(uTime * 6.0));
    vec2 pixelSize = mix(vec2(1.0 / 64.0), vec2(1.0 / 22.0), microNoise) * vec2(1.0 / aspect, 1.0);
    vec2 pixelUv = floor(uv / pixelSize) * pixelSize + pixelSize * 0.5;

    float rowNoise = rand(vec2(floor(uv.y * 44.0), uSeed + floor(uTime * 4.0)));
    float xShift = (rowNoise - 0.5) * 0.055 * activeBlock * uIntensity;
    vec2 shiftedUv = clamp(pixelUv + vec2(xShift, 0.0), 0.0, 1.0);

    vec3 baseColor = texture2D(uTexture, uv).rgb;
    vec3 pixelColor = texture2D(uTexture, shiftedUv).rgb;

    float rgbSplit = 0.006 * activeBlock * uIntensity;
    pixelColor.r = texture2D(uTexture, clamp(shiftedUv + vec2(rgbSplit, 0.0), 0.0, 1.0)).r;
    pixelColor.b = texture2D(uTexture, clamp(shiftedUv - vec2(rgbSplit, 0.0), 0.0, 1.0)).b;

    float flash = step(0.9, rand(block + uSeed * 9.0 + floor(uTime * 5.0)));
    vec3 matrixTint = vec3(0.28, 1.0, 0.58);
    pixelColor = mix(pixelColor, max(pixelColor, matrixTint), activeBlock * 0.42);
    pixelColor += flash * activeBlock * vec3(0.08, 0.26, 0.13);

    float edge = smoothstep(0.0, 0.08, uv.y) * smoothstep(1.0, 0.92, uv.y);
    float alpha = clamp(activeBlock * uIntensity * edge * 0.74, 0.0, 0.82);
    vec3 color = mix(baseColor, pixelColor, clamp(activeBlock * 0.95, 0.0, 1.0));

    gl_FragColor = vec4(color, alpha);
  }
`

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

export default function HeroPixelGlitchEffect({ videoRef }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    const video = videoRef?.current
    const hero = mount?.parentElement

    if (!mount || !video || !hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    let disposed = false
    let cleanupThree = () => {}

    import('three').then((THREE) => {
      if (disposed) return

      const uniforms = {
        uTexture: { value: null },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uProgress: { value: 0 },
        uSeed: { value: Math.random() * 100 },
      }

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      mount.appendChild(renderer.domElement)

      const texture = new THREE.VideoTexture(video)
      texture.colorSpace = THREE.SRGBColorSpace
      texture.minFilter = THREE.NearestFilter
      texture.magFilter = THREE.NearestFilter
      uniforms.uTexture.value = texture

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

      const resize = () => {
        const { width, height } = hero.getBoundingClientRect()
        renderer.setSize(width, height, false)
        uniforms.uResolution.value.set(width, height)
      }

      let frameId = 0
      let timerId = 0
      let burst = null
      const clock = new THREE.Clock()

      const scheduleBurst = () => {
        window.clearTimeout(timerId)
        timerId = window.setTimeout(() => {
          burst = {
            start: clock.getElapsedTime(),
            duration: randomBetween(5, 8),
          }
          uniforms.uSeed.value = Math.random() * 100
          hero.classList.add('hero--pixel-active')
        }, randomBetween(1, 5) * 1000)
      }

      const animate = () => {
        const elapsed = clock.getElapsedTime()
        uniforms.uTime.value = elapsed
        texture.needsUpdate = true

        let target = 0

        if (burst) {
          const progress = (elapsed - burst.start) / burst.duration
          uniforms.uProgress.value = progress

          if (progress >= 1) {
            burst = null
            hero.classList.remove('hero--pixel-active')
            scheduleBurst()
          } else {
            const envelope = smoothstep(0, 0.16, progress) * (1 - smoothstep(0.82, 1, progress))
            const jitter = 0.72 + Math.sin(elapsed * 5.0) * 0.12 + Math.sin(elapsed * 8.5) * 0.08
            target = Math.max(0, envelope * jitter)
          }
        }

        uniforms.uIntensity.value += (target - uniforms.uIntensity.value) * 0.07
        renderer.render(scene, camera)
        frameId = window.requestAnimationFrame(animate)
      }

      const observer = new ResizeObserver(resize)
      observer.observe(hero)
      resize()
      scheduleBurst()
      animate()

      cleanupThree = () => {
        window.cancelAnimationFrame(frameId)
        window.clearTimeout(timerId)
        observer.disconnect()
        hero.classList.remove('hero--pixel-active')
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
  }, [videoRef])

  return <div className="hero-pixel-fx" ref={mountRef} aria-hidden="true" />
}
