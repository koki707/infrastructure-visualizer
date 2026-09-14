import { Text as DreiText } from '@react-three/drei'
import { Suspense, type ComponentProps } from 'react'

/**
 * Scene labels are instructional UI, not physical objects. Rendering them after
 * the models keeps labels readable while the user rotates a detailed scene.
 */
export function VisibleText(props: ComponentProps<typeof DreiText>) {
  const { outlineWidth, outlineColor, ...textProps } = props
  return (
    <Suspense fallback={null}>
      <DreiText
        {...textProps}
        font="/fonts/NotoSansJP-VF.ttf"
        outlineWidth={outlineWidth ?? 0.01}
        outlineColor={outlineColor ?? '#f8fafc'}
        renderOrder={40}
        material-depthTest={false}
        material-depthWrite={false}
      />
    </Suspense>
  )
}
