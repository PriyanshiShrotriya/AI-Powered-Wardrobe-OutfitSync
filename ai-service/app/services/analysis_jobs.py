from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from threading import Lock
from typing import Any, Dict, Optional
from uuid import uuid4

from app.services.image_analyzer import analyze_clothing_image


@dataclass
class AnalysisJob:
    job_id: str
    status: str = 'queued'
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    future: Optional[Any] = None
    image_base64: str = ''
    created_at: str = ''
    updated_at: str = ''


class AnalysisJobStore:
    def __init__(self) -> None:
        self._jobs: Dict[str, AnalysisJob] = {}
        self._lock = Lock()
        self._executor = ThreadPoolExecutor(max_workers=2)

    def submit_image_analysis(self, image_base64: str) -> AnalysisJob:
        job = AnalysisJob(job_id=uuid4().hex, image_base64=image_base64)
        with self._lock:
            self._jobs[job.job_id] = job
            job.status = 'processing'

        future = self._executor.submit(self._run_job, job.job_id)
        job.future = future
        return job

    def _run_job(self, job_id: str) -> None:
        with self._lock:
            job = self._jobs.get(job_id)
            if job is None:
                return

        try:
            result = analyze_clothing_image(job.image_base64)
            with self._lock:
                job.status = 'completed'
                job.result = result
                job.error = None
        except Exception as exc:  # pragma: no cover - background execution path
            with self._lock:
                job.status = 'failed'
                job.error = str(exc)
                job.result = None

    def get_job(self, job_id: str) -> Optional[AnalysisJob]:
        with self._lock:
            return self._jobs.get(job_id)


analysis_job_store = AnalysisJobStore()
