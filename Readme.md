# REint

## Files and Directories

```text
REint/
├── Readme.md
├── Analysis/
│   ├── forecast_error/
│   │   ├── forecast_error_analysis.ipynb
│   │   └── images/
│   │       ├── bias_by_horizon.png
│   │       ├── error_by_hour.png
│   │       ├── error_distribution.png
│   │       ├── error_vs_horizon.png
│   │       └── heatmap_hour_horizon.png
│   └── wind_reliability/
│       ├── availability_curve.png
│       ├── daily_wind.png
│       ├── drought_durations.png
│       ├── exceedance_curve.png
│       ├── wind_by_hour.png
│       ├── wind_overview.png
│       └── wind_reliability.ipynb
└── Application/
    └── reint/
        ├── .gitignore
        ├── eslint.config.mjs
        ├── next-env.d.ts
        ├── next.config.ts
        ├── package-lock.json
        ├── package.json
        ├── postcss.config.mjs
        ├── tsconfig.json
        ├── public/
        │   ├── file.svg
        │   ├── globe.svg
        │   ├── next.svg
        │   ├── vercel.svg
        │   └── window.svg
        └── src/
            ├── app/
            │   ├── favicon.ico
            │   ├── globals.css
            │   ├── layout.tsx
            │   ├── page.tsx
            │   └── api/
            │       ├── actuals/
            │       │   └── route.ts
            │       └── forecasts/
            │           └── route.ts
            └── components/
                ├── Dashboard.tsx
                ├── Header.tsx
                └── ui/
                    ├── Chart.tsx
                    └── Controls.tsx

```

## User Guide (Analysis)

Use the notebooks inside the `Analysis` folder to explore forecast quality and wind reliability trends.

1. Open one of the notebooks:
    - `Analysis/forecast_error/forecast_error_analysis.ipynb`
    - `Analysis/wind_reliability/wind_reliability.ipynb`
2. Run cells from top to bottom (`Run All` is recommended for reproducible output).
3. Check generated charts:
    - Forecast error plots are saved in `Analysis/forecast_error/images/`.
    - Wind reliability plots are saved in `Analysis/wind_reliability/`.
4. Re-run notebooks whenever source data changes to refresh all visual outputs.

### What each analysis area is for

- `forecast_error`: Evaluates forecast-vs-actual error behavior by hour and horizon, including distributions and bias.
- `wind_reliability`: Summarizes wind behavior and availability/reliability indicators over time.

## How to Start the Application

1. Navigate to application : 
    cd Application/reint

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the app (development):
    ```bash
    npm run dev
    ```

## Live Application

[Vercel/Heroku App Link](https://reint-five.vercel.app/)