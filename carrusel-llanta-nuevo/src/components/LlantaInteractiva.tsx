import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import styled from 'styled-components';

const DIAM = 600;
const FULL = 360;
const ORBIT_RADIUS = DIAM / 2 + 180;

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #0a2e38, #05141a);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
`;

const Scene = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
  touch-action: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
`;

const LlantaContainer = styled.div`
  position: absolute;
  bottom: -${DIAM / 2}px;
  left: 50%;
  transform: translateX(-50%);
  width: ${DIAM}px;
  height: ${DIAM}px;
  border-radius: 50%;
  overflow: hidden;
  z-index: 5;
`;

const Llanta = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
`;

const OrbitItem = styled(motion.div)`
  position: absolute;
  width: 280px;
  height: 180px;
  cursor: grab;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
  border: 5px solid white;
  background: white;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &:active {
    cursor: grabbing;
  }

  &:hover {
    transform: scale(1.08) !important;
    z-index: 20;
  }

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }

  .image-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
    padding: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;



const Instruction = styled.div`
  position: absolute;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  color: white;
  text-align: center;
  font-size: 1rem;
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.5);
  padding: 12px 30px;
  border-radius: 30px;
  backdrop-filter: blur(5px);
  font-weight: 500;
  z-index: 10;
  letter-spacing: 1px;
`;

export function CarouselRotativo() {
  const items = [
    {
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'SENDERO SECRETO'
    },
    {
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'BOSQUE ENCANTADO'
    },
    {
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'AMANECER MÁGICO'
    },
    {
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'CASCADA NATURAL'
    },
  ];
  
  const degreesPerItem = FULL / items.length;
  const angle = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartAngle = useRef(0);
  const dragStartRotation = useRef(0);

  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;

    const handlePointerDown = (e: PointerEvent) => {
      setIsDragging(true);
      const rect = scene.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      dragStartAngle.current = (Math.atan2(dy, dx) * 180) / Math.PI;
      dragStartRotation.current = angle.get();
      
      // Bloquear el desplazamiento de la página durante el arrastre
      document.body.style.overflow = 'hidden';
      scene.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const rect = scene.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      
      // Suavizar el movimiento con un factor de reducción
      const delta = (currentAngle - dragStartAngle.current) * 0.7;
      angle.set(dragStartRotation.current + delta);
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      // Snap a la posición más cercana
      const raw = angle.get();
      const snapped = Math.round(raw / degreesPerItem) * degreesPerItem;
      animate(angle, snapped, { 
        duration: 0.4, 
        ease: [0.33, 1, 0.68, 1] 
      });
      
      // Restaurar el desplazamiento de la página
      document.body.style.overflow = '';
      scene.style.cursor = '';
    };

    scene.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      scene.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.overflow = '';
    };
  }, [isDragging, degreesPerItem]);

  useEffect(() => {
    if (isDragging) return;
    
    const interval = setInterval(() => {
      const current = angle.get();
      const next = current + degreesPerItem;
      animate(angle, next, { 
        duration: 4, 
        ease: [0.16, 1, 0.3, 1] 
      });
    }, 7000);
    
    return () => clearInterval(interval);
  }, [isDragging, degreesPerItem]);

  return (
    <Wrapper>
      
      <Scene ref={ref}>
        <LlantaContainer>
          <Llanta 
            src="/Llanta.png" 
            style={{ rotate: angle }} 
            alt="Llanta decorativa" 
          />
        </LlantaContainer>
        
        {items.map((item, i) => {
          const base = i * degreesPerItem;
          const currentAngle = useTransform(angle, a => ((a + base) % 360));
          
          // Posición en el círculo (optimizada para 3 imágenes visibles)
          const x = useTransform(currentAngle, angle => {
            const rad = (angle * Math.PI) / 180;
            return ORBIT_RADIUS * Math.cos(rad) * 1.1;
          });
          
          const y = useTransform(currentAngle, angle => {
            const rad = (angle * Math.PI) / 180;
            // Ajuste vertical para la imagen superior
            return (ORBIT_RADIUS * Math.sin(rad)) - (angle < 180 ? 40 : 0);
          });
          
          // Escala y opacidad basadas en la posición
          const scale = useTransform(currentAngle, angle => {
            const diff = Math.min(
              Math.min(Math.abs(angle - 90), 360 - Math.abs(angle - 90)),
              Math.min(Math.abs(angle - 270), 360 - Math.abs(angle - 270))
            );
            return 0.8 + (1 - diff / 120) * 0.4;
          });
          
          const opacity = useTransform(currentAngle, angle => {
            const diff = Math.min(
              Math.min(Math.abs(angle - 90), 360 - Math.abs(angle - 90)),
              Math.min(Math.abs(angle - 270), 360 - Math.abs(angle - 270))
            );
            return 0.6 + (1 - diff / 120) * 0.4;
          });
          
          const zIndex = useTransform(currentAngle, angle => {
            const diff = Math.min(
              Math.min(Math.abs(angle - 90), 360 - Math.abs(angle - 90)),
              Math.min(Math.abs(angle - 270), 360 - Math.abs(angle - 270))
            );
            return Math.round(10 * (1 - diff / 120));
          });

          // Rotación compensada mínima
          const rotate = useTransform(currentAngle, angle => {
            const diff = angle <= 180 ? angle - 90 : angle - 270;
            return diff * 0.1; // Rotación muy suave (10%)
          });

          return (
            <OrbitItem
              key={i}
              style={{
                x,
                y,
                rotate,
                scale,
                opacity,
                zIndex
              }}
            >
              <div className="image-container">
                <img src={item.image} alt={item.title} />
                <div className="image-title">{item.title}</div>
              </div>
            </OrbitItem>
          );
        })}
        
        <Instruction>Arrastra para explorar nuestro recorrido</Instruction>
      </Scene>
    </Wrapper>
  );
}