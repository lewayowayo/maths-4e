# Maths 4e

Appli de révision pour le contrôle de maths de 4e, construite à partir des leçons du cahier : **nombres relatifs** (partie 1) et **géométrie / démonstrations** (partie 2).

- **Leçons** : les règles du cahier en version courte, avec figures (D1-D3, médiatrice, M1-M2, parallélogramme P1-P6, propriété et réciproque, rédaction d'une démonstration).
- **Entraîner** : 17 compétences à exercices générés à l'infini (addition, soustraction, simplification d'écriture, somme algébrique, signe d'un produit, multiplication, produit de plusieurs facteurs, division, opposé ; notations, propriétés à trous, « que peut-on conclure ? », « quelle propriété ? », réciproque, démonstration à remettre en ordre, démonstration à construire). Chaque compétence monte d'un niveau après 3 bonnes réponses d'affilée, redescend à chaque erreur ; la difficulté suit le niveau ; une erreur affiche la correction détaillée et fait revenir une question du même type 3 questions plus loin. Les compétences maîtrisées reviennent en révision à 1, 2, 4 et 8 jours.
- **Parcours du jour** : 12 questions mélangées, centrées sur les compétences faibles et les révisions dues.
- **Contrôle blanc** : 20 questions comme le vrai (10 points relatifs, 10 points géométrie), sans correction avant la fin, puis correction complète et note sur 20.
- Série de jours, XP, niveaux, badges.

Progression stockée sur le téléphone (localStorage), pas de compte, fonctionne hors ligne une fois installée (« Ajouter à l'écran d'accueil »).

## Fichiers
- `index.html` : interface. `engine.js` : moteur d'exercices (pur, sans DOM). `test/engine.test.js` : `node test/engine.test.js` vérifie ~34 000 questions générées (réponses recalculées indépendamment).
- Pour ajouter une compétence : un générateur dans `engine.js` + une ligne dans `SKILLS` + éventuellement une entrée dans `TEST_PLAN` et une leçon dans `index.html`.

En ligne : https://lewayowayo.github.io/maths-4e/
