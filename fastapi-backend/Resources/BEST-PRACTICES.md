Here are **best practices** and a **recommended project structure** for a FastAPI + MongoDB app—drawing from real-world open-source setups:

---

## ✅ Key Practices

1. **Separation of Concerns / Modular Design**

   * Group by feature/domain, not by file type
   * Each domain gets its own `router`, `schemas`, `models`, `services`, `dependencies`, etc.
     This improves maintainability and allows vertical slicing of code ([github.com][1], [debuglab.net][2], [reddit.com][3]).

2. **Schemas vs Models**

   * Use **Pydantic schemas** for request/response validation and API docs
   * Use **database models** for your Mongo collections or ODM (Beanie/Motor)
     This separation keeps the API layer decoupled from your storage schema and enables data transformations, hidden fields, and enhanced doc clarity ([stackoverflow.com][4], [reddit.com][5]).

3. **Service Layer for Business Logic**

   * Keep routes thin—do minimal parameter handling and call `services.*`
   * Services encapsulate business rules and call into database/DAO layers.
     Many developers advocate controller → service → repository layers ([reddit.com][6]).

4. **Database Connection & Lifespan Management**

   * Initialize your Mongo client in a lifespan event (`startup`/`shutdown`)
   * Expose via a FastAPI `Depends` call or attach to `app.state`
     This avoids global variables and ensures proper connection cleanup ([masteringbackend.com][7], [compilenrun.com][8]).

5. **Indexes & Performance**

   * Define indexes on frequently filtered, unique, or text-search fields
   * Create indexes in startup events using Motor or ODM tools ([compilenrun.com][8], [reddit.com][9]).

6. **Testing & Documentation**

   * Write unit tests for each service function
   * Write integration tests using FastAPI's `TestClient` for routers
   * FastAPI auto-generates OpenAPI/Swagger via type hints and schemas ([medium.com][10], [technostacks.com][11]).

7. **Consistent Code Style & Config Management**

   * Use linters/formatters (e.g., Black, Flake8, MyPy) for style consistency ([medium.com][10], [reddit.com][12])
   * Centralize settings using `BaseSettings` or Pydantic Settings (e.g. `config.py`) ([stackoverflow.com][4]).

---

## 🏗 Suggested Project Structure

```
my_fastapi_mongo_app/
├── src/
│   ├── main.py              # app & lifespan startup, includes routers
│   ├── config.py            # settings (DB URI, secrets)
│   ├── database.py          # init Mongo client (lifecycle, indexes)
│   ├── dependencies.py      # common DI (e.g. get_db)
│   ├── core/                # utilities, shared exceptions, security, etc.
│   │   └── security.py
│   └── features/            # vertical slice per domain
│       ├── todos/
│       │   ├── router.py        # APIRouter for /todos
│       │   ├── schemas.py       # Pydantic schemas
│       │   ├── models.py        # MongoDB model or Beanie document
│       │   ├── service.py       # business logic
│       │   ├── repository.py    # DB ops (insert, update, find)
│       │   └── dependencies.py  # feature-specific DI
│       └── users/               # another domain
│           └── ...
├── tests/
│   ├── features/
│   │   ├── todos/           # unit tests for service + integration tests for routers
│   │   └── users/
│   └── conftest.py
├── .env
├── requirements.txt
└── README.md
```

**Highlights:**

* **`src/main.py`**: Creates FastAPI, registers lifespan event to init Mongo with indexes, includes feature routers.
* **`database.py`**: Handles client lifecycle and exposes `app.state.db` or via `get_db` DI.
* **Feature Modules**:

  * `models.py`: Defines Mongo collection schema (Beanie document or custom model).
  * `schemas.py`: Defines Pydantic schemas for API contracts.
  * `repository.py`: Handles direct DB operations, uses `models.py`.
  * `service.py`: Contains business logic calling `repository`.
  * `router.py`: Defines routes, depends on service.
* **Config & Security**: `config.py`, `core/security.py`, `dependencies.py` promote reuse.
* **Tests**: Unit + integration tests ensure each layer is verified.

---

## ⚙️ FastAPI + MongoDB Specific Tips

1. **Use Motor or Beanie for async** interactions.
2. **On startup**: connect and create required indexes ([blog.stackademic.com][13], [compilenrun.com][8], [medium.com][14], [reddit.com][6], [dev.to][15]).
3. **Serialize `_id:ObjectId`** to string in responses using helper functions ([medium.com][16]).
4. **Use indexes**, e.g.:

   ```python
   @app.on_event("startup")
   async def create_indexes():
       await db.todos.create_index("user_id")
       await db.todos.create_index([("title","text")])
   ```

---

## 🔁 Summary Table

| Layer               | Responsibility                                                  |
| ------------------- | --------------------------------------------------------------- |
| **router.py**       | Defines endpoints, delegates to `service`, light error handling |
| **schemas.py**      | Pydantic models for input/output validation                     |
| **models.py**       | MongoDB/Beanie document definitions                             |
| **repository.py**   | CRUD/database operations                                        |
| **service.py**      | Business logic, validation, orchestration                       |
| **database.py**     | Connection lifecycle & index creation                           |
| **config.py**       | Environment-based settings management                           |
| **dependencies.py** | Shared DI functions                                             |
| **tests/**          | Unit + integration tests per feature                            |

---

By following this **vertical-slice structure**, you gain:

* **Scalability** as features grow
* Better **testability**, with isolated layers
* Cleaner code separation & reuse
* Easier **collaboration** in teams
* Enhanced **readability** and maintainability
