from datetime import date, timedelta
from typing import List

import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from prophet import Prophet


app = FastAPI(
    title="Poultry Inventory Prophet Service",
    version="2.0.0",
)


class HistoryItem(BaseModel):
    date: date
    besar: float = 0
    sedang: float = 0
    kecil: float = 0
    total: float = 0


class PredictionRequest(BaseModel):
    history: List[HistoryItem]
    forecastDays: int = Field(default=7, ge=1, le=30)


def prepare_dataframe(history: List[HistoryItem], field_name: str) -> pd.DataFrame:
    rows = [
        {
            "ds": item.date,
            "y": max(0.0, float(getattr(item, field_name))),
        }
        for item in history
    ]

    dataframe = pd.DataFrame(rows)

    if dataframe.empty:
        return pd.DataFrame(columns=["ds", "y"])

    dataframe["ds"] = pd.to_datetime(dataframe["ds"])
    dataframe["y"] = pd.to_numeric(
        dataframe["y"], errors="coerce"
    ).fillna(0)

    dataframe = (
        dataframe[["ds", "y"]]
        .groupby("ds", as_index=False)["y"]
        .sum()
        .sort_values("ds")
        .reset_index(drop=True)
    )

    return dataframe


def fit_prophet(dataframe: pd.DataFrame) -> Prophet:
    # Weekly seasonality baru diaktifkan jika histori cukup panjang.
    use_weekly = len(dataframe) >= 14

    model = Prophet(
        daily_seasonality=False,
        weekly_seasonality=use_weekly,
        yearly_seasonality=False,
        interval_width=0.80,
    )

    model.fit(dataframe)
    return model


def baseline_forecast(
    train: pd.DataFrame,
    horizon: int,
) -> List[float]:
    if train.empty:
        return [0.0] * horizon

    # Untuk data yang sangat sedikit, gunakan rata-rata train
    # agar API tetap stabil dan tidak membuat model palsu.
    baseline = float(train["y"].mean())

    return [
        max(0.0, round(baseline, 2))
        for _ in range(horizon)
    ]


def forecast_from_model(
    model: Prophet,
    horizon: int,
) -> List[float]:
    future = model.make_future_dataframe(
        periods=horizon,
        freq="D",
        include_history=False,
    )

    forecast = model.predict(future)

    return [
        max(0.0, float(value))
        for value in forecast["yhat"].tail(horizon)
    ]


def calculate_metrics(
    actual: List[float],
    predicted: List[float],
) -> dict:
    if not actual:
        return {
            "mae": 0.0,
            "rmse": 0.0,
            "mape": 0.0,
            "samples": 0,
        }

    actual_series = pd.Series(actual, dtype="float64")
    predicted_series = pd.Series(predicted, dtype="float64")

    errors = actual_series - predicted_series

    mae = float(errors.abs().mean())
    rmse = float((errors.pow(2).mean()) ** 0.5)

    non_zero = actual_series.abs() > 0

    if non_zero.any():
        mape = float(
            (
                (
                    (
                        actual_series[non_zero]
                        - predicted_series[non_zero]
                    ).abs()
                    / actual_series[non_zero].abs()
                ).mean()
            )
            * 100
        )
    else:
        mape = 0.0

    return {
        "mae": round(mae, 2),
        "rmse": round(rmse, 2),
        "mape": round(mape, 2),
        "samples": len(actual),
    }


def evaluate_category(
    dataframe: pd.DataFrame,
) -> dict:
    """
    Evaluasi time-series secara chronological split.

    Contoh:
    80% awal = training
    20% akhir = testing

    Data test tidak dipakai saat model training.
    """

    total_rows = len(dataframe)

    # Minimal 5 titik untuk evaluasi sederhana.
    if total_rows < 5:
        return {
            "available": False,
            "message": (
                "Data belum cukup untuk evaluasi. "
                "Minimal 5 hari data diperlukan."
            ),
            "trainDays": total_rows,
            "testDays": 0,
            "metrics": calculate_metrics([], []),
            "testData": [],
        }

    # 80% train, 20% test.
    train_size = max(
        3,
        int(total_rows * 0.8),
    )

    # Pastikan test set tetap memiliki minimal 1 hari.
    if train_size >= total_rows:
        train_size = total_rows - 1

    train = dataframe.iloc[:train_size].copy()
    test = dataframe.iloc[train_size:].copy()

    if len(train) < 3 or test.empty:
        return {
            "available": False,
            "message": "Pembagian training/testing belum mencukupi.",
            "trainDays": len(train),
            "testDays": len(test),
            "metrics": calculate_metrics([], []),
            "testData": [],
        }

    try:
        model = fit_prophet(train)
        predicted = forecast_from_model(
            model,
            len(test),
        )
    except Exception as error:
        # Fallback hanya untuk menjaga endpoint tetap dapat memberikan
        # evaluasi saat library Prophet gagal pada dataset sangat kecil.
        print("Evaluation Prophet error:", error)
        predicted = baseline_forecast(
            train,
            len(test),
        )

    actual = test["y"].tolist()

    test_data = []

    for index, row in test.reset_index(drop=True).iterrows():
        test_data.append(
            {
                "date": row["ds"].date().isoformat(),
                "actual": round(float(actual[index]), 2),
                "predicted": round(
                    float(predicted[index]),
                    2,
                ),
            }
        )

    return {
        "available": True,
        "message": "Evaluasi chronological holdout 80/20.",
        "trainDays": len(train),
        "testDays": len(test),
        "trainStart": train.iloc[0]["ds"].date().isoformat(),
        "trainEnd": train.iloc[-1]["ds"].date().isoformat(),
        "testStart": test.iloc[0]["ds"].date().isoformat(),
        "testEnd": test.iloc[-1]["ds"].date().isoformat(),
        "metrics": calculate_metrics(
            actual,
            predicted,
        ),
        "testData": test_data,
    }


def future_forecast(
    dataframe: pd.DataFrame,
    forecast_days: int,
) -> List[float]:
    if dataframe.empty:
        return [0.0] * forecast_days

    if len(dataframe) < 3:
        return baseline_forecast(
            dataframe,
            forecast_days,
        )

    try:
        model = fit_prophet(dataframe)
        return [
            round(value, 2)
            for value in forecast_from_model(
                model,
                forecast_days,
            )
        ]
    except Exception as error:
        print("Future Prophet error:", error)

        return baseline_forecast(
            dataframe,
            forecast_days,
        )


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "Prophet",
        "features": [
            "training",
            "chronological evaluation",
            "future forecasting",
        ],
    }


@app.post("/predict")
def predict(request: PredictionRequest):
    try:
        if not request.history:
            raise HTTPException(
                status_code=400,
                detail="Histori ayam keluar belum tersedia.",
            )

        history = sorted(
            request.history,
            key=lambda item: item.date,
        )

        categories = {
            "besar": prepare_dataframe(
                history,
                "besar",
            ),
            "sedang": prepare_dataframe(
                history,
                "sedang",
            ),
            "kecil": prepare_dataframe(
                history,
                "kecil",
            ),
        }

        evaluations = {}

        for category, dataframe in categories.items():
            evaluations[category] = evaluate_category(
                dataframe
            )

        future = {}

        for category, dataframe in categories.items():
            future[category] = future_forecast(
                dataframe,
                request.forecastDays,
            )

        daily_predictions = []

        last_date = history[-1].date

        for index in range(request.forecastDays):
            besar = round(future["besar"][index])
            sedang = round(future["sedang"][index])
            kecil = round(future["kecil"][index])

            forecast_date = (
                last_date
                + timedelta(days=index + 1)
            )

            daily_predictions.append(
                {
                    "date": forecast_date.isoformat(),
                    "besar": besar,
                    "sedang": sedang,
                    "kecil": kecil,
                    "total": besar + sedang + kecil,
                }
            )

        predictions = {
            "besar": sum(
                item["besar"]
                for item in daily_predictions
            ),
            "sedang": sum(
                item["sedang"]
                for item in daily_predictions
            ),
            "kecil": sum(
                item["kecil"]
                for item in daily_predictions
            ),
        }

        predictions["total"] = (
            predictions["besar"]
            + predictions["sedang"]
            + predictions["kecil"]
        )

        available_metrics = [
            evaluations[category]["metrics"]
            for category in evaluations
            if evaluations[category]["available"]
        ]

        if available_metrics:
            overall_metrics = {
                "mae": round(
                    sum(
                        item["mae"]
                        for item in available_metrics
                    )
                    / len(available_metrics),
                    2,
                ),
                "rmse": round(
                    sum(
                        item["rmse"]
                        for item in available_metrics
                    )
                    / len(available_metrics),
                    2,
                ),
                "mape": round(
                    sum(
                        item["mape"]
                        for item in available_metrics
                    )
                    / len(available_metrics),
                    2,
                ),
            }
        else:
            overall_metrics = {
                "mae": 0.0,
                "rmse": 0.0,
                "mape": 0.0,
            }

        return {
            "model": "Prophet",
            "historyDays": len(history),
            "forecastDays": request.forecastDays,
            "training": {
                "method": "Chronological Holdout",
                "trainRatio": 0.8,
                "testRatio": 0.2,
                "note": (
                    "Training menggunakan 80% data awal "
                    "dan testing menggunakan 20% data terbaru."
                ),
            },
            "evaluation": {
                "overall": overall_metrics,
                "categories": evaluations,
            },
            "predictions": predictions,
            "dailyPredictions": daily_predictions,
        }

    except HTTPException:
        raise

    except Exception as error:
        print("========================================")
        print("PROPHET API ERROR")
        print(type(error).__name__)
        print(str(error))
        print("========================================")

        raise HTTPException(
            status_code=500,
            detail=f"Prophet gagal memproses data: {str(error)}",
        )