import { NextResponse } from "next/server";

const JUDGE0_URL =
    process.env.JUDGE0_URL || "https://ce.judge0.com";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { source_code, language_id, stdin = "", expected_output } = body;

        if (!source_code || !language_id) {
            return NextResponse.json(
                {
                    error: "source_code and language_id are required",
                },
                { status: 400 }
            );
        }

        const response = await fetch(
            `${JUDGE0_URL}/submissions/?base64_encoded=false&wait=true`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",

                    ...(process.env.JUDGE0_API_KEY
                        ? {
                            "X-Auth-Token": process.env.JUDGE0_API_KEY,
                        }
                        : {}),
                },
                body: JSON.stringify({
                    source_code,
                    language_id,
                    stdin,
                    ...(expected_output ? { expected_output } : {}),
                    cpu_time_limit: 2,
                    memory_limit: 128000,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {
                    error: data?.error || "Code execution failed",
                    details: data,
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            result: data,
        });
    } catch (error) {
        console.error("Code execution error:", error);

        return NextResponse.json(
            {
                error: "Unable to execute code",
            },
            { status: 500 }
        );
    }
}