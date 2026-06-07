# 3D Models

Place your 3D model files here — **`.glb` / `.gltf`** for characters, **FBX or GLB** for the projector mesh (see presentation scene).

## Projector screen

The **presentation view** loads a projector from:

- **`/models/projector-screen.fbx`** (bundled Cinema 4D export, loaded via `FBXLoader` at runtime).

To replace it:

1. Add your projector model under `public/models/` (`projector-screen.fbx`, `projector-screen.glb`, etc.).
2. Pass `projectorModelPath` on `PortfolioCanvas3D`:
   ```tsx
   <PortfolioCanvas3D projectorModelPath="/models/projector-screen.glb" />
   ```
3. Prefer **single mesh + clear front face** so the Html slide aligns; tune offsets in [`ProjectorScreen3D.tsx`](../src/components/Canvas3D/ProjectorScreen3D.tsx) (`screenContentOffset` / `modelRotation`) if your export scale differs.

**Optional Blender workflow:** FBX imports cleanly in Blender; export **glTF Binary (.glb)** for smaller assets and reuse the same URL.

## Among Us Character

To use a custom Among Us 3D model:

1. Place your Among Us `.glb` file in this folder (e.g., `among-us.glb`)
2. Update the `amongUsModelPath` prop in your App or Canvas3D component:

```tsx
<PortfolioCanvas3D
  amongUsModelPath="/models/among-us.glb"
  // ... other props
/>
```

### Supported Colors

The model will automatically be colored based on the character color. Supported Among Us colors:
- red, blue, green, pink, orange, yellow
- black, white, purple, brown, cyan, lime
- maroon, rose, banana, gray, tan, coral

You can also use hex colors (e.g., `#FF5733`).

### Model Requirements

For best results, your Among Us model should:
- Have separate meshes for the body/suit and visor
- Name the body mesh with "body" or "suit" in the name
- Name the visor mesh with "visor" in the name
- Be oriented with Y-up and facing +Z direction
- Be scaled appropriately (around 1-2 units tall)
