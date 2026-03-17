Build / test / lint

- Build: npm run build  # runs tsc, outputs to dist/
- Dev (full local checks): npm run dev  # runs fmt, lint, test
- Format: npm run fmt  (check: npm run fmt:check)
- Lint: npm run lint  (auto-fix: npm run lint:fix)
- Tests: npm run test  (runs vitest)
- Coverage: npm run test:coverage
- Watch mode: npm run test:watch
- Run a single test file: npx vitest run test/event-source.test.ts
- Run a single test by name: npx vitest -t "<test name>"

High-level architecture

- Purpose: small event-source module providing an HTTP-style API over an EventsStorage interface.
- API surface:
  - src/event-source.ts: EventSource class with a fetch(req: Request): Promise<Response> method. It expects URLs of the form /events/:key and supports GET (read events), POST (append event), DELETE (remove events).
  - src/memory-events-storage.ts: default in-memory implementation of EventsStorage (addEvent, getEvents, removeEvents).
  - src/types.ts: EventsStorage interface declaration used throughout.
- Runtime target: ESM (module: nodenext). The code uses Request/Response globals and is compatible with worker/edge-like environments as well as Node ESM.

Key conventions

- Always use explicit .js extensions in import paths inside src (e.g. import "./memory-events-storage.js"). This matches ESM runtime paths and the project's TypeScript/tsc setup.
- Private instance state uses JS private fields (#name).
- Tests live in test/ and use vitest. Tests import source files using the same ".js" extension pattern.
- URL routing is strict: path must split into exactly two meaningful segments: ["events", "<key>"]. Trailing slashes or extra segments return 404.
- Error mapping:
  - TypeError => 400 Bad Request
  - Unsupported HTTP method => 405 Method Not Allowed
  - Other errors => 500 Internal Server Error
- Formatting/linting uses oxfmt / oxlint (not prettier/eslint). Run the project scripts above to ensure consistent style.

Other AI assistant config files

- No CLAUDE.md, .cursorrules, AGENTS.md, .windsurfrules, CONVENTIONS.md, AIDER_CONVENTIONS.md, .clinerules, or similar files detected in the repository root.

Notes for Copilot sessions

- When suggesting code touching imports or runtime behavior, preserve the ".js" extension in import specifiers.
- When modifying request/response handling, keep the strict URL parsing and existing error mapping to avoid changing public behavior.
- If adding a new EventsStorage implementation, implement the three methods from src/types.ts and prefer dependency-injection into new EventSource(...) for testability.

