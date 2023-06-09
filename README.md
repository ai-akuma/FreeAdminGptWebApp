[![GitHub repo size](https://img.shields.io/github/repo-size/ai-akuma/FreeAdminGptWebApp)](https://github.com/ai-akuma/FreeAdminGptWebApp)

![GitHub last commit](https://img.shields.io/github/last-commit/ai-akuma/FreeAdminGptWebApp)
![GitHub issues](https://img.shields.io/github/issues/ai-akuma/FreeAdminGptWebApp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/ai-akuma/FreeAdminGptWebApp)
![GitHub contributors](https://img.shields.io/github/contributors/ai-akuma/FreeAdminGptWebApp)

<img alt="NodeJS" src="https://img.shields.io/badge/-NodeJS-43853d?style=flat-square&logo=Node.js&logoColor=white" />
  <img alt="Google Cloud" src="https://img.shields.io/badge/-Google%20Cloud-4285F4?style=flat-square&logo=Google%20Cloud&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/-Express-000000?style=flat-square&logo=Express&logoColor=white" />
<img src="https://img.shields.io/badge/language-JavaScript%20%7C%20HTML%20%7C%20TypeScript-yellow" alt="Language: JavaScript | HTML | TypeScript">
<img src="https://img.shields.io/badge/HTML-5-orange?logo=html5" alt="HTML5 Badge">
<img src="https://img.shields.io/badge/TypeScript-4.3.5-blue?logo=typescript" alt="TypeScript Badge">

https://github.com/ai-akuma/FreeAdminGptWebApp/assets/7444521/0129844a-2786-4b16-b16a-51b9cbecc87a

# Tubemaker

## Admin Dashboard for Youtube Script Generation

Find this application at tubemaker.io

Full stack applicaiton that allows users to create scripts for youtube videos. The application is built with Angular 12, Node.js, Express.js, and Firebase Realtime Database. The application is hosted on Google Cloud and Firebase for file storage. The application is built with the CoreUI Angular Admin Template.

## Quick Start

From core directory run:

```
npm install -r requirements.txt
npm run start:dev
ng serve
```

You may need to modify or insert the environments file.

Navigate to [http://localhost:4200](http://localhost:4200). The app will automatically reload if you change any of the source files.

###### Node.js

[**Angular 15**](https://angular.io/guide/what-is-angular) requires `Node.js` LTS version `^14.20` or `^16.13` or `^18.10`.

- To check your version, run `node -v` in a terminal/console window.
- To get `Node.js`, go to [nodejs.org](https://nodejs.org/).

###### Angular CLI

Install the Angular CLI globally using a terminal/console window.

```bash
npm install -g @angular/cli
```

#### Build

Run `build` to build the project. The build artifacts will be stored in the `dist/` directory.

```bash
# build for production with minification
$ npm run build
```

## What's included

Within the download you'll find the following directories and files, logically grouping common assets and providing both compiled and minified variations. You'll see something like this:

```
coreui-free-angular-admin-template
├── src/                         # project root
│   ├── app/                     # main app directory
|   │   ├── containers/          # layout containers
|   |   │   └── default/  # layout containers
|   |   |       └── _nav.js      # sidebar navigation config
|   │   ├── icons/
|   |   |*** Legion ***       ### Specific front end code for this project ###
|   │   └── views/               # application views
│   ├── assets/                  # images, icons, etc.
│   ├── components/              # components for demo only
│   ├── scss/                    # scss styles
│   └── index.html               # html template
│
├── angular.json
├── README.md
└── package.json
```

## Deploy Commands

Navigate into `backend` folder and run

```
gcloud auth login
gcloud config set project <ID>
gcloud app deploy
```

From root directory run:

```
ng build
firebase deploy --only hosting
```

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng g c component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Creators

**Adrian Mohnacs**

- <https://twitter.com/adrianmohnacs>
- <https://github.com/ai-akuma>
- <https://linkinedin.com/in/adrian-mohnacs>
