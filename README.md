# litewrite 2024

Welcome to the litewrite Web App

## Easy way to run the whole project

```bash
make run
```

## Verify that backend is running

After running the project, issue the following command:

```bash
curl -H 'Accept: application/json' localhost:8000/api/version
```

## Verify that frontend is running

After running the project, visit [http://localhost](http://localhost) in a browser of your choice.

## Dependency changes in frontend

When new packages are installed, you'll need to run first 

```bash
make rebuild-frontend
```
and then

```bash
make run
```