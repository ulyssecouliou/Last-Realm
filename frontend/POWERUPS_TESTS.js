// ============================================
// TESTS DU SYSTÈME DE POWERUPS
// ============================================
// À exécuter dans la console du navigateur quand vous êtes dans le jeu

/**
 * TEST 1: Vérifier que les multiplicateurs existent
 */
function testMultipliers() {
  console.log('=== TEST 1: Multiplicateurs ===');
  if (window.playerRef?.current) {
    console.log('✓ speedMultiplier:', window.playerRef.current.speedMultiplier);
    console.log('✓ rotationSpeedMultiplier:', window.playerRef.current.rotationSpeedMultiplier);
    console.log('✓ sizeMultiplier:', window.playerRef.current.sizeMultiplier);
    return true;
  }
  console.log('✗ Erreur: playerRef non accessible');
  return false;
}

/**
 * TEST 2: Vérifier que les powerups sont en train d'être créés
 */
function testPowerupCreation() {
  console.log('=== TEST 2: Création de Powerups ===');
  if (window.powerupsRef?.current) {
    console.log('✓ Nombre de powerups actifs:', window.powerupsRef.current.length);
    window.powerupsRef.current.forEach((p, i) => {
      console.log(`  Powerup ${i}: type=${p.type}, x=${p.x}, y=${p.y}, isAlive=${p.isAlive}`);
    });
    return true;
  }
  console.log('✗ Erreur: powerupsRef non accessible');
  return false;
}

/**
 * TEST 3: Forcer la création d'un powerup
 */
function forceCreatePowerup() {
  console.log('=== TEST 3: Création forcée de Powerup ===');
  if (!window.playerRef?.current) {
    console.log('✗ Erreur: playerRef non accessible');
    return false;
  }
  
  const player = window.playerRef.current;
  const types = ['speed_boost', 'rotation_speed', 'size_boost'];
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  console.log('✓ Création d\'un powerup de type:', randomType);
  // Vous devrez appeler createPowerup depuis votre composant
  return true;
}

/**
 * TEST 4: Tester l'application d'un powerup manuellement
 */
function testApplyPowerup(type) {
  console.log('=== TEST 4: Application de Powerup ===');
  if (!window.playerRef?.current) {
    console.log('✗ Erreur: playerRef non accessible');
    return false;
  }
  
  const player = window.playerRef.current;
  const validTypes = ['speed_boost', 'rotation_speed', 'size_boost'];
  
  if (!validTypes.includes(type)) {
    console.log('✗ Type invalide. Types acceptés:', validTypes);
    return false;
  }
  
  const before = {
    speedMultiplier: player.speedMultiplier,
    rotationSpeedMultiplier: player.rotationSpeedMultiplier,
    sizeMultiplier: player.sizeMultiplier
  };
  
  // Appliquer le powerup
  switch(type) {
    case 'speed_boost':
      player.speedMultiplier *= 1.5;
      break;
    case 'rotation_speed':
      player.rotationSpeedMultiplier *= 2;
      break;
    case 'size_boost':
      player.sizeMultiplier *= 1.5;
      if (player.sprite) {
        player.sprite.scale.set(
          player.sprite.scale.x * 1.5,
          player.sprite.scale.y * 1.5
        );
      }
      break;
  }
  
  const after = {
    speedMultiplier: player.speedMultiplier,
    rotationSpeedMultiplier: player.rotationSpeedMultiplier,
    sizeMultiplier: player.sizeMultiplier
  };
  
  console.log('✓ Powerup appliqué:', type);
  console.log('  Avant:', before);
  console.log('  Après:', after);
  return true;
}

/**
 * TEST 5: Vérifier la collision avec les powerups
 */
function testPowerupCollision() {
  console.log('=== TEST 5: Collision Powerups ===');
  if (!window.powerupsRef?.current || !window.playerRef?.current) {
    console.log('✗ Erreur: références non accessible');
    return false;
  }
  
  const player = window.playerRef.current;
  console.log('Position du joueur:', { x: player.x, y: player.y });
  
  window.powerupsRef.current.forEach((powerup, i) => {
    const distance = Math.sqrt(
      (powerup.x - player.x) ** 2 + 
      (powerup.y - player.y) ** 2
    );
    const colliding = distance < 40;
    console.log(`  Powerup ${i}: distance=${distance.toFixed(1)}, collision=${colliding}`);
  });
  
  return true;
}

/**
 * TEST 6: Afficher les statistiques du joueur
 */
function testPlayerStats() {
  console.log('=== TEST 6: Statistiques du Joueur ===');
  if (!window.playerRef?.current) {
    console.log('✗ Erreur: playerRef non accessible');
    return false;
  }
  
  const player = window.playerRef.current;
  console.log('Santé:', `${player.health}/${player.maxHealth}`);
  console.log('Position:', `(${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
  console.log('Vitesse base:', player.speed);
  console.log('Vitesse effective:', player.speed * player.speedMultiplier);
  console.log('Vitesse rotation épée:', player.rotationSpeedMultiplier + 'x');
  console.log('Taille personnage:', player.sizeMultiplier + 'x');
  console.log('Powerups collectés:', player.activePowerups?.length || 0);
  
  return true;
}

/**
 * TEST 7: Stress test - Créer beaucoup de powerups
 */
function stressTestPowerups(count) {
  console.log(`=== TEST 7: Stress Test (${count} powerups) ===`);
  console.log('⚠️ Cette fonction doit être complétée dans le composant');
  console.log('Elle créerait', count, 'powerups à des positions aléatoires');
  // À implémenter selon vos besoins
}

/**
 * TEST 8: Vérifier les références PixiJS
 */
function testPixiReferences() {
  console.log('=== TEST 8: Références PixiJS ===');
  
  const checks = {
    playerRef: !!window.playerRef?.current,
    powerupsRef: !!window.powerupsRef?.current,
    swordRef: !!window.swordRef?.current,
    gameRef: !!window.gameRef?.current,
    appRef: !!window.appRef?.current,
  };
  
  Object.entries(checks).forEach(([ref, exists]) => {
    console.log(`${exists ? '✓' : '✗'} ${ref}: ${exists ? 'OK' : 'MANQUANT'}`);
  });
  
  return Object.values(checks).every(v => v);
}

// ============================================
// EXÉCUTER TOUS LES TESTS
// ============================================
function runAllTests() {
  console.log('\n🧪 EXÉCUTION DE TOUS LES TESTS DU SYSTÈME DE POWERUPS\n');
  
  const tests = [
    ['Multiplicateurs', testMultipliers],
    ['Création de Powerups', testPowerupCreation],
    ['Collision', testPowerupCollision],
    ['Statistiques du Joueur', testPlayerStats],
    ['Références PixiJS', testPixiReferences]
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(([name, testFn]) => {
    try {
      const result = testFn();
      if (result) passed++;
      else failed++;
    } catch (error) {
      console.log(`✗ Erreur dans ${name}:`, error.message);
      failed++;
    }
    console.log('');
  });
  
  console.log(`\n📊 RÉSULTATS: ${passed}/${tests.length} tests réussis`);
  return failed === 0;
}

// ============================================
// RACCOURCIS UTILES
// ============================================
console.log(`
📚 POWERUPS - COMMANDES DE TEST

Exécuter tous les tests:
  runAllTests()

Tests individuels:
  testMultipliers()
  testPowerupCreation()
  testPowerupCollision()
  testPlayerStats()
  testPixiReferences()

Actions manuelles:
  testApplyPowerup('speed_boost')
  testApplyPowerup('rotation_speed')
  testApplyPowerup('size_boost')

Visualiser le joueur:
  window.playerRef.current

Visualiser les powerups:
  window.powerupsRef.current

Visualiser l'épée:
  window.swordRef.current

`);
