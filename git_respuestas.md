# Git y control de versiones

## 1. Crear una rama llamada `feature/filtro-por-sede` desde `main`

```bash
git checkout main
git pull origin main
git checkout -b feature/filtro-por-sede
```

`git checkout main` cambia a la rama base. `git pull origin main` actualiza la rama local. `git checkout -b` crea la rama nueva y se mueve a ella.

## 2. Commit con conventional commits

```bash
git add .
git commit -m "feat: agregar filtro por sede en estudiantes"
```

`git add .` prepara los cambios. El mensaje usa el prefijo `feat:` porque agrega funcionalidad.

## 3. Subir la rama al remoto

```bash
git push -u origin feature/filtro-por-sede
```

Sube la rama y deja configurado el tracking para futuros `git push` y `git pull`.

## 4. Crear un Pull Request

Entraria al repositorio en GitHub, abriria la rama `feature/filtro-por-sede` y crearia un Pull Request hacia `main`.

En la descripcion incluiria:

- Resumen del cambio.
- Endpoints o pantallas afectadas.
- Como se probo.
- Riesgos conocidos o decisiones tomadas.
- Capturas si aplica al frontend.

## 5. Que hacer si hay conflictos al hacer pull de `main`

```bash
git status
git fetch origin
git checkout feature/filtro-por-sede
git merge origin/main
```

Si Git reporta conflictos:

```bash
git status
```

Abriria cada archivo marcado como conflictuado, resolveria los bloques `<<<<<<<`, `=======`, `>>>>>>>`, y luego ejecutaria:

```bash
git add <archivo-resuelto>
git commit
npm run build
```

Si el proyecto usa rebase en vez de merge:

```bash
git fetch origin
git checkout feature/filtro-por-sede
git rebase origin/main
```

Resolveria cada conflicto, luego:

```bash
git add <archivo-resuelto>
git rebase --continue
```

Al final correria pruebas/build, revisaria `git status` y subiria la rama actualizada.
