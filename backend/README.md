## Backend (Flask + MongoDB)

### Setup

Create a virtualenv and install deps:

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Configure environment:

```bash
copy .env.example .env
```

Run:

```bash
python app.py
```

Health check: `GET /health`

