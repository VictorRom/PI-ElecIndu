import { AnimatedAxis, AnimatedGrid, AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { AxisBottom } from '@visx/axis';
import { format } from 'date-fns'
import { Fragment } from 'react';

export default function LineChart ({ data, lineNames }) {
    const accessors = {
        xAccessor: (d) => d.x,
        yAccessor: (d) => d.y,
    };
    
    return (
        <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }} margin={{ top: 30, right: 10, bottom: 30, left: 30 }}>
            <AnimatedAxis 
                orientation="bottom"
                tickFormat={(d) => format(new Date(d), 'HH') + 'h'}
            />
            <AnimatedAxis orientation="left" numTicks={5} />
            <AnimatedGrid columns={false} numTicks={4} />
            
            {data.map((line, i) => (
                <Fragment key={`${i}-${lineNames[i]}`}>
                    <AnimatedLineSeries key={`line-${i}`} dataKey={lineNames[i]} data={line} {...accessors} />
                    <text x={95} y={20} fontWeight="bold" fontSize={18} textAnchor="middle" alignmentBaseline="middle" 
                    style={{ fill: '#000000' }}>
                        {lineNames[i]}
                    </text>

                </Fragment>
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
