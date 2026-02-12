from fastapi import FastAPI

app = FastAPI(title="Clinical Regulatory Intelligence API")

@app.get("/")
def root():
    return {"status": "Backend is running"}
