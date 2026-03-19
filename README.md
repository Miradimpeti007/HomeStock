# 🏠 HomeStock

> Ne gaspillez plus jamais. Gérez votre stock domestique comme un pro.

HomeStock est une application **desktop** (Electron + Nuxt.js) qui vous permet de suivre votre inventaire alimentaire, anticiper les péremptions, gérer votre liste de courses et consulter l'historique de consommation.

---

## 👥 Auteurs

| Nom | Rôle | GitHub |
|-----|------|--------|
| **MPETI EBOMA Miradi** | Lead Dev Backend & Electron (Architecture, BDD, IPC) | [GitHub](https://github.com/Miradimpeti007) |
| **ALI Walid** | Frontend — Tableau de bord & Inventaire | [GitHub](#) |
| **VEMBA MARTINS Sofia** | Frontend — Liste de courses & Configuration | [GitHub](#) |

---

## 📄 Description

HomeStock répond à un problème du quotidien : on achète des produits qu'on a déjà, on oublie ce qui périme, et on gaspille sans s'en rendre compte.

L'application permet de :
- 📦 Gérer son stock alimentaire en temps réel
- 🔴 Être alerté des produits périmés ou en rupture
- 🛒 Générer automatiquement une liste de courses
- 📊 Visualiser l'état global de son stock sur un tableau de bord
- 📋 Consulter l'historique complet des produits consommés ou jetés

### Fonctionnalités Clés

> ⚠️ **Focus Desktop :** L'application utilise **Electron** avec un système **IPC** (Inter-Process Communication) pour communiquer entre le frontend Nuxt.js et le backend Node.js. Elle envoie des **notifications natives** au système d'exploitation et fonctionne comme une vraie application desktop installée sur la machine.

* [x] Tableau de bord avec compteurs en temps réel
* [x] Inventaire complet avec gestion des quantités
* [x] Alertes visuelles de péremption (vert/orange/ambre/rouge)
* [x] Réassort automatique (Auto-Refill)
* [x] Liste de courses avec progression
* [x] Validation des courses → retour en stock automatique
* [x] Page historique — tout ce qui a été consommé ou jeté
* [x] Page de configuration (emplacements, notifications)
* [x] Notifications natives Electron
* [x] Communication IPC Electron ↔ Nuxt.js

---

## 🎨 Conception & Design

> **[Voir la maquette sur Figma](https://sepia-build-20535071.figma.site)**

L'interface suit un design **dark mode** minimaliste inspiré des applications SaaS modernes.

---

## 📐 Architecture & UML

L'application suit une architecture **MVC** stricte :
- **Model** : Sequelize + SQLite (5 tables)
- **View** : Nuxt.js 4 + Vue 3 + Pinia
- **Controller** : Node.js + IPC Electron (handlers)

### Diagramme de séquence — Cycle de vie d'un produit
```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface (Nuxt.js)
    participant IPC as Electron IPC
    participant H as Handler (Node.js)
    participant DB as SQLite

    U->>UI: Décrémente un produit
    UI->>IPC: invoke('product:update')
    IPC->>H: product.handler.js
    H->>DB: UPDATE Products SET quantity
    DB-->>H: Confirmation
    H-->>IPC: Réponse
    IPC-->>UI: Nouveau stock
    alt Stock < minQuantity ET autoRefill = true
        H->>DB: INSERT ShoppingItems
        H-->>UI: Notification native "Ajouté aux courses"
    end
    UI-->>U: Alerte visuelle (rouge/orange)
```

### Diagramme d'architecture — Structure du projet
```mermaid
graph TB
    subgraph Desktop["🖥️ Electron (Desktop)"]
        Main["server.js (Main Process)"]
        Preload["preload.js (Bridge)"]
        subgraph IPC["IPC Layer"]
            IPCP["product.ipc.js"]
            IPCC["config.ipc.js"]
            IPCI["index.js"]
        end
        subgraph Handlers["Handlers (Controllers)"]
            HP["product.handler.js"]
            HC["config.handler.js"]
        end
        subgraph Utils["Utils"]
            Q["query.util.js"]
            R["response.util.js"]
        end
    end

    subgraph Frontend["🌐 Nuxt.js (Renderer)"]
        subgraph Pages["Pages"]
            D["dashboard.vue"]
            I["inventaire.vue"]
            C["courses.vue"]
            CF["configuration.vue"]
            H2["historique.vue"]
        end
        Pinia["Pinia Store"]
    end

    subgraph Database["🗄️ SQLite"]
        M1["Categories"]
        M2["Locations"]
        M3["Products"]
        M4["ShoppingItems"]
        M5["ConsumedHistories"]
    end

    Frontend <-->|IPC invoke/handle| Desktop
    Desktop <-->|Sequelize ORM| Database
```

### Schéma de la Base de Données
```
Categories          Locations
├── id              ├── id
├── name            └── name
└── color
        ↑                   ↑
        │                   │
     Products ──────────────┘
     ├── id
     ├── name
     ├── quantity
     ├── minQuantity
     ├── unit (L/kg/ml/mg/unite)
     ├── expirationDate
     ├── autoRefill
     ├── categoryId (FK)
     └── locationId (FK)
         │
         ↓
  ShoppingItems          ConsumedHistories
  ├── id                 ├── id
  ├── name               ├── name
  ├── quantity           ├── unit
  ├── isCompleted        ├── consumedDate
  ├── categoryId         ├── wasThrownAway
  └── linkedProductId    ├── categoryId
                         └── locationId
```

---

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Desktop** | Electron 40 |
| **Frontend** | Nuxt.js 4, Vue 3, Pinia |
| **Backend** | Node.js, Sequelize ORM |
| **Base de données** | SQLite |
| **Validation** | VeeValidate |
| **Versionning** | Git, GitHub |
| **Design** | Figma |

---

## 📸 Démonstration

| Tableau de bord | Liste de courses |
| :---: | :---: |
| ![Dashboard](assets/dashboard.png) | ![Courses](assets/courses.png) |

| Inventaire | Configuration |
| :---: | :---: |
| ![Inventaire](assets/inventaire.png) | ![Config](assets/config.png) |

---

## 🚀 Installation & Lancement

### Prérequis
- Node.js v18+
- npm

### 1. Cloner le dépôt
```bash
git clone https://github.com/Miradimpeti007/HomeStock.git
cd HomeStock
```

### 2. Installer les dépendances backend & Electron
```bash
npm install
```

### 3. Installer les dépendances frontend
```bash
cd app-stock
npm install
cd ..
```

### 4. Initialiser la base de données
```bash
node scripts/init_db.js
node scripts/seedDb.js
```

### 5. Lancer l'application Electron
```bash
npm start
```

### 6. Lancer uniquement le frontend (développement)
```bash
cd app-stock
npm run dev
```

---

## 🤖 Section IA & Méthodologie

### 1. Prompts Utilisés
- *"Crée un schéma de base de données SQLite pour une app de gestion de stock avec Sequelize"* → Structure des modèles
- *"Comment faire communiquer Nuxt.js avec Electron via IPC ?"* → Architecture IPC
- *"Génère un composant Vue avec une barre de progression dynamique"* → Composant liste de courses
- *"Explique le pattern MVC appliqué à Electron + Node.js"* → Architecture globale
- *"Comment utiliser Pinia pour le state management dans Nuxt 4 ?"* → Gestion du state

### 2. Modifications Manuelles & Debug
- L'IA suggérait d'utiliser `localStorage` pour le state — remplacé par **Pinia**
- Le code généré pour les migrations Sequelize utilisait une syntaxe dépréciée — corrigé manuellement
- Les règles métier (Auto-Refill, validation des courses, historique) ont été entièrement codées manuellement
- L'architecture IPC Electron a été restructurée avec handlers et utils séparés

### 3. Répartition Code IA vs Code Humain

| Partie | IA | Humain |
|--------|-----|--------|
| Boilerplate / Config | 70% | 30% |
| Modèles BDD & Migrations | 30% | 70% |
| Logique Métier (Auto-Refill, Historique) | 0% | 100% |
| Interface (UI/UX) | 40% | 60% |
| Architecture IPC Electron | 20% | 80% |

---

## ⚖️ Auto-Évaluation

**Ce qui fonctionne bien :**
- Interface dark mode moderne et cohérente
- Logique métier bien définie (Auto-Refill, alertes péremption, historique)
- Architecture modulaire avec séparation claire via IPC
- Communication propre entre Electron et Nuxt.js

**Difficultés rencontrées :**
- Gestion des conflits Git lors du travail en équipe
- Intégration Electron + Nuxt.js (communication IPC complexe)
- Bugs de synchronisation entre les pages résolus en repartant de zéro

**Si c'était à refaire :**
- Définir l'architecture IPC avant de commencer le frontend
- Utiliser Pinia dès le début
- Faire des Pull Requests systématiques

---

## 📄 Licence

MIT License — Libre d'utilisation et de modification.
