// @ts-nocheck

import SVGBox from '@/lib/SVGBox';
import * as d3 from 'd3';

export default class ScoringResultRenderer extends SVGBox {
  public kde(kernel, thresholds, data) {
    return thresholds.map((t) => [t, d3.mean(data, (d) => kernel(t - d))]);
  }

  public epanechnikov(bandwidth) {
    return (x) => Math.abs(x /= bandwidth) <= 1 ? 0.75 * (1 - x * x) / bandwidth : 0;
  }

  public async draw() {
    const width = 500;
    const height = 300;
    const config = {
      bandwidth: 1.5,
      wiggleMax: 0.22,
      height: height,
      tciSize: 2.5,
    };

    const margin = {
      left: 92,
      top: 30,
      right: 20,
      bottom: 20,
    };

    const graphTypes = ['Flowchart', 'Modeling Graph', 'Mindmap', 'Hand-drawn Sketch'];
    const metrics = ['Color', 'Position', 'Node', 'Connection', 'Text'];

    const gridX = d3.scaleBand()
        .domain(metrics)
        .range([margin.left, width - margin.right]);

    const gridY = d3.scaleBand()
        .domain(graphTypes)
        .range([margin.top, height - margin.bottom]);

    const x = d3.scaleLinear()
        .domain([70, 110])
        .range([0, gridX.bandwidth()]);

    const wiggle = d3.scaleLinear()
        .domain([0, config.wiggleMax])
        .range([0, gridY.bandwidth() * 0.8]);

    const color = d3.scaleOrdinal()
        .domain(metrics)
        .range(d3.schemeTableau10);

    const thresholds = x.ticks(35);

    this.svg
        .attr('width', width)
        .attr('height', height)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round');

    const data = await d3.csv('data/graphdecoder/scoringResult.csv');
    const tci = await d3.json('data/graphdecoder/scoringTtestTCI.json');
    const columnData = [];
    data.forEach((i) => {
      Object.keys(i).forEach((j) => {
        if (columnData[j]) {
          columnData[j].push(i[j]);
        } else if (j.length > 0) {
          columnData[j] = [i[j]];
        }
      });
    });

    const plots = Object.keys(columnData).map((key) => {
      const v = columnData[key];
      const q1 = d3.quantile(v, 0.25);
      const q3 = d3.quantile(v, 0.75);
      const iqr = q3 - q1; // Interquartile range
      return ({
        graphType: key.split('@')[0],
        metric: key.split('@')[1],
        kde: this.kde(this.epanechnikov(config.bandwidth), thresholds, v),
        median: d3.quantile(v, 0.5),
        quartile: [q1, q3],
        avg: (d3.sum(v) / v.length).toFixed(2),
        // range:  [Math.max(0, q1 - iqr * 1.5), Math.min(10, q3 + iqr * 1.5)]
        range: [q1 - 1.5 * iqr, Math.max(...v)],
        tci: tci[key.split('@')[0]][key.split('@')[1]],
      });
    });

    console.log(plots);

    this.svg.selectAll('.bg-rect')
        .data(['Flowchart', 'Mindmap'])
        .join('rect')
        .attr('x', margin.left)
        .attr('y', (d) => gridY(d))
        .attr('width', width - margin.left - margin.right)
        .attr('height', gridY.bandwidth())
        .attr('fill', '#f5f5f5');

    // ticks
    const ticks = this.svg.append('g')
        .selectAll('.ticks')
        .data(metrics)
        .enter()
        .append('g')
        .attr('class', 'ticks')
        .attr('width', gridX.bandwidth)
        .attr('transform', (d) => `translate(${gridX(d)}, ${margin.top})`);

    ticks.append('g')
        .attr('class', 'light-line')
        .attr('fill', '#666666')
        .call(d3.axisBottom(x)
            .tickValues([70, 80, 90, 100])
            .tickSize(height - margin.top - margin.bottom),
        );

    // scales
    this.svg.append('g')
        .attr('transform', `translate(0, ${margin.top})`)
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .call(d3.axisTop(gridX)
            .tickSize(0)
            .tickPadding(10),
        );

    // this.svg.append('g')
    //     .attr('transform', `translate(${margin.left}, 0)`)
    //     .style('font-size', '14px')
    //     .style('font-weight', 'bold')
    //     .call(d3.axisLeft(gridY)
    //         .tickSize(5)
    //         .tickPadding(10),
    //     );
    this.svg.selectAll('.type-text')
        .data(graphTypes)
        .enter()
        .append('text')
        .attr('class', 'type-text axis-text-bold')
        .attr('x', margin.left - 10)
        .attr('y', (d) => gridY(d) + gridY.bandwidth() / 2 - 15 - 10 * (d.split(' ').length - 1))
        .selectAll()
        .data((d) => d.split(' '))
        .join('tspan')
        .attr('dy', '20')
        .attr('x', 85)
        .attr('text-anchor', 'end')
        .text((d) => d);


    const violins = this.svg.selectAll('.violin')
        .data(plots)
        .enter()
        .append('g')
        .attr('class', 'violin')
        .attr('transform', (d) => `translate(${gridX(d.metric)}, ${gridY(d.graphType) + gridY.bandwidth() / 2})`);

    const area = d3
        .area()
        .x((d) => x(d[0]))
        .y0((d) => wiggle(d[1]))
        .y1((d) => -wiggle(d[1]))
        .curve(d3.curveBasis);

    violins.append('path')
        .attr('d', (d) => area(d.kde))
        .attr('fill', (d) => color(d.metric))
        .attr('opacity', 0.8);

    violins.append('rect')
        .attr('x', (d) => x(d.tci[0]))
        .attr('y', -config.tciSize)
        .attr('height', 2 * config.tciSize)
        .attr('width', (d) => x(d.tci[1]) - x(d.tci[0]))
        .attr('fill', 'black');

    violins.append('line')
        .attr('x1', (d) => x(d.range[0]))
        .attr('x2', (d) => x(d.range[1]))
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'black');

    violins.append('circle')
        .attr('cx', (d) => x(d.median))
        .attr('cy', 0)
        .attr('r', 2)
        .attr('fill', 'white');
  }
}
