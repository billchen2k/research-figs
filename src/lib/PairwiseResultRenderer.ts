// @ts-nocheck
import * as d3 from 'd3';
import SVGBox from './SVGBox';

export default class PairwiseResultRenderer extends SVGBox {
  constructor(containerId: string) {
    super(containerId);
  }

  public async draw() {
    const height = 400;
    const width = 600;
    const circleR = 5;
    const margin = {
      top: 100,
      left: 100,
      bottom: 50,
      right: 100,
    };

    this.svg
        .attr('height', height)
        .attr('width', width);

    const data = await d3.csv('/data/pairwiseResult.csv');
    const tci = await d3.json('/data/pairwiseTtestCI.json');
    const expandedData: Record<string, []> = {};
    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!expandedData[key]) {
          expandedData[key] = [row[key]];
        } else {
          expandedData[key].push(row[key]);
        }
      });
    });

    const groupData = Object.keys(expandedData).map((key) => {
      const v = expandedData[key];
      const q1 = d3.quantile(v, 0.25);
      const q3 = d3.quantile(v, 0.75);
      return {
        name: key,
        avg: d3.sum(v) / v.length,
        q: [q1, q3],
        values: v,
        tci: tci[key],
      };
    });

    console.log(groupData);

    const gridY = d3.scaleBand()
        .domain(Object.keys(expandedData))
        .range([margin.top, height - margin.bottom]);

    const x = d3.scaleLinear()
        .domain([-100, 100])
        .range([margin.left, width - margin.right]);

    const color = d3.scaleOrdinal()
        .domain(Object.keys(expandedData))
        .range(d3.schemeTableau10);

    const y = (v: number) => {
      return gridY.bandwidth() * 0.3 * (Math.random() - 0.5);
    };


    this.svg.append('g')
        .style('font', '14px sans-serif')
        .style('font-weight', 'bold')
        .attr('class', 'no-line')
        .attr('transform', `translate(${margin.left}, ${- gridY.bandwidth() / 2})`)
        .call(d3.axisLeft(gridY).tickPadding(20)
            .tickSize(0),
        );

    this.svg.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom - gridY.bandwidth() / 2})`)
        .attr('class', 'light-line')
        .call(d3.axisBottom(x)
            .tickValues([-100, -50, 0, 50, 100])
            .tickSizeInner(-(height - margin.bottom - margin.top))
            .tickSizeOuter(-(height - margin.bottom - margin.top + 30))
            .tickPadding(10));

    this.svg.append('text')
        .text('Manual Extraction')
        .attr('text-anchor', 'start')
        .style('font', '14px sans-serif')
        .attr('transform', `translate(${margin.left + 5}, ${margin.top - 35})`);

    this.svg.append('text')
        .text('Automatic Extraction')
        .attr('text-anchor', 'end')
        .style('font', '14px sans-serif')
        .attr('transform', `translate(${width - margin.right - 5}, ${margin.top - 35})`);

    const groups = this.svg
        .selectAll('.groups')
        .data(groupData)
        .join('g')
        .attr('class', 'groups')
        .attr('fill', (d) => color(d.name))
        .attr('stroke', (d) => color(d.name))
        .attr('transform', (d) => `translate(0, ${gridY(d.name)})`);

    groups.selectAll('circle')
        .data((d) => d.values)
        .enter()
        .append('circle')
        .attr('cx', (d) => x(d))
        .attr('cy', (d) => y(d))
        .attr('r', circleR)
        .attr('stroke-width', 0)
        .attr('opacity', 0.6)
        .attr('fill-opacity', 0.5);

    groups.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width - margin.left - margin.right)
        .attr('transform', `translate(${margin.left}, -${gridY.bandwidth() / 2})`)
        .attr('height', gridY.bandwidth())
        .attr('fill', (d) => color(d.name))
        .attr('opacity', 0.05);

    const rectHeight = gridY.bandwidth() * 0.6;
    const quartileHeight = gridY.bandwidth() * 0.3;

    groups.append('rect')
        .attr('x', (d) => x(d.avg))
        .attr('y', - rectHeight / 2)
        .attr('width', 2)
        .attr('height', rectHeight)
        .attr('stroke', 'none')
        .attr('fill', 'black');

    groups.append('rect')
        .attr('x', (d) => x(d.tci[0]))
        .attr('y', -2)
        .attr('width', (d) => x(d.tci[1]) - x(d.tci[0]))
        .attr('height', 4)
        .attr('stroke', 'none')
        .attr('fill', '#666666');

    groups.selectAll('.tci')
        .data((d) => d.tci)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d))
        .attr('y', -quartileHeight / 4)
        .attr('width', 2)
        .attr('height', quartileHeight / 2)
        .attr('stroke', 'none')
        .attr('fill', '#333333');

    groups.append('circle')
        .attr('cx', (d) => x(d.avg))
        .attr('cy', 0)
        .attr('r', 1.5)
        .attr('stroke', 'none')
        .attr('fill', 'white');

    // groups.append('text')
    //     .text((d) => `Avg: ${d.avg.toFixed(2)}`)
    //     .style('font', '12px sans-serif')
    //     .attr('transform', (d) => `translate(${width - margin.right + 10}, 0)`)
    //     .attr('stroke', 'none')
    //     .attr('fill', 'black');
  }
}
