# Contributing to ClinicOS

Thank you for your interest in contributing! To ensure a smooth collaboration, please follow the guidelines below.

## 🌱 Branching Strategy

We follow a structured branching model:

- **`main`**: The primary branch representing production-ready code. Do not push directly to `main`.
- **`feature/<feature-name>`**: Create this branch from `main` for developing new features (e.g., `feature/eprescription-pdf`).
- **`bugfix/<bug-name>`**: Create this branch for resolving bugs (e.g., `bugfix/auth-middleware-crash`).
- **`hotfix/<issue-name>`**: For urgent production fixes.

Always open a Pull Request (PR) against the `main` branch once your feature or fix is complete.

## 📝 Commit Conventions

We strictly follow [Conventional Commits](https://www.conventionalcommits.org/). This helps in automatically generating changelogs.

**Format:**
```
<type>(<optional scope>): <description>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes only
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

**Examples:**
- `feat(auth): add JWT role-based access control`
- `fix(billing): resolve incorrect total calculation`
- `docs: update setup instructions in README`

## 💅 Code Style

1. **TypeScript Strict Mode:** We enforce strict typing. Avoid using `any` unless absolutely necessary.
2. **ESLint & Prettier:** Ensure your code passes all linting rules before opening a PR. You can run checks locally via:
   ```bash
   npm run lint
   npm run type-check # (if configured, otherwise npx tsc --noEmit)
   ```
3. **Tests:** New features must include relevant Vitest unit tests or Playwright E2E tests.

Thank you for helping us build a robust health tech platform!
