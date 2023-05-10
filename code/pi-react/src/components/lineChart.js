import { AnimatedAxis, AnimatedGrid, AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
// import { AxisBottom, AxisLeft, AxisLabel } from '@visx/axis';

const data1 = [
    { x: '2020-01-01 12:00:00', y: 500 },
    { x: '2020-01-02 12:10:00', y: 500 },
    { x: '2020-01-03 12:20:00', y: 520 },
    { x: '2020-01-03 12:30:00', y: 550 },
    { x: '2020-01-03 12:40:00', y: 550 },
    { x: '2020-01-03 12:50:00', y: 580 },
    { x: '2020-01-01 13:00:00', y: 610 },
    { x: '2020-01-02 13:10:00', y: 670 },
    { x: '2020-01-03 13:20:00', y: 690 },
    { x: '2020-01-03 13:30:00', y: 710 },
    { x: '2020-01-03 13:40:00', y: 700 },
    { x: '2020-01-03 13:50:00', y: 1600 },
];

const accessors = {
    xAccessor: (d) => d.x,
    yAccessor: (d) => d.y,
};

const LineChart = () => (
    <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
        <AnimatedAxis orientation="bottom" />
        <AnimatedAxis orientation="left" numTicks={5} />
        <AnimatedGrid columns={false} numTicks={4} />
        <AnimatedLineSeries dataKey="Line 1" data={data1} {...accessors} />
        <Tooltip
        snapTooltipToDatumX
        snapTooltipToDatumY
        showVerticalCrosshair
        showSeriesGlyphs
        renderTooltip={({ tooltipData, colorScale }) => (
            <div>
                <div style={{ color: colorScale(tooltipData.nearestDatum.key) }}>
                    {tooltipData.nearestDatum.key}
                </div>
                {accessors.xAccessor(tooltipData.nearestDatum.datum)}
                {', '}
                {accessors.yAccessor(tooltipData.nearestDatum.datum)}
            </div>
        )}
        />
    </XYChart>
);

export default LineChart;