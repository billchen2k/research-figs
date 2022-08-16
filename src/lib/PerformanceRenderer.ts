// @ts-nocheck

import SVGBox from '@/lib/SVGBox';
import * as d3 from 'd3';

export default class PerformanceRenderer extends SVGBox {
  private COLUMN_STRUSIM = 'Structural Similarity (a)';
  private COLUMN_PERSIM = 'Perceptual Similarity (b)';
  private COLUMN_TIMEPERF = 'Time Performance (c)';

  public async draw() {
    const width = 180 * 6; const height = 17 * 27;
    const barPadding = 3;
    const gridXRatio = 0.32;
    const margin = {
      left: 0,
      right: 5,
      top: 50,
      bottom: 20,
    };

    this.svg.attr('width', width)
        .attr('height', height);

    const columns = ['Method', 'Resolution', 'of Nodes', this.COLUMN_STRUSIM, this.COLUMN_PERSIM, this.COLUMN_TIMEPERF];
    // const columnsWeight = [1, 1, 1, 1.5, 1.5, 1.5];
    // const columnsWidth = columnsWeight.map((w) => margin.left + (w * (width - margin.right) / d3.sum(columnsWeight)));
    // // Accumulate to get multiple offsets
    // const columnsX = columnsWidth.map((w, i) => d3.sum(columnsWidth.slice(0, i)) + columnsWidth[0] / 2);
    // console.log(columnsX);
    const rows = [
      ['GraphDecoder', 'OGER', 'VividGraph'],
      ['640×640', '960×960', '1280×1280'],
      ['Node≤10', 'Node≤20', 'Node≤30'],
    ];

    const gridXSmall = d3.scaleBand()
        .domain(columns.slice(0, 3))
        .range([margin.left, (width - margin.right) * gridXRatio]);

    const gridXLarge = d3.scaleBand()
        .domain(columns.slice(3))
        .range([(width - margin.right) * gridXRatio, width - margin.right]);

    const gridX = d3.scaleBand()
        .domain(columns)
        .range([margin.left, width - margin.right]);

    const gridY0 = d3.scaleBand()
        .domain(rows[0])
        .padding(0.01)
        .range([margin.top, height - margin.bottom]);

    const gridY1 = d3.scaleBand()
        .domain(rows[1])
        .padding(0.05)
        .range([0, gridY0.bandwidth()]);

    const gridY2 = d3.scaleBand()
        .domain(rows[2])
        .padding(0.2)
        .range([0, gridY1.bandwidth()]);

    const valueX = d3.scaleLinear()
        .domain([0, 1.25])
        .range([0, gridXLarge(columns[5]) - gridXLarge(columns[4])]);

    const valueXTime = d3.scaleLinear()
        .domain([0, 15])
        .range([0, gridXLarge(columns[5]) - gridXLarge(columns[4])]);

    const colors = d3.scaleOrdinal()
        .domain(['GraphDecoder', 'OGER', 'VividGraph'])
        .range(d3.schemeDark2);

    // Background Rectangles
    this.svg.selectAll('bg-rect')
        .data(['GraphDecoder', 'VividGraph'])
        .enter()
        .append('rect')
        .attr('x', (d) => margin.left)
        .attr('y', (d) => gridY0(d))
        .attr('width', width - margin.left - margin.right)
        .attr('height', gridY0.bandwidth())
        .attr('fill', '#f1f1f1');

    // Column Axis
    this.svg.append('g')
        .attr('class', 'axis-text-bold')
        .attr('transform', `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(gridXSmall)
            .tickPadding(5)
            .tickSize(0),
        );

    this.svg.append('g')
        .attr('class', 'axis-text-bold')
        .attr('transform', `translate(${0}, ${margin.top})`)
        .call(d3.axisTop(gridXLarge)
            .tickPadding(5)
            .tickSize(0),
        );

    this.svg.append('text')
        .attr('class', 'axis-text-bold')
        .attr('text-anchor', 'middle')
        .attr('transform', `translate(${gridXSmall(columns[2]) + gridXSmall.bandwidth() / 2}, ${margin.top - 25})`)
        .text('Number');

    // Draw axis
    this.svg.append('g')
        .attr('class', 'axis-text-bold no-line')
        .attr('transform', `translate(${gridXSmall(columns[1])}, ${0})`)
        .call(d3.axisLeft(gridY0)
            .tickPadding(10)
            .tickSize(0),
        );

    for (const i of rows[0]) {
      this.svg.append('g')
          .attr('class', 'axis-text no-line')
          .attr('transform', `translate(${gridXSmall(columns[2])}, ${gridY0(i)})`)
          .call(d3.axisLeft(gridY1)
              .tickPadding(10)
              .tickSize(0),
          );
      for (const j of rows[1]) {
        this.svg.append('g')
            .attr('class', 'no-line middle-anchor')
            .style('font', '12px sans-serif')
            .attr('transform', `translate(${gridXSmall(columns[2]) + gridXSmall.bandwidth()}, ${gridY0(i) + gridY1(j)})`)
            .call(d3.axisLeft(gridY2)
                .tickPadding(gridXSmall.bandwidth() / 2)
                .tickSize(0),
            );
      }
    }

    const perSimData = await d3.csv('/data/perSim.csv');
    const struSimData = await d3.csv('/data/struSim.csv');
    const timePerfData = await d3.csv('/data/timePerf.csv');

    const drawBar = (data, columnName) => {
      const x = columnName === this.COLUMN_TIMEPERF ? valueXTime : valueX;
      const bars = this.svg.selectAll()
          .data(data)
          .enter()
          .append('g')
          .attr('class', 'performance-bars')
          .attr('transform', (d) => `translate(${gridXLarge(columnName)}, ${gridY0(d.method) + gridY1(d.resolution) + gridY2(d.node)})`);

      // Main bar
      bars.append('rect')
      // .attr('transform', (d) => `translate(0, ${barPadding / 2})`)
          .attr('width', (d) => x(d.mean))
          .attr('height', gridY2.bandwidth())
          .attr('fill', (d) => colors(d.method));

      // Q1, Q3 bar
      bars.append('rect')
          .attr('transform', (d) => `translate(${x(d.tcilower)}, ${gridY2.bandwidth() / 2 - 1.5})`)
          .attr('width', (d) => x(d.tciupper) - x(d.tcilower))
          .attr('height', 3);

      // Lower Upper line
      // bars.append('line')
      //     .attr('x1', (d) => x(d.q1))
      //     .attr('x2', (d) => x(d.q3))
      //     .attr('y1', gridY2.bandwidth() / 2)
      //     .attr('y2', gridY2.bandwidth() / 2)
      //     .style('stroke-width', '1px')
      //     .style('stroke', 'black');

      bars.append('line')
          .attr('x1', (d) => x(d.mean))
          .attr('x2', (d) => x(d.mean))
          .attr('y1', gridY2.bandwidth() / 2 - 1.5)
          .attr('y2', gridY2.bandwidth() / 2 + 1.5)
          .style('stroke-width', '1px')
          .style('stroke', '#ffffff');

      bars.append('text')
          .style('font', '10px sans-serif')
          .attr('transform', (d) => `translate(3, 9)`)
          .text((d) => columnName === this.COLUMN_TIMEPERF ? `${Number(d.mean).toFixed(2)}s` : `${(Number(d.mean) * 100).toFixed(2)}%`)
          .style('fill', '#ffffff')
          .attr('opacity', 0.8);
    };

    drawBar(perSimData, this.COLUMN_PERSIM);
    drawBar(struSimData, this.COLUMN_STRUSIM);
    drawBar(timePerfData, this.COLUMN_TIMEPERF);


    this.svg.selectAll('.value-ticks')
        .data([this.COLUMN_PERSIM, this.COLUMN_STRUSIM])
        .enter()
        .append('g')
        .attr('class', 'value-ticks light-line')
        .attr('transform', (d, i) => `translate(${gridXLarge(d)}, ${height - margin.bottom})`)
        .call(d3.axisBottom(valueX)
            .tickValues([0, .25, .5, .75, 1])
            .tickFormat(d3.format('.0%'))
            .tickPadding(5)
            .tickSize(-(height - margin.top - margin.bottom)),
        );

    this.svg.append('g')
        .attr('class', 'value-ticks light-line')
        .attr('transform', (d, i) => `translate(${gridXLarge(this.COLUMN_TIMEPERF)}, ${height - margin.bottom})`)
        .call(d3.axisBottom(valueXTime)
            .tickValues([0, 5, 10, 15])
            .tickFormat(d3.format('.0f'))
            .tickPadding(5)
            .tickSize(-(height - margin.top - margin.bottom)),
        );

    // Draw split line
    this.svg.selectAll('.split-line-small')
        .data(columns.slice(1, 3))
        .enter()
        .append('line')
        .attr('class', 'split-line')
        .attr('x1', (d) => gridXSmall(d))
        .attr('x2', (d) => gridXSmall(d))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .style('stroke', 'black');

    this.svg.selectAll('.split-line-large')
        .data(columns.slice(3))
        .enter()
        .append('line')
        .attr('class', 'split-line')
        .attr('x1', (d) => gridXLarge(d))
        .attr('x2', (d) => gridXLarge(d))
        .attr('y1', margin.top)
        .attr('y2', height - margin.bottom)
        .style('stroke', 'black');
  }
}

