---
title: Installation
position: 2
category: Getting started
---

There are several ways to to install this theme.

## Using the Gridsome CLI

The easiest way to install this theme or a Gridsome theme in general is by using their CLI tool.

If you don't already have it installed, simply run:

```bash
npm i -g @gridsome/cli
```

After that run `gridsome -v` to verify that the tool is working.

If everything is working as expected, run the following command:

```bash
gridsome create your-project-name https://github.com/mrcrmn/docc
```

This command creates a folder named `your-project-name` in your current working directory, clones the repository and automatically installs the dependencies.

If everything is downloaded and installed you can now run `npm run develop` which starts the development server and bundles all assets. After bootstrapping has finished, head to `http://localhost:8080` to view your freshly created site!

## Installing manually

To install this theme manually you need to:

1. Clone the repository
2. Install the dependencies

To clone the repository simply run:

```bash
git clone https://github.com/mrcrmn/docc.git
```

After cloning the project, change to the project you just created.

```bash
cd docc
```

Now you only need to install the dependencies.

Using npm:
```bash
npm install
```

Or by using yarn:
```bash
yarn
```

After all dependencies are installed you can now run `npm run develop` to start the development server!