# PACA-API

Ce projet permet d'importer des documents, de les traiter et de les envoyer ensuite à apidae au bon format.

## Prérequis
- Docker
- NodeJS 14

Idéalement nvm

Les fichiers d'imports doivent se trouver dans le dossier *var/data/import/nom_de_import*
## install

```bash
npm install
```

## Compiler SASS, minifier le CSS et le JS, pensez à bien effectuer cette commande avant de commit

```bash
npm run build
```


## Générer les fichiers de mapping depuis les fichiers csv

csv2json installé globlalement

```bash
csv2json -d -s "|" input_file output_file

```

## Lancer le site en local
```bash
docker-compose up -d
npm run dev
```

## Lancer le site en production

- Utiliser pm2 avec le fichier de config ecosystem.config.js
- Configurer les crons avec les scripts d'import automatique