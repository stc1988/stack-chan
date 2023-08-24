import { RendererBase, Layer, Emotion, type FacePartFactory, type FaceContext } from 'renderer'

// Renderers
export const useDrawEyelid: FacePartFactory<{
  cx: number
  cy: number
  width: number
  height: number
  side: keyof FaceContext['eyes']
}> =
  ({ cx, cy, width, height, side }) =>
  (_tick, path, { eyes, emotion }) => {
    const eye = eyes[side]
    const w = width
    const h = height * (1 - eye.open)
    const x = cx - width / 2
    const y = cy - height / 2
    let h1
    let h2
    switch (emotion) {
      case 'ANGRY':
      case 'SAD':
        h1 = y + (height + h) / 2
        h2 = y + h
        if (side === 'left') {
          ;[h1, h2] = [h2, h1]
        }
        if (emotion === 'SAD') {
          ;[h1, h2] = [h2, h1]
        }
        path.moveTo(x, y)
        path.lineTo(x, h1)
        path.lineTo(x + w, h2)
        path.lineTo(x + w, y)
        path.closePath()
        break
      default:
        path.rect(x, y, w, h)
    }
  }

export const useDrawEye: FacePartFactory<{
  cx: number
  cy: number
  radius?: number
  side: keyof FaceContext['eyes']
}> =
  ({ cx, cy, radius = 8, side }) =>
  (_tick, path, { eyes }) => {
    const eye = eyes[side]
    const offsetX = (eye.gazeX ?? 0) * 2
    const offsetY = (eye.gazeY ?? 0) * 2
    path.arc(cx + offsetX, cy + offsetY, radius, 0, 2 * Math.PI)
  }

export const useDrawMouth: FacePartFactory<{
  cx: number
  cy: number
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
}> =
  ({ cx, cy, minWidth = 50, maxWidth = 90, minHeight = 8, maxHeight = 58 }) =>
  (_tick, path, { mouth }) => {
    const openRatio = mouth.open
    const h = minHeight + (maxHeight - minHeight) * openRatio
    const w = minWidth + (maxWidth - minWidth) * (1 - openRatio)
    const x = cx - w / 2
    const y = cy - h / 2
    path.rect(x, y, w, h)
  }

export class Renderer extends RendererBase {
  constructor(option) {
    super(option)
    const layer1 = new Layer({ colorName: 'primary' })
    this.layers.push(layer1)
    layer1.addPart(
      'leftEye',
      useDrawEye({
        cx: 90,
        cy: 93,
        side: 'left',
        radius: 8,
      })
    )
    layer1.addPart('rightEye', useDrawEye({ cx: 230, cy: 96, side: 'right', radius: 8 }))
    layer1.addPart('mouth', useDrawMouth({ cx: 160, cy: 148 }))

    const layer2 = new Layer({ colorName: 'secondary' })
    this.layers.push(layer2)
    layer2.addPart(
      'leftEyelid',
      useDrawEyelid({
        cx: 90,
        cy: 93,
        side: 'left',
        width: 24,
        height: 24,
      })
    )
    layer2.addPart(
      'rightEyelid',
      useDrawEyelid({
        cx: 230,
        cy: 96,
        side: 'right',
        width: 24,
        height: 24,
      })
    )
  }
}
