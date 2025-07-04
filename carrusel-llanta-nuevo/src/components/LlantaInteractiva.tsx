import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import styled, { createGlobalStyle } from 'styled-components';

// Estilos globales para accesibilidad
const GlobalStyle = createGlobalStyle`
  body {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  
  *:focus-visible {
    outline: 3px solid #4a90e2;
    outline-offset: 2px;
    border-radius: 4px;
  }
`;

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
  height: 90vh;
  touch-action: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
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
  filter: drop-shadow(0 0 20px rgba(0, 200, 255, 0.5));
`;

const Llanta = styled(motion.img)`
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
  user-drag: none;
  -webkit-user-drag: none;
`;

const OrbitItem = styled(motion.div)`
  position: absolute;
  width: 280px;
  height: 180px;
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8);
  border: 5px solid white;
  background: white;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  z-index: 10;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover {
    z-index: 20;
    box-shadow: 0 0 30px rgba(100, 255, 255, 0.7);
  }

  &:focus-visible {
    outline: 3px solid #4a90e2;
    outline-offset: 2px;
  }

  .image-container {
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
    pointer-events: none;
    user-drag: none;
    -webkit-user-drag: none;
  }

  .image-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    font-weight: 600;
    font-size: 16px;
    text-align: center;
    padding: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    backdrop-filter: blur(2px);
    user-select: none;
    -webkit-user-select: none;
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
  animation: pulse 2s infinite;
  user-select: none;
  -webkit-user-select: none;
  
  @keyframes pulse {
    0% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.05); }
    100% { transform: translateX(-50%) scale(1); }
  }
`;

// Solución al error: Definición correcta del componente SrOnly
const SrOnly = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export function CarouselRotativo() {
  const items = [
    {
      id: "sendero-secreto",
      image: 'https://res.cloudinary.com/dmgz3csfp/image/upload/v1751586706/021_paovmq.jpg',
      title: 'SENDERO SECRETO',
      description: 'Descubre senderos ocultos en medio de la naturaleza exuberante.'
    },
    {
      id: "bosque-encantado",
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'BOSQUE ENCANTADO',
      description: 'Explora un bosque mágico lleno de árboles centenarios y criaturas fascinantes.'
    },
    {
      id: "amanecer-magico",
      image: 'https://res.cloudinary.com/dmgz3csfp/image/upload/v1751586706/021_paovmq.jpg',
      title: 'AMANECER MÁGICO',
      description: 'Vive la experiencia única de ver el amanecer desde nuestras cumbres.'
    },
    {
      id: "cascada-natural",
      image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'CASCADA NATURAL',
      description: 'Sumérgete en las refrescantes aguas de nuestras cascadas naturales.'
    },
  ];
  
  const degreesPerItem = FULL / items.length;
  const angle = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartAngle = useRef(0);
  const dragStartRotation = useRef(0);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Actualizar el índice actual cuando se cambia el ángulo
  useEffect(() => {
    const unsubscribe = angle.onChange(value => {
      const normalizedAngle = (value % 360 + 360) % 360;
      const index = Math.round(normalizedAngle / degreesPerItem) % items.length;
      setCurrentItemIndex(index);
    });
    
    return () => unsubscribe();
  }, [angle, degreesPerItem, items.length]);

  // Navegación por teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const current = angle.get();
        const next = current + degreesPerItem;
        animate(angle, next, { duration: 0.4, ease: [0.33, 1, 0.68, 1] });
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const current = angle.get();
        const next = current - degreesPerItem;
        animate(angle, next, { duration: 0.4, ease: [0.33, 1, 0.68, 1] });
        e.preventDefault();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (itemsRef.current[currentItemIndex]) {
          // Simular clic en el elemento actual
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          itemsRef.current[currentItemIndex]?.dispatchEvent(event);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentItemIndex, angle, degreesPerItem]);

  // Manejo de arrastre
  useEffect(() => {
    const scene = ref.current;
    if (!scene) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      
      setIsDragging(true);
      const rect = scene.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      dragStartAngle.current = (Math.atan2(dy, dx) * 180) / Math.PI;
      dragStartRotation.current = angle.get();
      
      document.body.style.overflow = 'hidden';
      document.body.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      
      const rect = scene.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const currentAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
      
      let diff = currentAngle - dragStartAngle.current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      const reductionFactor = e.pointerType === 'mouse' ? 0.5 : 0.7;
      angle.set(dragStartRotation.current + diff * reductionFactor);
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      setIsDragging(false);
      
      const raw = angle.get();
      const snapped = Math.round(raw / degreesPerItem) * degreesPerItem;
      animate(angle, snapped, { 
        duration: 0.4, 
        ease: [0.33, 1, 0.68, 1] 
      });
      
      document.body.style.overflow = '';
      document.body.style.cursor = '';
    };

    scene.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      scene.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.overflow = '';
      document.body.style.cursor = '';
    };
  }, [isDragging, degreesPerItem]);

  // Rotación automática
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
  }, [isDragging, degreesPerItem, angle]);

  // Manejar clics en los elementos
  const handleItemClick = (index: number) => {
    // Aquí puedes implementar la lógica para manejar el clic en un elemento
    console.log(`Seleccionado: ${items[index].title}`);
    
    // Enfocar el elemento para accesibilidad
    if (itemsRef.current[index]) {
      itemsRef.current[index]?.focus();
    }
  };

  return (
    <Wrapper>
      <GlobalStyle />
      <Scene 
        ref={ref}
        role="region"
        aria-label="Carrusel de destinos naturales"
      >
        <SrOnly 
          aria-live="polite"
          aria-atomic="true"
        >
          {`Destino actual: ${items[currentItemIndex].title}. ${items[currentItemIndex].description}`}
        </SrOnly>
        
        <LlantaContainer>
          <Llanta 
            src="https://res.cloudinary.com/dmgz3csfp/image/upload/v1751586630/Llanta_rvdewg.png" 
            style={{ rotate: angle }} 
            alt="Llanta decorativa que gira con el carrusel" 
          />
        </LlantaContainer>
        
        {items.map((item, i) => {
          const base = i * degreesPerItem;
          const currentAngle = useTransform(angle, a => ((a + base) % 360));
          
          // Posición en el círculo
          const x = useTransform(currentAngle, angle => {
            const rad = (angle * Math.PI) / 180;
            return ORBIT_RADIUS * Math.cos(rad);
          });
          
          const y = useTransform(currentAngle, angle => {
            const rad = (angle * Math.PI) / 180;
            return ORBIT_RADIUS * Math.sin(rad) * 0.8;
          });
          
          // Escala basada en la posición
          const scale = useTransform(currentAngle, angle => {
            const dist = Math.min(
              Math.abs(angle - 270),
              360 - Math.abs(angle - 270)
            );
            return 0.7 + (1 - dist / 180) * 0.5;
          });
          
          const opacity = useTransform(currentAngle, angle => {
            const dist = Math.min(
              Math.abs(angle - 270),
              360 - Math.abs(angle - 270)
            );
            return 0.5 + (1 - dist / 180) * 0.5;
          });
          
          const zIndex = useTransform(currentAngle, angle => {
            const dist = Math.min(
              Math.abs(angle - 270),
              360 - Math.abs(angle - 270)
            );
            return Math.round(10 * (1 - dist / 180));
          });

          return (
            <OrbitItem
              key={item.id}
              ref={el => itemsRef.current[i] = el}
              style={{
                x,
                y,
                scale,
                opacity,
                zIndex
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalles de ${item.title}: ${item.description}`}
              aria-describedby={`desc-${item.id}`}
              onClick={() => handleItemClick(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleItemClick(i);
                  e.preventDefault();
                }
              }}
            >
              <div className="image-container">
                <img 
                  src={item.image} 
                  alt={`Imagen representativa de ${item.title}`} 
                  draggable="false" 
                />
                <div className="image-title">{item.title}</div>
              </div>
              <SrOnly id={`desc-${item.id}`}>
                {item.description}
              </SrOnly>
            </OrbitItem>
          );
        })}
        
        <Instruction>
          <span aria-hidden="true">Arrastra para explorar nuestro recorrido</span>
          <SrOnly>
            Utiliza las flechas izquierda y derecha para navegar por los destinos
          </SrOnly>
        </Instruction>
      </Scene>
    </Wrapper>
  );
}