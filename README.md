# Dashboard Raspberry Pi

Un tableau de bord web pour gérer et monitorer vos Raspberry Pi en réseau.

## Fonctionnalités

- 📊 **Monitoring en temps réel** : Température, humidité et état de l'éclairage
- 🎛️ **Contrôle de lampe** : Allumez/éteignez les lampes connectées
- 🔄 **Drag & Drop** : Réorganisez l'ordre de vos appareils
- 🌓 **Mode sombre** : Interface adaptable avec sauvegarde des préférences
- 💾 **Stockage local** : Vos appareils sont sauvegardés dans le navigateur

## Installation

1. Ouvrez `index.html` dans un navigateur web
2. Cliquez sur "Ajouter" pour enregistrer vos Raspberry Pi
3. Entrez le nom et l'adresse IP (format : `192.168.1.50:65030`)

## Utilisation

- **Ajouter un appareil** : Bouton "Ajouter" dans le header
- **Basculer l'éclairage** : Cliquez sur le switch du card
- **Réorganiser** : Glissez les appareils par l'icône ⋮⋮
- **Supprimer** : Bouton corbeille en haut à droite du card

## Technologies

- **Tailwind CSS** : Styling responsive
- **Sortable.js** : Drag & drop
- **LocalStorage** : Persistence des données
