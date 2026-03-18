import { NextResponse } from 'next/server';

type ForecastRow = {
    startTime?: string;
    publishTime?: string;
    generation?: number;
};

type ForecastPayload = ForecastRow[] | { data?: ForecastRow[] };

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const horizonParam = searchParams.get('horizon');

    if (!start || !end || !horizonParam) {
        return NextResponse.json(
            { error: 'Missing start, end, or horizon parameters' },
            { status: 400 }
        );
    }

    const maxHorizonHours = parseInt(horizonParam, 10);

    if (isNaN(maxHorizonHours)) {
        return NextResponse.json(
            { error: 'Invalid horizon parameter' },
            { status: 400 }
        );
    }

    try {
        // The WINDFOR base endpoint requires publishDateTimeFrom and publishDateTimeTo for historical queries.
        // We calculate publishStartMs by subtracting the horizon from the target start date.
        const publishStartMs = new Date(start as string).getTime() - (maxHorizonHours * 60 * 60 * 1000);
        const publishEndMs = new Date(end as string).getTime();

        const url = new URL(`https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream`);
        url.searchParams.append('publishDateTimeFrom', new Date(publishStartMs).toISOString());
        url.searchParams.append('publishDateTimeTo', new Date(publishEndMs).toISOString());

        console.log('Fetching Forecasts from Elexon BMRS API:', url.toString());

        const response = await fetch(url.toString(), {
            next: { revalidate: 3600 }, // Cache for 1 hour
            signal: AbortSignal.timeout(20000)
        });

        if (!response.ok) {
            throw new Error(`Elexon API returned status: ${response.status}`);
        }

        const json = (await response.json()) as ForecastPayload;
        const data = Array.isArray(json) ? json : (json.data || []);

        // We need to filter rows where the forecast horizon (startTime - publishTime) 
        // is between 0 and 48 hours (maxHorizonHours)

        const maxHorizonMs = maxHorizonHours * 60 * 60 * 1000;
        const requestedStartMs = new Date(start as string).getTime();
        const requestedEndMs = new Date(end as string).getTime();

        const filteredData = data
            .filter((item) => {
                if (!item.startTime || !item.publishTime || typeof item.generation !== 'number') {
                    return false;
                }

                const startMs = new Date(item.startTime).getTime();
                const publishMs = new Date(item.publishTime).getTime();
                const diffMs = startMs - publishMs;

                if (startMs < requestedStartMs || startMs > requestedEndMs) {
                    return false;
                }

                return diffMs >= 0 && diffMs <= maxHorizonMs;
            })
            .map((item) => ({
                startTime: item.startTime as string,
                publishTime: item.publishTime as string,
                generation: item.generation as number
            }))
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        const aggregatedMap = new Map<string, { startTime: string; publishTime: string; generation: number }>();

        for (const item of filteredData) {
            const existing = aggregatedMap.get(item.startTime);
            if (!existing) {
                aggregatedMap.set(item.startTime, item);
            } else {
                if (new Date(item.publishTime).getTime() > new Date(existing.publishTime).getTime()) {
                    aggregatedMap.set(item.startTime, item);
                }
            }
        }

        const finalData = Array.from(aggregatedMap.values());

        return NextResponse.json(finalData);

    } catch (error) {
        console.error('Error fetching forecasts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch forecast generation data' },
            { status: 500 }
        );
    }
}
