"""
main.py
-------
FastAPI application for SERP Lens — Keyword Research + Rank Checker.
"""

import asyncio
import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncIterator

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

import requests as req
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

from scraper import RankResult, check_rank, _build_search_url, _make_session
from keywords import fetch_keyword_data, KeywordResult

logging.basicConfig(
    stream=sys.stdout,
    level=logging.DEBUG,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    logger.info("SERP Lens API starting up …")
    yield
    logger.info("SERP Lens API shutting down.")


app = FastAPI(title="SERP Lens", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class RankRequest(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=200)
    domain: str = Field(..., min_length=1, max_length=253)
    location: str = Field(..., min_length=1, max_length=300)

    @field_validator("keyword", "domain", "location", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class RankResponse(BaseModel):
    keyword: str
    domain: str
    location: str
    rank: int | None
    found: bool
    total_results_parsed: int


class KeywordRequest(BaseModel):
    keyword: str = Field(..., min_length=1, max_length=200)
    country: str = Field(..., min_length=1, max_length=100)
    language: str = Field(default="en", min_length=2, max_length=10)

    @field_validator("keyword", "country", "language", mode="before")
    @classmethod
    def strip_whitespace(cls, v: str) -> str:
        return v.strip()


class KeywordRow(BaseModel):
    keyword: str
    trend: list[int]           # 12 monthly relative values 0-100
    trend_direction: str       # "up" | "down" | "flat"
    competition: str           # "low" | "medium" | "high"
    source: str                # where it came from


class KeywordResponse(BaseModel):
    seed: str
    country: str
    language: str
    keywords: list[KeywordRow]
    total: int


class HealthResponse(BaseModel):
    status: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health", response_model=HealthResponse, tags=["Meta"])
async def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.post(
    "/api/rank",
    response_model=RankResponse,
    status_code=status.HTTP_200_OK,
    tags=["Rank"],
)
async def rank_check(payload: RankRequest) -> RankResponse:
    logger.info("Rank request | keyword=%r | domain=%r | location=%r",
                payload.keyword, payload.domain, payload.location)
    try:
        result: RankResult = await check_rank(
            keyword=payload.keyword,
            domain=payload.domain,
            canonical_location=payload.location,
        )
    except RuntimeError as exc:
        message = str(exc)
        if "429" in message:
            raise HTTPException(status_code=429, detail=message) from exc
        raise HTTPException(status_code=502, detail=f"SERP scraping error: {message}") from exc
    except req.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"Network error: {exc}") from exc

    return RankResponse(
        keyword=result.keyword,
        domain=result.domain,
        location=result.location,
        rank=result.rank,
        found=result.found,
        total_results_parsed=result.total_results_parsed,
    )


@app.post(
    "/api/keywords",
    response_model=KeywordResponse,
    status_code=status.HTTP_200_OK,
    tags=["Keywords"],
)
async def keyword_research(payload: KeywordRequest) -> KeywordResponse:
    logger.info("Keyword research | seed=%r | country=%r | language=%r",
                payload.keyword, payload.country, payload.language)
    try:
        results: list[KeywordResult] = await fetch_keyword_data(
            seed=payload.keyword,
            country=payload.country,
            language=payload.language,
        )
    except Exception as exc:
        logger.error("Keyword fetch error: %s", exc, exc_info=True)
        raise HTTPException(status_code=502, detail=f"Keyword fetch error: {exc}") from exc

    rows = [
        KeywordRow(
            keyword=r.keyword,
            trend=r.trend,
            trend_direction=r.trend_direction,
            competition=r.competition,
            source=r.source,
        )
        for r in results
    ]

    return KeywordResponse(
        seed=payload.keyword,
        country=payload.country,
        language=payload.language,
        keywords=rows,
        total=len(rows),
    )
