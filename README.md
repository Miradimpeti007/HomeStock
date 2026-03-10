# 🏠 HomeStock

> Application de gestion de stock domestique — Projet de groupe

---

## 📋 Description

HomeStock est une application desktop (Electron + Nuxt.js) permettant de gérer son inventaire à la maison : produits, dates de péremption, liste de courses et historique de consommation.

---

## 👥 Équipe

| Membre | Rôle |
|--------|------|
| Miradi | Architecture & Base de données |
| Walid | Tableau de bord & Inventaire |
| Sofia | Liste de courses & Configuration |

---

## 🛠 Stack Technique

- **Frontend** : Nuxt.js 4 + Vue 3 + Tailwind CSS
- **Backend** : Node.js + Sequelize
- **Base de données** : SQLite
- **Desktop** : Electron

---

## 🗄 Structure de la Base de Données

- **Categories** : Catégories de produits (Laitages, Boulangerie, etc.)
- **Locations** : Emplacements de stockage (Frigo, Congélateur, Cellier...)
- **Products** : Stock actif avec quantité, seuil, date de péremption
- **ShoppingItems** : Liste de courses
- **ConsumedHistories** : Historique des produits consommés ou jetés

---

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone https://github.com/Miradimpeti007/HomeStock.git
cd HomeStock
```

### 2. Installer les dépendances backend
```bash
npm install
```

### 3. Installer les dépendances frontend
```bash
cd app-stock
npm install
```

### 4. Lancer le projet

**Backend :**
```bash
cd /HomeStock
node server.js
```

**Frontend :**
```bash
cd app-stock
npm run dev
```

L'application sera disponible sur `http://localhost:3000`

---

## 📱 Pages de l'application

| Page | Description | Responsable |
|------|-------------|-------------|
| `/` | Tableau de bord (compteurs, alertes) | Walid |
| `/inventaire` | Gestion du stock actif | Walid |
| `/courses` | Liste de courses avec progression | Sofia |
| `/configuration` | Paramètres et notifications | Sofia |

---

## ⚙️ Règles Métier

- ❌ Impossible d'incrémenter le stock depuis l'inventaire
- ✅ Le stock augmente uniquement en validant une course
- 🔴 Alerte rouge si produit périmé
- 🟠 Alerte orange si péremption dans moins de 7 jours
- 🔄 Réassort automatique si stock sous le seuil minimum

---

## 📁 Structure du projet
```
HomeStock/
├── config/          # Configuration base de données
├── database/        # Fichiers de base de données
├── migrations/      # Migrations Sequelize
├── models/          # Modèles Sequelize
├── scripts/         # Scripts utilitaires
├── app-stock/       # Application Nuxt.js (Frontend)
│   └── app/
│       ├── pages/   # Pages de l'application
│       ├── composables/
│       └── assets/
└── README.md
```
