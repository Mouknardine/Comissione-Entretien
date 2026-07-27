# Photos du site

Les 8 photos sont en place. Elles ont été **redimensionnées (1600–1800 px)
et recompressées** pour le web : 7,8 Mo au départ → 2,7 Mo au total.
Ne pas remplacer un fichier par une photo brute de téléphone sans repasser
par la même étape (sinon le score Core Web Vitals chute).

| Fichier | Où elle apparaît |
|---|---|
| `camion-hydrocureuse-immeuble-vaud.jpg` | Page Canalisations (visuel principal) · Page Nettoyage & conciergerie (ouverture) |
| `camion-remorque-hydrocurage-bavois.jpg` | Accueil — carte « Débouchage » |
| `chantier-canalisation-tranchee-vaud.jpg` | Accueil — galerie · Page Canalisations (inspection) |
| `debouchage-sanitaire-sous-evier.jpg` | Accueil — galerie · Page Canalisations (urgence) |
| `nettoyage-panneaux-solaires-perche.jpg` | Accueil — carte + galerie · Page Panneaux solaires |
| `nettoyage-terrasse-dallage-avant-apres.jpg` | Accueil — carte · Page Nettoyage & conciergerie |
| `nettoyage-facade-maison-avant-apres.jpg` | Accueil — galerie · Page Nettoyage & conciergerie |
| `flotte-vehicules-commissione-entretien.jpg` | Accueil — section À propos · Page Nettoyage & conciergerie (conciergerie) |

Le paysage du hero de l'accueil est dans `assets/paysage-vaud-bavois.png`.

## Pour remplacer ou ajouter une photo

Depuis le Terminal, dans ce dossier :

```bash
sips -Z 1600 --setProperty formatOptions 65 ma-photo.jpg --out ma-photo.jpg
```

Viser **moins de 350 Ko par fichier**.

## Visuel encore souhaitable

La section « Service de conciergerie pour immeubles » utilise actuellement la
photo de la flotte de véhicules. Une photo de **cage d'escalier, de palier ou
de local poubelles nettoyé** serait plus parlante : la déposer sous le nom
`conciergerie-parties-communes.jpg` et remplacer la référence dans
`nettoyage-conciergerie/index.html`.
