# Prérequis
Il vous faut installer __node__ et __npm__.

# Installation
Se placer dans le dossier APP et installer les dépendances du projet.

```bash
cd APP
npm install
```

# Démarrage de Neo4J
Fichier de configuration : **docker-compose.yml**

```bash
docker-compose up
```
## Configuration de Neo4j
Une fois le container docker démarré, ouvrez un navigateur sur [localhost:7474](http://localhost:7474). Lors du premier lancement, Neo4j vous demande de vous identifier pour changer le mot de passe par défaut : *neo4j*. Renseignez ensuite le mot de passe que vous souhaitez.

## Création du fichier .env
Il est impératif de créer un fichier __.env__ à la racine du dossier APP. Celui-ci contiendra le mot de passe Neo4j fraichement configuré.

```yaml
# fichier .env
NEO_PASS=mon_super_mot_de_passe
```

# Démarrage du Backend
## En mode développement
```bash
# Lance : ts-node-dev --respawn src/index.ts (voir package.json)
npm run start.dev
```

## En mode production
```bash
# Lance : node dist/index.js (voir package.json)
npm run start.prod
```

## Tests
Utilisation du module [newman](https://www.npmjs.com/package/newman) pour effectuer toutes les requêtes sur nos endpoints.

```bash
# Lance : newman run tests.postman_collection.json
npm test
```

Les tests vont simulés le comportement de 3 utilisateurs. Utilisez cette commande pour peupler la base avec des données d'exemple.

# Documentations
- [Neo4j](https://neo4j.com/docs/)
- [Neo4j Driver Javascript](https://neo4j.com/docs/driver-manual/1.7/get-started/)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/basic-types.html)
