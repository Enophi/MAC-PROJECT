# Prérequis
Il vous faut installer __node__ et __npm__.

# Installation
Se placer dans le dossier APP et installer les dépendances du projet.

```bash
cd APP
npm install
```

# Démarrage de Neo4J

```bash
docker-compose up
```
## Configuration de Neo4j
Une fois le container docker démarré, connectez-vous sur [localhost:7474](http://localhost:7474). Lors du premier lancement, Neo4j vous demande de vous identifier pour changer le mot de passe par défaut : *neo4j*. Renseignez ensuite le mot de passe que vous souhaitez.

### Exemple de création d'une recette dans le shell Neo4j
```bash
# Création d'une recette de tarte au citron
CREATE (r:Recipe {name: "Tarte au citron", preparation:90}) RETURN r
# Création de l'ingrédient citron
CREATE (i:Ingredient {name:"citron"}) RETURN i
# Création de la relation
MATCH (r:Recipe),(i:Ingredient)
WHERE r.name = 'Tarte au citron' AND i.name = 'citron'
CREATE (r)-[rel:HAS {quantity:4, unit:'pce'}]->(i)
RETURN rel
```

## Création du fichier .env
Il est impératif de créer un fichier __.env__ à la racine du dossier APP

```yaml
# fichier .env
NEO_PASS=mon_super_mot_de_passe
```

# Démarrage du Backend
## En mode développement
```bash
# Lance ts-node-dev --respawn src/index.ts (voir package.json)
npm run start.dev
```

## En mode production
```bash
# Lance node dist/index.js (voir package.json)
npm run start.prod
```

## Commencer à coder
Une route a été définie pour montrer la structure du projet.

Accédez à http://localhost:3000/recipes (browser, postman, ...) pour récupérer toutes les recettes sauvegardées en base.

# Documentations
- [Neo4j](https://neo4j.com/docs/)
- [Neo4j Driver Javascript](https://neo4j.com/docs/driver-manual/1.7/get-started/)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/basic-types.html)
