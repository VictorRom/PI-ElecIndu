import { AnimatedAxis, AnimatedGrid, AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { AxisBottom } from '@visx/axis';
import { format } from 'date-fns'

export default function LineChart ({ data, lineNames }) {
    const accessors = {
        xAccessor: (d) => d.x,
        yAccessor: (d) => d.y,
    };
    
    return (
        <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }}>
            {/* <AxisBottom label="Time" /> */}
            <AnimatedAxis 
                orientation="bottom"
                tickFormat={(d) => format(new Date(d), 'HH:mm')}
            />
            <AnimatedAxis orientation="left" numTicks={5} />
            <AnimatedGrid columns={false} numTicks={4} />

            {data.map((line, i) => (
                <AnimatedLineSeries key={i} dataKey={lineNames[i]} data={line} {...accessors} />
            ))}
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
