import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Accelerometer } from 'expo-sensors';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useRotationGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  clamp,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const C = {
  ink: '#2A2233',
  inkSoft: '#766D80',
  forest: '#4D3568',
  forestDeep: '#241B2D',
  mint: '#E4D7F2',
  mintDeep: '#8D6BB5',
  paper: '#F8F6FA',
  white: '#FFFFFF',
  line: '#EAE4EF',
  peach: '#E8CFEA',
  lilac: '#BFA9D8',
  yellow: '#EBC8D0',
  blue: '#AFA4CA',
};

const PRACTICES = [
  { id: 'drag', number: '01', title: 'Arrastrar y girar', short: 'Dirección y rotación', detail: 'Mueve la figura de lado a lado y observa cómo responde su orientación.', mark: '↗', color: '#EEE5F6' },
  { id: 'loading', number: '02', title: 'Carga continua', short: 'Indicador animado', detail: 'Un indicador circular y una barra avanzan en un ciclo continuo.', mark: '◌', color: '#E9E8F4' },
  { id: 'multitouch', number: '03', title: 'Gestos multitáctiles', short: 'Escala, posición y giro', detail: 'Usa dos dedos para ampliar, desplazar y rotar la composición.', mark: '◎', color: '#F1E3EF' },
  { id: 'bounce', number: '04', title: 'Rebote al pulsar', short: 'Respuesta elástica', detail: 'Mantén pulsada la figura; al soltarla vuelve a su tamaño con un rebote.', mark: '●', color: '#E6E2F2' },
  { id: 'carousel', number: '05', title: 'Carrusel de tarjetas', short: 'Navegación horizontal', detail: 'Desliza las tarjetas y descubre una transición con escala y rotación.', mark: '▱', color: '#F4E5ED' },
  { id: 'accelerometer', number: '06', title: 'Movimiento del dispositivo', short: 'Acelerómetro', detail: 'Agita el teléfono para activar la respuesta de la figura.', mark: '⌁', color: '#E7E2F1' },
];

function Label({ children, style }) {
  return <Text style={[styles.label, style]}>{children}</Text>;
}

function RuleCard({ children, style }) {
  return <View style={[styles.ruleCard, style]}>{children}</View>;
}

function Eyebrow({ children }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

function PracticeIntro({ practice }) {
  return (
    <View style={styles.intro}>
      <Eyebrow>PRÁCTICA {practice.number}</Eyebrow>
      <Text style={styles.screenTitle}>{practice.title}</Text>
      <Text style={styles.screenDescription}>{practice.detail}</Text>
    </View>
  );
}

function ActionButton({ title, onPress, quiet = false }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionButton, quiet && styles.actionButtonQuiet, pressed && styles.pressed]}>
      <Text style={[styles.actionButtonText, quiet && styles.actionButtonTextQuiet]}>{title}</Text>
    </Pressable>
  );
}

function Stage({ children, style }) {
  return <View style={[styles.stage, style]}>{children}</View>;
}

function DragPractice() {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const rotation = useSharedValue(0);
  const pan = usePanGesture({
    onUpdate: (event) => {
      x.value = clamp(event.translationX, -130, 130);
      y.value = clamp(event.translationY, -82, 82);
      rotation.value = clamp(event.translationX / 4, -34, 34);
    },
    onDeactivate: () => {
      x.value = withSpring(0, { damping: 16, stiffness: 125 });
      y.value = withSpring(0, { damping: 16, stiffness: 125 });
      rotation.value = withSpring(0, { damping: 14, stiffness: 115 });
    },
  });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  return (
    <>
      <Stage style={styles.dragStage}>
        <View style={styles.dragGuide} />
        <View style={[styles.guideDot, { left: '16%' }]} />
        <View style={[styles.guideDot, { right: '16%' }]} />
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.dragShapeWrap, animatedStyle]}>
            <View style={styles.dragShape}><View style={styles.dragShapeCore} /></View>
          </Animated.View>
        </GestureDetector>
        <View style={styles.stageCaption}><Text style={styles.stageCaptionText}>IZQUIERDA</Text><Text style={styles.stageCaptionText}>DERECHA</Text></View>
      </Stage>
      <RuleCard>
        <Text style={styles.cardTitle}>La orientación sigue el gesto</Text>
        <Text style={styles.cardBody}>Arrastra hacia un lado. Suelta para devolver la figura al centro.</Text>
      </RuleCard>
    </>
  );
}

function LoadingPractice() {
  const spin = useSharedValue(0);
  const progress = useSharedValue(0.16);
  useEffect(() => {
    spin.value = withRepeat(withTiming(360, { duration: 1450, easing: Easing.linear }), -1, false);
    progress.value = withRepeat(
      withSequence(
        withTiming(0.86, { duration: 1850, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.16, { duration: 950, easing: Easing.inOut(Easing.quad) }),
      ), -1, false,
    );
  }, [progress, spin]);
  const spinStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const progressStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  return (
    <>
      <Stage style={styles.loadingStage}>
        <Animated.View style={[styles.spinnerOuter, spinStyle]}>
          <View style={styles.spinnerArc} />
          <View style={styles.spinnerDot} />
        </Animated.View>
        <Text style={styles.loadingHeadline}>Preparando la experiencia</Text>
        <Text style={styles.loadingSubline}>Los elementos estarán listos en un momento</Text>
        <View style={styles.progressTrack}><Animated.View style={[styles.progressFill, progressStyle]} /></View>
        <View style={styles.progressMeta}><Text style={styles.stageCaptionText}>CARGANDO RECURSOS</Text><Text style={styles.stageCaptionText}>EN CURSO</Text></View>
      </Stage>
      <RuleCard>
        <Text style={styles.cardTitle}>Dos animaciones, un mismo ciclo</Text>
        <Text style={styles.cardBody}>El indicador circular rota mientras la barra avanza y vuelve a empezar.</Text>
      </RuleCard>
    </>
  );
}

function Artwork() {
  return (
    <View style={styles.artwork}>
      <View style={styles.artSun} />
      <View style={styles.artMountainBack} />
      <View style={styles.artMountainFront} />
      <View style={styles.artWater} />
      <View style={styles.artReflection} />
      <View style={styles.artReedOne} />
      <View style={styles.artReedTwo} />
      <View style={styles.artSignature}><Text style={styles.artSignatureText}>ESTUDIO / 04</Text></View>
    </View>
  );
}

function MultitouchPractice() {
  const scale = useSharedValue(1);
  const scaleStart = useSharedValue(1);
  const rotation = useSharedValue(0);
  const rotationStart = useSharedValue(0);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const pan = usePanGesture({
    onActivate: () => { startX.value = x.value; startY.value = y.value; },
    onUpdate: (event) => {
      x.value = startX.value + event.translationX;
      y.value = startY.value + event.translationY;
    },
  });
  const pinch = usePinchGesture({
    onActivate: () => { scaleStart.value = scale.value; },
    onUpdate: (event) => { scale.value = clamp(scaleStart.value * event.scale, 0.62, 1.85); },
  });
  const rotate = useRotationGesture({
    onActivate: () => { rotationStart.value = rotation.value; },
    onUpdate: (event) => { rotation.value = rotationStart.value + event.rotation; },
  });
  const gesture = useSimultaneousGestures(pan, pinch, rotate);
  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
  }));
  const reset = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
    x.value = withSpring(0);
    y.value = withSpring(0);
  };
  return (
    <>
      <Stage style={styles.artStage}>
        <View style={styles.artStageTop}><Text style={styles.artStageLabel}>LÁMINA 04</Text><Text style={styles.artStageLabel}>PAISAJE / LUZ</Text></View>
        <GestureDetector gesture={gesture}><Animated.View style={[styles.artworkGesture, artStyle]}><Artwork /></Animated.View></GestureDetector>
        <View style={styles.artStageBottom}><Text style={styles.stageCaptionText}>DOS DEDOS PARA AMPLIAR Y GIRAR</Text></View>
      </Stage>
      <View style={styles.actionRow}><Text style={styles.helperText}>Desplaza con uno o dos dedos</Text><ActionButton title="Restablecer" quiet onPress={reset} /></View>
      <RuleCard><Text style={styles.cardTitle}>Control simultáneo</Text><Text style={styles.cardBody}>La ilustración se desplaza, amplía y gira en el mismo gesto, con límites de escala para conservar el área de trabajo.</Text></RuleCard>
    </>
  );
}

function BouncePractice() {
  const scale = useSharedValue(1);
  const tap = useTapGesture({
    onBegin: () => { scale.value = withSpring(0.88, { damping: 12, stiffness: 220 }); },
    onDeactivate: () => { scale.value = withSequence(withSpring(1.12, { damping: 7, stiffness: 150 }), withSpring(1, { damping: 10, stiffness: 160 })); },
  });
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <>
      <Stage style={styles.bounceStage}>
        <View style={styles.bounceHalo} />
        <GestureDetector gesture={tap}>
          <Animated.View style={[styles.bounceShape, animatedStyle]}><View style={styles.bounceCore} /></Animated.View>
        </GestureDetector>
        <Text style={styles.bouncePrompt}>MANTÉN PULSADO</Text>
      </Stage>
      <RuleCard><Text style={styles.cardTitle}>Presión y elasticidad</Text><Text style={styles.cardBody}>La escala disminuye al tocar y recupera su tamaño con un rebote al soltar.</Text></RuleCard>
    </>
  );
}

const CARDS = [
  { category: 'FORMAS', title: 'Luz en reposo', text: 'Una pausa también tiene movimiento.', color: '#EEE5F6', accent: C.mintDeep, symbol: '◒' },
  { category: 'COLOR', title: 'Tono de tarde', text: 'Una paleta que cambia con el gesto.', color: '#F1E3EF', accent: '#A76F98', symbol: '◐' },
  { category: 'VOLUMEN', title: 'Centro de gravedad', text: 'Equilibrio entre forma y espacio.', color: '#E8E8F5', accent: '#786B9F', symbol: '◉' },
  { category: 'TEXTURA', title: 'Superficie viva', text: 'Pequeños cambios, otra lectura.', color: '#E7E2F1', accent: '#725E88', symbol: '◍' },
];

function CarouselPractice() {
  const [index, setIndex] = useState(0);
  const offset = useSharedValue(0);
  const active = CARDS[index];
  const pan = usePanGesture({
    onUpdate: (event) => { offset.value = event.translationX; },
    onDeactivate: (event) => {
      if (event.translationX < -45 || event.velocityX < -450) runOnJS(setIndex)((index + 1) % CARDS.length);
      else if (event.translationX > 45 || event.velocityX > 450) runOnJS(setIndex)((index + CARDS.length - 1) % CARDS.length);
      offset.value = withSpring(0, { damping: 14, stiffness: 150 });
    },
  });
  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value * 0.24 },
      { rotate: `${interpolate(offset.value, [-180, 0, 180], [-9, 0, 9])}deg` },
      { scale: interpolate(Math.abs(offset.value), [0, 200], [1, 0.88], 'clamp') },
    ],
  }));
  return (
    <>
      <Stage style={styles.carouselStage}>
        <View style={styles.carouselSideCard} />
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.carouselCard, { backgroundColor: active.color }, cardStyle]}>
            <View style={styles.carouselCardTop}><Text style={[styles.carouselCategory, { color: active.accent }]}>{active.category}</Text><Text style={styles.carouselCount}>{String(index + 1).padStart(2, '0')} / 04</Text></View>
            <View style={[styles.carouselSymbol, { backgroundColor: active.accent }]}><Text style={styles.carouselSymbolText}>{active.symbol}</Text></View>
            <View><Text style={styles.carouselCardTitle}>{active.title}</Text><Text style={styles.carouselCardText}>{active.text}</Text></View>
          </Animated.View>
        </GestureDetector>
        <View style={styles.carouselArrows}><Text style={styles.carouselArrow}>‹</Text><Text style={styles.carouselArrow}>›</Text></View>
      </Stage>
      <View style={styles.carouselDots}>{CARDS.map((card, i) => <Pressable key={card.title} accessibilityRole="button" accessibilityLabel={`Ir a tarjeta ${i + 1}`} onPress={() => { setIndex(i); offset.value = withSpring(0); }} style={[styles.dot, index === i && styles.dotActive]} />)}</View>
      <RuleCard><Text style={styles.cardTitle}>Una tarjeta a la vez</Text><Text style={styles.cardBody}>Desliza para avanzar o retroceder. También puedes seleccionar un indicador inferior.</Text></RuleCard>
    </>
  );
}

function AccelerometerPractice() {
  const shake = useSharedValue(0);
  const [shakeCount, setShakeCount] = useState(0);
  const [sensorAvailable, setSensorAvailable] = useState(false);
  const lastTrigger = useRef(0);
  useEffect(() => {
    let subscription;
    let active = true;
    Accelerometer.isAvailableAsync().then((available) => {
      if (!active) return;
      setSensorAvailable(available);
      if (available) {
        Accelerometer.setUpdateInterval(90);
        subscription = Accelerometer.addListener(({ x, y, z }) => {
          const intensity = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          if (intensity > 1.72 && now - lastTrigger.current > 650) {
            lastTrigger.current = now;
            shake.value = withSequence(
              withTiming(-13, { duration: 45 }), withTiming(13, { duration: 55 }),
              withTiming(-9, { duration: 55 }), withTiming(9, { duration: 55 }), withSpring(0),
            );
            setShakeCount((count) => count + 1);
          }
        });
      }
    }).catch(() => setSensorAvailable(false));
    return () => { active = false; subscription?.remove(); };
  }, [shake]);
  const shapeStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${shake.value}deg` }] }));
  const simulate = () => {
    shake.value = withSequence(withTiming(-13, { duration: 45 }), withTiming(13, { duration: 55 }), withTiming(-9, { duration: 55 }), withTiming(9, { duration: 55 }), withSpring(0));
    setShakeCount((count) => count + 1);
  };
  return (
    <>
      <Stage style={styles.sensorStage}>
        <View style={styles.sensorOrbit}><View style={styles.sensorOrbitInner} /></View>
        <Animated.View style={[styles.sensorShape, shapeStyle]}><View style={styles.sensorShapeCore} /></Animated.View>
        <Text style={styles.sensorCounter}>{String(shakeCount).padStart(2, '0')}</Text>
        <Text style={styles.sensorCaption}>{sensorAvailable ? 'SENSOR ACTIVO · AGITA EL TELÉFONO' : 'MODO DE DEMOSTRACIÓN'}</Text>
      </Stage>
      <View style={styles.actionRow}><Text style={styles.helperText}>En escritorio, prueba la respuesta aquí.</Text><ActionButton title="Simular movimiento" onPress={simulate} /></View>
      <RuleCard><Text style={styles.cardTitle}>Respuesta al acelerómetro</Text><Text style={styles.cardBody}>Un cambio rápido en la aceleración activa una secuencia corta de sacudida. El botón permite probarla sin un dispositivo físico.</Text></RuleCard>
    </>
  );
}

function HomeScreen({ onSelect }) {
  return (
    <ScrollView contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <View style={styles.homeHero}>
        <View style={styles.homeHeroCopy}>
          <Eyebrow>LABORATORIO INTERACTIVO</Eyebrow>
          <Text style={styles.homeTitle}>El movimiento{ '\n' }también se diseña.</Text>
          <Text style={styles.homeSubtitle}>Seis experiencias breves para explorar gestos, respuesta y ritmo en una interfaz móvil.</Text>
          <Pressable onPress={() => onSelect('drag')} style={({ pressed }) => [styles.heroLink, pressed && styles.pressed]}><Text style={styles.heroLinkText}>Comenzar recorrido</Text><Text style={styles.heroLinkArrow}>→</Text></Pressable>
        </View>
        <View style={styles.heroArt}>
          <View style={styles.heroCircleBack} />
          <View style={styles.heroCircleFront}><View style={styles.heroCircleCore} /></View>
          <View style={styles.heroLine} />
          <View style={styles.heroTag}><Text style={styles.heroTagText}>01 — 06</Text></View>
        </View>
      </View>
      <View style={styles.sectionHeading}><View><Eyebrow>EL TALLER</Eyebrow><Text style={styles.sectionTitle}>Seis formas de explorar</Text></View><Text style={styles.sectionCount}>06 PRÁCTICAS</Text></View>
      <View style={styles.practiceList}>
        {PRACTICES.map((item) => (
          <Pressable key={item.id} onPress={() => onSelect(item.id)} style={({ pressed }) => [styles.practiceRow, pressed && styles.practiceRowPressed]}>
            <View style={[styles.practiceMark, { backgroundColor: item.color }]}><Text style={styles.practiceMarkText}>{item.mark}</Text></View>
            <View style={styles.practiceInfo}><Text style={styles.practiceName}>{item.title}</Text><Text style={styles.practiceShort}>{item.short}</Text></View>
            <Text style={styles.practiceNumber}>{item.number}</Text><Text style={styles.practiceArrow}>↗</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.homeNote}><View style={styles.noteLine} /><Text style={styles.homeNoteText}>Diseñado para probarse con las manos. Hecho con React Native, Reanimated y Expo.</Text></View>
    </ScrollView>
  );
}

function PracticeScreen({ practice, onNavigate }) {
  const index = PRACTICES.findIndex((item) => item.id === practice.id);
  let exercise;
  switch (practice.id) {
    case 'drag': exercise = <DragPractice />; break;
    case 'loading': exercise = <LoadingPractice />; break;
    case 'multitouch': exercise = <MultitouchPractice />; break;
    case 'bounce': exercise = <BouncePractice />; break;
    case 'carousel': exercise = <CarouselPractice />; break;
    case 'accelerometer': exercise = <AccelerometerPractice />; break;
    default: exercise = null;
  }
  return (
    <ScrollView contentContainerStyle={styles.exerciseContent} showsVerticalScrollIndicator={false}>
      <PracticeIntro practice={practice} />
      {exercise}
      <View style={styles.routeNav}>
        <Pressable onPress={() => onNavigate(index === 0 ? 'home' : PRACTICES[index - 1].id)} style={({ pressed }) => [styles.routeButton, styles.routeButtonPrevious, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={index === 0 ? 'Volver al inicio' : `Ir a ${PRACTICES[index - 1].title}`}>
          <Text style={styles.routeArrow}>←</Text>
          <View style={styles.routeButtonCopy}><Text style={styles.routeLabel}>{index === 0 ? 'PORTADA' : 'ANTERIOR'}</Text><Text style={styles.routeTitle}>{index === 0 ? 'Inicio' : PRACTICES[index - 1].title}</Text></View>
        </Pressable>
        <Pressable onPress={() => onNavigate(index === PRACTICES.length - 1 ? 'home' : PRACTICES[index + 1].id)} style={({ pressed }) => [styles.routeButton, styles.routeButtonNext, pressed && styles.pressed]} accessibilityRole="button" accessibilityLabel={index === PRACTICES.length - 1 ? 'Finalizar y volver al inicio' : `Siguiente: ${PRACTICES[index + 1].title}`}>
          <View style={[styles.routeButtonCopy, styles.routeButtonCopyNext]}><Text style={[styles.routeLabel, styles.routeLabelNext]}>{index === PRACTICES.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'}</Text><Text style={[styles.routeTitle, styles.routeTitleNext]}>{index === PRACTICES.length - 1 ? 'Inicio' : PRACTICES[index + 1].title}</Text></View>
          <Text style={styles.routeArrowNext}>→</Text>
        </Pressable>
      </View>
      <View style={styles.exerciseFooter}><Text style={styles.footerText}>TALLER DE MOVIMIENTO</Text><Text style={styles.footerText}>{practice.number} / 06</Text></View>
    </ScrollView>
  );
}

function AppShell() {
  const [currentId, setCurrentId] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerProgress = useSharedValue(0);
  const currentPractice = PRACTICES.find((practice) => practice.id === currentId);
  const openDrawer = () => { setDrawerOpen(true); drawerProgress.value = withTiming(1, { duration: 230 }); };
  const closeDrawer = () => { drawerProgress.value = withTiming(0, { duration: 190 }); setTimeout(() => setDrawerOpen(false), 200); };
  const choose = (id) => { setCurrentId(id); closeDrawer(); };
  const drawerStyle = useAnimatedStyle(() => ({ transform: [{ translateX: interpolate(drawerProgress.value, [0, 1], [-330, 0]) }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: interpolate(drawerProgress.value, [0, 1], [0, 0.44]) }));
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <View style={styles.appHeader}>
        <Pressable onPress={openDrawer} accessibilityRole="button" accessibilityLabel="Abrir menú" style={({ pressed }) => [styles.menuButton, pressed && styles.pressed]}>
          <View style={styles.menuStroke} /><View style={[styles.menuStroke, styles.menuStrokeShort]} /><View style={styles.menuStroke} />
        </Pressable>
        <View style={styles.headerBrand}><Text style={styles.headerEyebrow}>ESTUDIO DE INTERACCIÓN</Text><Text style={styles.headerTitle}>Taller de movimiento</Text></View>
        <View style={[styles.headerIndex, currentId === 'home' && styles.headerIndexHome]}><Text style={styles.headerIndexText}>{currentPractice ? currentPractice.number : 'INICIO'}</Text></View>
      </View>
      <View style={styles.mainArea}>
        {currentId === 'home' ? <HomeScreen onSelect={setCurrentId} /> : <PracticeScreen practice={currentPractice} onNavigate={setCurrentId} />}
      </View>
      {drawerOpen && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Animated.View style={[styles.scrim, scrimStyle]}><Pressable onPress={closeDrawer} style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cerrar menú" /></Animated.View>
          <Animated.View style={[styles.drawer, drawerStyle]}>
            <View style={styles.drawerTop}><View style={styles.drawerBrandMark}><View style={styles.drawerBrandCore} /></View><View><Text style={styles.drawerBrandTitle}>Taller de</Text><Text style={styles.drawerBrandTitle}>movimiento</Text></View></View>
            <Text style={styles.drawerSection}>CONTENIDO</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Pressable onPress={() => choose('home')} style={({ pressed }) => [styles.drawerItem, currentId === 'home' && styles.drawerItemActive, pressed && styles.drawerItemPressed]}>
                <Text style={[styles.drawerItemNumber, currentId === 'home' && styles.drawerItemNumberActive]}>⌂</Text>
                <Text style={[styles.drawerItemTitle, currentId === 'home' && styles.drawerItemTitleActive]}>Inicio</Text>
                {currentId === 'home' && <View style={styles.drawerActiveDot} />}
              </Pressable>
              {PRACTICES.map((practice) => (
                <Pressable key={practice.id} onPress={() => choose(practice.id)} style={({ pressed }) => [styles.drawerItem, currentId === practice.id && styles.drawerItemActive, pressed && styles.drawerItemPressed]}>
                  <Text style={[styles.drawerItemNumber, currentId === practice.id && styles.drawerItemNumberActive]}>{practice.number}</Text>
                  <Text style={[styles.drawerItemTitle, currentId === practice.id && styles.drawerItemTitleActive]}>{practice.title}</Text>
                  {currentId === practice.id && <View style={styles.drawerActiveDot} />}
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.drawerFooter}><View style={styles.drawerFooterRule} /><Text style={styles.drawerFooterText}>EXPERIENCIAS DE INTERFAZ</Text><Text style={styles.drawerFooterText}>REACT NATIVE · EXPO</Text></View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider><AppShell /></SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.paper },
  safeArea: { flex: 1, backgroundColor: C.forestDeep },
  appHeader: { minHeight: 76, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: C.forestDeep },
  menuButton: { width: 42, height: 42, justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)' },
  menuStroke: { height: 1.6, width: 19, borderRadius: 2, backgroundColor: '#F7F2FA' },
  menuStrokeShort: { width: 13 },
  headerBrand: { flex: 1, marginLeft: 12 },
  headerEyebrow: { color: '#C7B1DD', fontSize: 9, letterSpacing: 1.6, fontWeight: '700', marginBottom: 3 },
  headerTitle: { color: C.white, fontSize: 17, fontWeight: '600', letterSpacing: 0.1 },
  headerIndex: { width: 38, height: 34, borderWidth: 1, borderColor: 'rgba(255,255,255,0.24)', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerIndexHome: { width: 58 },
  headerIndexText: { color: '#E9DFF1', fontSize: 10, letterSpacing: 0.8, fontWeight: '700' },
  mainArea: { flex: 1, backgroundColor: C.paper },
  label: { fontSize: 10, color: C.mintDeep, letterSpacing: 1.8, fontWeight: '700' },
  eyebrow: { fontSize: 10, color: C.mintDeep, letterSpacing: 1.8, fontWeight: '700' },
  intro: { paddingTop: 28, paddingHorizontal: 22, paddingBottom: 19 },
  screenTitle: { color: C.ink, fontSize: 29, lineHeight: 34, letterSpacing: -0.7, fontWeight: '700', marginTop: 9 },
  screenDescription: { color: C.inkSoft, fontSize: 14, lineHeight: 21, marginTop: 7, maxWidth: 360 },
  exerciseContent: { paddingBottom: 26 },
  stage: { marginHorizontal: 18, minHeight: 260, backgroundColor: C.white, borderRadius: 24, borderWidth: 1, borderColor: C.line, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  ruleCard: { marginHorizontal: 18, marginTop: 15, paddingVertical: 17, paddingHorizontal: 18, borderRadius: 18, backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  cardTitle: { color: C.ink, fontSize: 15, fontWeight: '700', letterSpacing: -0.1 },
  cardBody: { color: C.inkSoft, fontSize: 13, lineHeight: 19, marginTop: 5 },
  dragStage: { height: 300, justifyContent: 'center' },
  dragGuide: { position: 'absolute', left: '16%', right: '16%', top: '50%', height: 1, borderTopWidth: 1, borderColor: '#D9CCEA', borderStyle: 'dashed' },
  guideDot: { position: 'absolute', top: '48.7%', width: 7, height: 7, borderRadius: 4, backgroundColor: '#B39BCB' },
  dragShapeWrap: { width: 132, height: 132, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
  dragShape: { width: 92, height: 92, borderRadius: 28, backgroundColor: C.forest, transform: [{ rotate: '45deg' }], alignItems: 'center', justifyContent: 'center', shadowColor: '#352448', shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 9 }, elevation: 7 },
  dragShapeCore: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.56)' },
  stageCaption: { position: 'absolute', bottom: 18, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  stageCaptionText: { fontSize: 9, letterSpacing: 1.2, fontWeight: '700', color: '#8F829B' },
  loadingStage: { height: 320, paddingHorizontal: 27 },
  spinnerOuter: { width: 68, height: 68, borderWidth: 3, borderColor: '#E8E1EF', borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  spinnerArc: { position: 'absolute', top: -3, left: 29, height: 17, width: 7, borderRadius: 4, backgroundColor: C.mintDeep },
  spinnerDot: { height: 9, width: 9, borderRadius: 5, backgroundColor: C.forest },
  loadingHeadline: { marginTop: 24, fontSize: 18, color: C.ink, fontWeight: '700' },
  loadingSubline: { marginTop: 7, fontSize: 12, color: C.inkSoft },
  progressTrack: { marginTop: 28, width: '100%', height: 5, borderRadius: 3, backgroundColor: '#EDE8F2', overflow: 'hidden' },
  progressFill: { height: 5, borderRadius: 3, backgroundColor: C.mintDeep },
  progressMeta: { width: '100%', marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  artStage: { height: 335, backgroundColor: '#FAF8FB' },
  artStageTop: { position: 'absolute', left: 17, right: 17, top: 17, flexDirection: 'row', justifyContent: 'space-between' },
  artStageLabel: { color: '#796E83', fontWeight: '700', fontSize: 8, letterSpacing: 1.3 },
  artworkGesture: { width: 220, height: 220 },
  artwork: { flex: 1, borderRadius: 5, backgroundColor: '#E5D8EF', overflow: 'hidden', borderWidth: 5, borderColor: '#FFFFFF', shadowColor: '#382A47', shadowOpacity: 0.16, shadowRadius: 17, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  artSun: { position: 'absolute', width: 59, height: 59, top: 25, right: 30, borderRadius: 30, backgroundColor: C.yellow },
  artMountainBack: { position: 'absolute', width: 190, height: 123, left: -36, top: 78, backgroundColor: '#AA97C0', transform: [{ rotate: '36deg' }], borderRadius: 17 },
  artMountainFront: { position: 'absolute', width: 188, height: 121, right: -42, top: 100, backgroundColor: '#725E88', transform: [{ rotate: '-34deg' }], borderRadius: 16 },
  artWater: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 63, backgroundColor: '#C6B4D7' },
  artReflection: { position: 'absolute', height: 4, width: 70, bottom: 31, left: 69, borderRadius: 3, backgroundColor: '#EBC8D0' },
  artReedOne: { position: 'absolute', width: 2, height: 54, bottom: 19, left: 31, backgroundColor: '#685477', transform: [{ rotate: '7deg' }] },
  artReedTwo: { position: 'absolute', width: 2, height: 40, bottom: 17, left: 40, backgroundColor: '#685477', transform: [{ rotate: '-7deg' }] },
  artSignature: { position: 'absolute', left: 11, top: 11 },
  artSignatureText: { color: 'rgba(42,34,51,0.7)', fontSize: 7, fontWeight: '700', letterSpacing: 1 },
  artStageBottom: { position: 'absolute', bottom: 17 },
  actionRow: { marginHorizontal: 23, marginTop: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  helperText: { fontSize: 11, color: C.inkSoft, flexShrink: 1 },
  actionButton: { backgroundColor: C.forest, minHeight: 40, paddingHorizontal: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionButtonQuiet: { backgroundColor: '#F0EBF5', borderWidth: 1, borderColor: '#E4DCEB' },
  actionButtonText: { fontSize: 11, fontWeight: '700', color: C.white },
  actionButtonTextQuiet: { color: C.forest },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  bounceStage: { height: 310 },
  bounceHalo: { position: 'absolute', width: 190, height: 190, borderRadius: 96, borderWidth: 1, borderColor: '#E9E2EF' },
  bounceShape: { width: 112, height: 112, borderRadius: 35, backgroundColor: C.lilac, alignItems: 'center', justifyContent: 'center', shadowColor: '#554364', shadowOpacity: 0.22, shadowRadius: 19, shadowOffset: { width: 0, height: 10 }, elevation: 6 },
  bounceCore: { width: 41, height: 41, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.72)' },
  bouncePrompt: { position: 'absolute', bottom: 21, color: '#8A7F92', letterSpacing: 1.5, fontSize: 9, fontWeight: '700' },
  carouselStage: { height: 347, backgroundColor: '#FAF8FB' },
  carouselSideCard: { position: 'absolute', width: 239, height: 242, borderRadius: 22, backgroundColor: '#ECE6F1', transform: [{ translateX: 18 }, { rotate: '7deg' }], opacity: 0.8 },
  carouselCard: { width: 244, height: 246, padding: 21, borderRadius: 22, justifyContent: 'space-between', shadowColor: '#342640', shadowOpacity: 0.14, shadowRadius: 17, shadowOffset: { width: 0, height: 8 }, elevation: 5 },
  carouselCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  carouselCategory: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  carouselCount: { fontSize: 9, fontWeight: '600', color: '#81758B', letterSpacing: 1 },
  carouselSymbol: { width: 80, height: 80, borderRadius: 26, justifyContent: 'center', alignItems: 'center', alignSelf: 'center', transform: [{ rotate: '-8deg' }] },
  carouselSymbolText: { color: '#FFFFFF', fontSize: 48, lineHeight: 57, fontWeight: '300' },
  carouselCardTitle: { fontSize: 21, color: C.ink, fontWeight: '700', letterSpacing: -0.5 },
  carouselCardText: { color: C.inkSoft, fontSize: 12, marginTop: 5 },
  carouselArrows: { position: 'absolute', bottom: 16, left: 30, right: 30, flexDirection: 'row', justifyContent: 'space-between' },
  carouselArrow: { color: '#93879D', fontSize: 25, fontWeight: '300' },
  carouselDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, marginTop: 16 },
  dot: { width: 6, height: 6, borderRadius: 4, backgroundColor: '#D4CBDD' },
  dotActive: { width: 20, backgroundColor: C.mintDeep },
  sensorStage: { height: 310 },
  sensorOrbit: { width: 184, height: 184, borderRadius: 95, borderWidth: 1, borderColor: '#E9E2EF', justifyContent: 'center', alignItems: 'center' },
  sensorOrbitInner: { width: 136, height: 136, borderRadius: 70, borderStyle: 'dashed', borderWidth: 1, borderColor: '#D9CDE6' },
  sensorShape: { position: 'absolute', width: 88, height: 88, borderRadius: 28, backgroundColor: C.forest, justifyContent: 'center', alignItems: 'center', shadowColor: '#241B2D', shadowOpacity: 0.23, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  sensorShapeCore: { width: 30, height: 30, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)' },
  sensorCounter: { position: 'absolute', top: 17, right: 20, color: '#8A7F92', fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  sensorCaption: { position: 'absolute', bottom: 18, color: '#8A7F92', fontSize: 9, fontWeight: '700', letterSpacing: 1.2 },
  routeNav: { marginHorizontal: 18, marginTop: 22, flexDirection: 'row', gap: 10 },
  routeButton: { flex: 1, minHeight: 62, paddingHorizontal: 12, borderRadius: 16, flexDirection: 'row', alignItems: 'center' },
  routeButtonPrevious: { backgroundColor: '#EEE9F3', borderWidth: 1, borderColor: '#E4DCEB' },
  routeButtonNext: { backgroundColor: C.forest, justifyContent: 'flex-end' },
  routeArrow: { color: C.forest, fontSize: 17, fontWeight: '500', marginRight: 9 },
  routeArrowNext: { color: C.mint, fontSize: 17, fontWeight: '500', marginLeft: 9 },
  routeButtonCopy: { flexShrink: 1 },
  routeButtonCopyNext: { alignItems: 'flex-end' },
  routeLabel: { color: '#8D7DA0', fontSize: 8, fontWeight: '700', letterSpacing: 1.1 },
  routeLabelNext: { color: '#D7C7E7' },
  routeTitle: { color: C.ink, fontSize: 10, fontWeight: '700', marginTop: 4 },
  routeTitleNext: { color: C.white, textAlign: 'right' },
  exerciseFooter: { marginHorizontal: 24, marginTop: 23, paddingTop: 12, borderTopWidth: 1, borderColor: C.line, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { color: '#93899A', fontSize: 8, fontWeight: '700', letterSpacing: 1.25 },
  homeContent: { paddingBottom: 35 },
  homeHero: { margin: 17, marginTop: 16, borderRadius: 23, backgroundColor: '#EEE7F5', minHeight: 300, overflow: 'hidden', flexDirection: 'row' },
  homeHeroCopy: { flex: 1, paddingTop: 26, paddingLeft: 21, paddingBottom: 20, zIndex: 1 },
  homeTitle: { color: C.ink, fontSize: 31, lineHeight: 34, letterSpacing: -1.1, fontWeight: '700', marginTop: 13 },
  homeSubtitle: { color: '#6F617C', fontSize: 12, lineHeight: 18, marginTop: 11, maxWidth: 250 },
  heroLink: { flexDirection: 'row', alignItems: 'center', marginTop: 18, alignSelf: 'flex-start', minHeight: 36, paddingHorizontal: 13, borderRadius: 11, backgroundColor: C.forest },
  heroLinkText: { color: C.white, fontSize: 10, fontWeight: '700' },
  heroLinkArrow: { color: C.mint, marginLeft: 11, fontSize: 14 },
  heroArt: { position: 'absolute', right: -20, top: 27, width: 150, height: 235 },
  heroCircleBack: { position: 'absolute', top: 38, right: -17, width: 144, height: 144, borderRadius: 75, borderWidth: 1, borderColor: 'rgba(141,107,181,0.28)' },
  heroCircleFront: { position: 'absolute', top: 59, right: 12, width: 99, height: 99, borderRadius: 34, transform: [{ rotate: '31deg' }], backgroundColor: '#BFA9D8', justifyContent: 'center', alignItems: 'center' },
  heroCircleCore: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#F8F6FA', borderWidth: 1, borderColor: '#9D82BA' },
  heroLine: { position: 'absolute', top: 18, right: 67, width: 1, height: 207, backgroundColor: 'rgba(141,107,181,0.24)', transform: [{ rotate: '26deg' }] },
  heroTag: { position: 'absolute', right: 37, bottom: 5, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, backgroundColor: C.white },
  heroTagText: { color: C.mintDeep, fontSize: 8, fontWeight: '700', letterSpacing: 1 },
  sectionHeading: { marginTop: 10, marginHorizontal: 22, marginBottom: 13, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: C.ink, fontSize: 19, fontWeight: '700', letterSpacing: -0.4, marginTop: 5 },
  sectionCount: { color: '#93899A', fontSize: 8, letterSpacing: 1, fontWeight: '700', marginBottom: 3 },
  practiceList: { marginHorizontal: 17, backgroundColor: C.white, borderRadius: 19, borderColor: C.line, borderWidth: 1, paddingHorizontal: 13 },
  practiceRow: { minHeight: 68, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: '#F0ECF3' },
  practiceRowPressed: { opacity: 0.6 },
  practiceMark: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  practiceMarkText: { color: C.ink, fontSize: 19, fontWeight: '400' },
  practiceInfo: { marginLeft: 12, flex: 1 },
  practiceName: { color: C.ink, fontSize: 12, fontWeight: '700' },
  practiceShort: { color: '#8B8193', fontSize: 10, marginTop: 4 },
  practiceNumber: { color: '#A298AA', fontSize: 9, fontWeight: '700', letterSpacing: 1, marginRight: 11 },
  practiceArrow: { color: C.mintDeep, fontSize: 16 },
  homeNote: { marginHorizontal: 23, marginTop: 23, flexDirection: 'row', alignItems: 'flex-start' },
  noteLine: { width: 2, height: 31, borderRadius: 2, backgroundColor: C.mintDeep, marginRight: 11 },
  homeNoteText: { color: '#786E81', fontSize: 10, lineHeight: 16, flex: 1 },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: '#150F1C' },
  drawer: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 310, backgroundColor: C.forestDeep, paddingTop: 27, paddingHorizontal: 20, paddingBottom: 21, elevation: 18, shadowColor: '#150F1C', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 8, height: 0 } },
  drawerTop: { flexDirection: 'row', alignItems: 'center', paddingBottom: 28, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.14)' },
  drawerBrandMark: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#E4D7F2', alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '10deg' }], marginRight: 12 },
  drawerBrandCore: { width: 16, height: 16, borderRadius: 5, borderWidth: 1, borderColor: C.forest },
  drawerBrandTitle: { color: '#F7F2FA', fontSize: 15, lineHeight: 18, fontWeight: '700', letterSpacing: -0.2 },
  drawerSection: { color: '#BEA9D1', fontSize: 9, letterSpacing: 1.6, fontWeight: '700', marginTop: 24, marginBottom: 10 },
  drawerItem: { minHeight: 47, borderRadius: 12, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', marginVertical: 2 },
  drawerItemActive: { backgroundColor: 'rgba(228,215,242,0.14)' },
  drawerItemPressed: { opacity: 0.72 },
  drawerItemNumber: { color: '#B8A7C3', fontSize: 9, width: 27, fontWeight: '700', letterSpacing: 0.7 },
  drawerItemNumberActive: { color: C.mint },
  drawerItemTitle: { color: '#E8E0EC', fontSize: 12, flex: 1, fontWeight: '500' },
  drawerItemTitleActive: { color: C.white, fontWeight: '700' },
  drawerActiveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: C.mint },
  drawerFooter: { marginTop: 'auto' },
  drawerFooterRule: { height: 1, backgroundColor: 'rgba(255,255,255,0.14)', marginBottom: 14 },
  drawerFooterText: { color: '#B09DBD', fontSize: 8, letterSpacing: 1.2, fontWeight: '700', marginTop: 4 },
});
