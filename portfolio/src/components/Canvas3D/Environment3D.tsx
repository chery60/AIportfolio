interface Environment3DProps {
  showGalleryPath?: boolean;
  pathBounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export default function Environment3D({ showGalleryPath: _showGalleryPath = false, pathBounds: _pathBounds }: Environment3DProps) {
  return (
    <>
      {/* Bright white theater sky */}
      <color attach="background" args={['#F2F0EA']} />

      {/* Soft ambient fill */}
      <ambientLight intensity={1.5} color="#FFFFFF" />

      {/* Main overhead directional light with shadows */}
      <directionalLight
        castShadow
        position={[8, 22, 10]}
        intensity={1.8}
        color="#FFFDF4"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Sky/ground hemisphere */}
      <hemisphereLight args={['#FFFFFF', '#D8D2C0', 0.65]} />

      {/* Screen fill light — illuminates audience and screen from front */}
      <pointLight position={[0, 4, -4]} intensity={2.2} color="#FFF8F0" distance={32} decay={2} />

      {/* Subtle back fill */}
      <pointLight position={[0, 5, 8]} intensity={0.6} color="#FFFFFF" distance={24} decay={2} />

      {/* White/cream floor plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#E8E4D8" roughness={0.92} metalness={0} />
      </mesh>
    </>
  );
}
