import { AnimatedAxis, AnimatedGrid, AnimatedLineSeries, XYChart, Tooltip } from '@visx/xychart';
import { Fragment } from 'react';
import { formatByHourNMins } from '../utils/dateUtils';

export default function LineChart ({ data, lineNames, xAxisTickFormat = formatByHourNMins}) {
    const accessors = {
        xAccessor: (d) => d.x,
        yAccessor: (d) => d.y,
    };
    
    return (
        <XYChart xScale={{ type: 'band' }} yScale={{ type: 'linear' }} margin={{ top: 30, right: 10, bottom: 30, left: 40 }}>
            <AnimatedAxis 
                orientation="bottom"
                tickFormat={xAxisTickFormat}
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
