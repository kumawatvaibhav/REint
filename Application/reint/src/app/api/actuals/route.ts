import { NextResponse } from 'next/server';

type FuelActualRow = {
  fuelType?: string;
  startTime?: string;
  generation?: number;
};

type FuelActualPayload = FuelActualRow[] | { data?: FuelActualRow[] };

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!start || !end) {
    return NextResponse.json(
      { error: 'Missing start or end date parameters' },
      { status: 400 }
    );
  }

  try {
    // We are looking for historical FUELHH data between start and end
    // Elexon BMRS API v1 FUELHH Stream
    // The query params are settlementDateFrom and settlementDateTo for historical range
    // The dates should be in YYYY-MM-DD format
    
    const startDate = start.split('T')[0];
    const endDate = end.split('T')[0];

    const url = `https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream?settlementDateFrom=${startDate}&settlementDateTo=${endDate}`;
    
    console.log('Fetching Actuals from Elexon BMRS API:', url);
    
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour to avoid hitting API repeatedly
      signal: AbortSignal.timeout(20000)
    });

    if (!response.ok) {
      throw new Error(`Elexon API returned status: ${response.status}`);
    }

    const json = (await response.json()) as FuelActualPayload;
    const data = Array.isArray(json) ? json : (json.data || []);
    
    // Filter for WIND generation only and map to { startTime, generation } format
    const windData = data
      .filter((item) => item.fuelType === "WIND" && !!item.startTime && typeof item.generation === 'number')
      .map((item) => ({
        startTime: item.startTime as string,
        generation: item.generation as number
      }))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    return NextResponse.json(windData);

  } catch (error) {
    console.error('Error fetching actuals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch actual generation data' },
      { status: 500 }
    );
  }
}
