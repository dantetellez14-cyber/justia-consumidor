"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { cn } from "@/lib/utils"

export function ShaderAnimation({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    camera: THREE.Camera
    scene: THREE.Scene
    renderer: THREE.WebGLRenderer
    uniforms: Record<string, THREE.IUniform>
    animationId: number
  } | null>(null)
  const [webglFailed, setWebglFailed] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current

    const vertexShader = `
      void main() {
        gl_Position = vec4( position, 1.0 );
      }
    `

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
        float t = time*0.05;
        float lineWidth = 0.002;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i=0; i < 5; i++){
            color[j] += lineWidth*float(i*i) / abs(fract(t - 0.01*float(j)+float(i)*0.01)*5.0 - length(uv) + mod(uv.x+uv.y, 0.2));
          }
        }

        gl_FragColor = vec4(color[0],color[1],color[2],1.0);
      }
    `

    try {
      // Test WebGL availability before initializing Three.js
      const testCanvas = document.createElement("canvas")
      const gl = testCanvas.getContext("webgl") ?? testCanvas.getContext("experimental-webgl")
      if (!gl) throw new Error("WebGL not available")

      const camera = new THREE.Camera()
      camera.position.z = 1

      const scene = new THREE.Scene()
      const geometry = new THREE.PlaneGeometry(2, 2)

      const uniforms: Record<string, THREE.IUniform> = {
        time: { value: 1.0 },
        resolution: { value: new THREE.Vector2() },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setPixelRatio(window.devicePixelRatio)
      container.appendChild(renderer.domElement)

      const onWindowResize = () => {
        const width = container.clientWidth
        const height = container.clientHeight
        renderer.setSize(width, height)
        uniforms.resolution.value.x = renderer.domElement.width
        uniforms.resolution.value.y = renderer.domElement.height
      }

      onWindowResize()
      window.addEventListener("resize", onWindowResize, false)

      sceneRef.current = { camera, scene, renderer, uniforms, animationId: 0 }

      const animate = () => {
        const animationId = requestAnimationFrame(animate)
        uniforms.time.value += 0.05
        renderer.render(scene, camera)
        if (sceneRef.current) {
          sceneRef.current.animationId = animationId
        }
      }

      animate()

      return () => {
        window.removeEventListener("resize", onWindowResize)
        if (sceneRef.current) {
          cancelAnimationFrame(sceneRef.current.animationId)
          if (
            container &&
            sceneRef.current.renderer.domElement.parentNode === container
          ) {
            container.removeChild(sceneRef.current.renderer.domElement)
          }
          sceneRef.current.renderer.dispose()
          geometry.dispose()
          material.dispose()
          sceneRef.current = null
        }
      }
    } catch {
      // WebGL initialization failed — show CSS fallback
      setWebglFailed(true)
    }
  }, [])

  // CSS gradient fallback when WebGL is unavailable (e.g. some cloud environments)
  if (webglFailed) {
    return (
      <div
        className={cn("w-full h-full", className)}
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(168,85,247,0.25) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.2) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(139,92,246,0.15) 0%, transparent 50%), #020617",
          overflow: "hidden",
        }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn("w-full h-full", className)}
      style={{ background: "#000", overflow: "hidden" }}
    />
  )
}
