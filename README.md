# 🏠 HomeStock

> Ne gaspillez plus jamais. Gérez votre stock domestique comme un pro.

HomeStock est une application **desktop** (Electron + Nuxt.js) qui vous permet de suivre votre inventaire alimentaire, anticiper les péremptions, gérer votre liste de courses et consulter l'historique de consommation.

---

## 👥 Auteurs

| Nom | Rôle | GitHub |
|-----|------|--------|
| **MPETI EBOMA Miradi** | Lead Dev Backend & Electron (Architecture, BDD, IPC, System Tray) | [GitHub](https://github.com/Miradimpeti007) |
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
- 🔔 Recevoir des notifications natives du système

### Fonctionnalités Clés

> ⚠️ **Focus Desktop :** L'application utilise **Electron** avec :
> - Un **System Tray** (icône près de l'horloge système)
> - Des **notifications natives** automatiques lors des péremptions ou ruptures de stock
> - Un **Watcher** qui surveille le stock en arrière-plan
> - Une communication **IPC** entre le frontend Nuxt.js et le backend Node.js

* [x] Tableau de bord avec compteurs en temps réel
* [x] Inventaire complet avec gestion des quantités
* [x] Alertes visuelles de péremption (vert/orange/ambre/rouge)
* [x] Réassort automatique (Auto-Refill)
* [x] Liste de courses avec progression et validation
* [x] Page historique — tout ce qui a été consommé ou jeté
* [x] Page de configuration (emplacements, paramètres, notifications)
* [x] System Tray (icône dans la barre système)
* [x] Notifications natives Electron
* [x] Watcher automatique de surveillance du stock
* [x] Architecture Design Atomique (molecules/organisms)

---

## 🎨 Conception & Design

> **[Voir la maquette sur Figma](https://sepia-build-20535071.figma.site)**

L'interface suit un design **dark mode** minimaliste inspiré des applications SaaS modernes.

---

## 📐 Architecture & UML

L'application suit une architecture **MVC** stricte avec **Design Atomique** :
- **Model** : Sequelize + SQLite (6 tables)
- **View** : Nuxt.js 4 + Vue 3 (atoms/molecules/organisms)
- **Controller** : Node.js + IPC Electron (handlers + services)

### Diagramme de séquence — Cycle de vie d'un produit
```mermaid