import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const prophetApiUrl =
    process.env.PROPHET_API_URL ||
    "http://127.0.0.1:8000/predict";

  try {
    const body = await request.json();

    const response = await fetch(prophetApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: body.history,
        forecastDays: body.forecastDays,
      }),
      cache: "no-store",
    });

    const responseText = await response.text();

    let result: any;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = {
        message: responseText || "Prophet service mengembalikan respons kosong.",
      };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          message:
            result?.detail ||
            result?.message ||
            "Prophet service mengembalikan error.",
        },
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Prophet API error:", error);

    return NextResponse.json(
      {
        message:
          "Next.js tidak dapat terhubung ke Python Prophet Service.",
        url: prophetApiUrl,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      {
        status: 503,
      }
    );
  }
}