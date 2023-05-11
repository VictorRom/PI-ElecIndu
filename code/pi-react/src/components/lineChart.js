import { AnimatedAxis, AnimatedGrid, AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
// import { AxisBottom, AxisLeft, AxisLabel } from '@visx/axis';

export default function LineChart ({ data, lineName }) {
    const accessors = {
        xAccessor: (d) => d.x,
        yAccessor: (d) => d.y,
    };
    
    return (
        <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
            <AnimatedAxis orientation="bottom" />
            <AnimatedAxis orientation="left" numTicks={5} />
            <AnimatedGrid columns={false} numTicks={4} />
            <AnimatedLineSeries dataKey={lineName} data={data} {...accessors} />
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
}
