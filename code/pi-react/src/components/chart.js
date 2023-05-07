import React, { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";

const ChartComponent = ({ data }) => {
  const svgRef = useRef(null);
    const margin = useMemo(() =>
    {
        return { top: 20, right: 20, bottom: 30, left: 50 };
    }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.bottom - margin.top;
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);
    const xFormat = "%d-%b-%Y: %H:%M";
    const parseTime = d3.timeParse("%d/%m/%Y: %H:%M");
    const categories = ["a", "b", "c", "d"];
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    x.domain(d3.extent(data, (d) => parseTime(d.date)));
    y.domain([
      0,
      d3.max(data, (d) => {
        return d3.max([d.a, d.b, d.c, d.d]);
      }),
    ]);

    const multiline = (category) => {
      const line = d3
        .line()
        .x((d) => x(parseTime(d.date)))
        .y((d) => y(d[category]));
      return line;
    };

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const lineFunction = multiline(category);
      g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("fill", "none")
        .style("stroke", color(i))
        .attr("d", lineFunction);
    }

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat(xFormat)));

    g.append("g").call(d3.axisLeft(y));
  }, [data, margin]);

  return <svg ref={svgRef} width={960} height={300}></svg>;
};

export default ChartComponent;