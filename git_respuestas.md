# Git y control de versiones

## 1. Crear una rama llamada `feature/filtro-por-sede` desde `main`

```bash
git checkout main
git pull origin main
git checkout -b feature/filtro-por-sede
```

`git checkout main` cambia a la rama base. `git pull origin main` trae los ultimos cambios. `git checkout -b` crea la rama nueva y se mueve a ella.

## 2. Commit con conventional commits

```bash
git add .
git commit -m "feat: agregar filtro por sede en estudiantes"
```

`git add .` prepara los cambios. El mensaje usa `feat:` porque agrega funcionalidad. Para una correccion usaria `fix:` y para documentacion `docs:`.

## 3. Subir la rama al remoto

```bash
git push -u origin feature/filtro-por-sede
```

Sube la rama y configura tracking para futuros `git push` y `git pull` sin repetir el remoto.

## 4. Crear un Pull Request

Entraria al repositorio en GitHub, abriria la rama `feature/filtro-por-sede` y crearia un Pull Request hacia `main`.

En la descripcion incluiria:

- Resumen del cambio.
- Pantallas, endpoints o reglas de negocio afectadas.
- Como se probo: build, pruebas manuales y casos por rol.
- Riesgos conocidos o decisiones tomadas.
- Capturas si aplica al frontend.

## 5. Que hacer si hay conflictos al hacer pull de `main`

Primero actualizaria referencias y ubicaria la rama:

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

Si el equipo usa rebase en vez de merge:

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

Al final correria build/pruebas, revisaria `git status` y subiria la rama actualizada.
