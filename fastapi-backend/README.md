# Resume Analyser Backend

## Project Structure

```
├── pyproject.toml
├── README.md
├── src
│   ├── config.py
│   ├── core
│   │   ├── logging.py
│   │   └── server.py
│   ├── database.py
│   ├── dependency.py
│   ├── features
│   │   ├── resume
│   │   │   ├── config.py
│   │   │   ├── models.py
│   │   │   ├── repository.py
│   │   │   ├── router.py
│   │   │   ├── schemas.py
│   │   │   ├── services.py
│   │   │   └── utils
│   │   │       ├── ai_analyzer.py
│   │   │       ├── ai_config.py
│   │   │       ├── job_match_calculator.py
│   │   │       ├── nlp_analyzer.py
│   │   │       ├── personal_info_extractor.py
│   │   │       ├── prompt_creator.py
│   │   │       ├── response_formatter.py
│   │   │       ├── resume_detail_extractor.py
│   │   │       ├── section_extractor.py
│   │   │       ├── skills_analyzer.py
│   │   │       ├── text_extractor.py
│   │   │       └── utils.py
│   │   └── users
│   │       ├── models.py
│   │       ├── repository.py
│   │       └── router.py
│   └── main.py
└── uv.lock

```

## Follow below instructions to run this in your system:

1. First of all make `.env` in root directory and paste relevant secrets
2. This project uses `uv` package manager, so download that in your system
3. Then on terminal open the root folder of fastapi-backend
4. Then run `uv run src/main.py`

