// @ts-nocheck
import * as d3 from 'd3';
import SVGBox from '../SVGBox';

// import _ from 'lodash';

export default class POITaxonomyRenderer extends SVGBox {
  public async draw() {
    const width = 500;
    const height = 320;

    const margin = {
      left: 145,
      top: 25,
      right: 185,
      bottom: 15,
    };

    const barColors = {
      'original': '#074080',
      'filtered': '#074080',
      'downsampled': '#074080',
    };

    const markColor = '#074080';
    // const barColors = ['#CFD9E5', '#96AAC4', '#074080'];
    const barOpacities = [0.2, 0.3, 0.5];
    const lineOpacities = [0.2, 0.4, 0.8];

    this.svg.attr('width', width)
        .attr('height', height);

    const data: d3.DSVRowArray<'category' | 'number_of_class' |
      'number_of_class_filterd' | 'count_original' |
      'count_filtered' | 'count_sample' | 'max_samecluster' | 'sample_class' |
      'sc'> = await d3.csv('/data/semanticmap/taxonomy.csv');

    const categories = data.map((row) => row.category) as string[];

    const catY = d3.scaleBand()
        .domain(categories)
        .padding(0.5)
        .range([margin.top, height - margin.bottom]);

    const catX = d3.scaleLog()
        .domain([1000, 100000])
        .base(10)
        .nice()
        .range([0, width - margin.right - margin.left]);

    const mainG = this.svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const legendG = this.svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // legendG.append('g')
    //     .selectAll('.numbers-rect-bg')
    //     .data(categories)
    //     .enter()
    //     .append('rect')
    //     .attr('class', 'numbers-rect-bg')
    //     .attr('x', 0)
    //     .attr('y', (d) => catY(d) as number)
    //     .attr('width', width - margin.left - margin.right)
    //     .attr('height', catY.bandwidth())
    //     .style('fill', 'none')
    //     .style('stroke', 'gray');

    // Legend for catY
    categories.forEach((c) => {
      const tspans = [c];
      if (c.length > 20) {
        tspans[0] = c.split(' ').slice(0, 2).join(' ');
        tspans.push(c.split(' ').slice(2).join(' '));
      }
      console.log(tspans);
      legendG.append('text')
          .attr('translate', `translate(0, ${catY(c) as number})`)
          .style('font', '13px Helvetica')
          .selectAll('.tspans-text')
          .data(tspans)
          .enter()
          .append('tspan')
          .attr('x', -24)
          .attr('y', (d, i) => catY(c) as number + 3 - (tspans.length - 1) * 5 + i * 12)
          .attr('text-anchor', 'end')
          .text((d: string) => d);
    });


    // Legend for catX
    mainG.append('g')
        .attr('transform', `translate(${0}, ${margin.top})`)
        .attr('class', 'light-line')
        .call(d3.axisTop(catX)
            .tickSizeInner(-(height - margin.top - margin.bottom - 10))
            .tickSizeOuter(0)
            .ticks(4),
        );

    ['count_original', 'count_filtered', 'count_sample'].forEach((col, i) => {
      mainG.append('g')
          .selectAll(`.bar-${col}`)
          .data(data)
          .enter()
          .append('rect')
          .attr('class', `.bar-${col}`)
          .attr('x', 0)
          .attr('y', (d) => (catY(d.category ?? '') || 0) - catY.bandwidth() / 2)
          .attr('width', (d) => catX(parseInt((d as any)[col] || '1')))
          .style('fill', markColor)
          .style('opacity', barOpacities[i])
          .attr('height', catY.bandwidth());

      mainG.append('g')
          .selectAll(`.dot-${col}`)
          .data(data)
          .enter()
          .append('circle')
          .attr('cx', (d) => catX(parseInt((d as any)[col] || '1')))
          .attr('cy', (d) => (catY(d.category ?? '') || 0))
          .attr('fill', 'black')
          .attr('r', 1.5);
      // .attr('opacity', barOpacities[i]);

      mainG.append('path')
          .datum(data)
          .attr('fill', 'none')
          .attr('stroke', markColor)
          .attr('opacity', lineOpacities[i])
          .attr('stroke-width', 1)
          .attr('d', d3.line()
              .x((d) => catX(d[col]))
              .y((d) => catY(d['category'])),
          );
    });

    // Class number marks
    const markRadius = 7;
    const markG = mainG.append('g')
        .selectAll('.class-number-mark')
        .data(data)
        .enter()
        .append('g')
        .attr('transform', (d) => `translate(-12, ${catY(d.category ?? '') || 0})`);

    markG.append('circle')
        .attr('r', markRadius)
        .style('fill', markColor);

    markG.append('text')
        .attr('y', `3`)
        .style('font', '10px Helvetica')
        .attr('text-anchor', 'middle')
        .attr('fill', 'white')
        .text((d) => d.number_of_class_filterd ?? '');


    // KMeans Metric
    mainG.selectAll('.metric-text')
        .data(data)
        .enter()
        .append('text')
        .style('font', '10px Helvetica')
        .attr('fill', 'white')
        .attr('x', 5)
        .attr('y', (d) => catY(d.category) + 3)
        .text((d) => `${parseFloat(d.sc).toFixed(3)}`);

    // Examples
    const sampleG = this.svg.append('g')
        .attr('transform', `translate(${width - margin.right}, ${margin.top})`);

    sampleG.selectAll('.sample-text')
        .data(data)
        .enter()
        .append('text')
        .style('font', '12px Helvetica')
        .style('font-style', 'italic')
        .attr('text-anchor', 'start')
        .attr('class', 'sample-text')
        .attr('fill', '#555')
        .attr('x', 20)
        .attr('y', (d) => 3 + catY(d.category ?? ''))
        .text((d) => d.sample_class + '...');

    // Global Legend
    const glegendG = this.svg.append('g')
        .attr('transform', `translate(0, ${10})`);

    glegendG.append('text')
        .style('font', '12px Helvetica')
        .attr('x', 150)
        .attr('y', 9)
        .attr('text-anchor', 'end')
        .text('Category Name');

    glegendG.append('circle')
        .attr('r', markRadius)
        .attr('cx', 160)
        .attr('cy', 5)
        .style('fill', markColor);

    glegendG.append('text')
        .style('font', '10px Helvetica')
        .attr('x', 157)
        .attr('y', 7)
        .attr('fill', 'white')
        .text('n');

    const legendRects = ['Sampled', 'Filtered', 'Original'];
    const scaleLeg = d3.scaleBand()
        .domain(legendRects)
        .range([0, 210]);

    const legendRectsG = glegendG
        .append('g')
        .attr('transform', `translate(180, 8)`);

    legendRectsG
        .selectAll('.legendRects')
        .data(legendRects.reverse())
        .enter()
        .append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', (d) => scaleLeg(d) + scaleLeg.bandwidth())
        .attr('height', 13)
        .style('opacity', (d, i) => barOpacities[i])
        .style('fill', (d, i) => markColor);

    legendRectsG
        .selectAll('.legendText')
        .data(legendRects)
        .enter()
        .append('text')
        .attr('text-anchor', 'end')
        .attr('class', 'legendText')
        .style('font', '10px Helvetica')
        .style('fill', (d) => d == 'Sampled' ? 'white' : 'black')
        .attr('x', (d) => scaleLeg(d) + scaleLeg.bandwidth() - 3)
        .attr('y', '0')
        .text((d) => d);
    legendRectsG.append('text')
        .attr('x', 3)
        .attr('y', 0)
        .style('font', '10px Helvetica')
        .attr('fill', 'white')
        .text('S.C.');


    glegendG.append('text')
        .style('font', '12px Helvetica')
        .style('font-style', 'italic')
        .attr('x', 150 + 242)
        .attr('y', 8)
        .attr('fill', '#555')
        .text('Class Examples');

    glegendG.append('text')
        .style('font', '11px Helvetica')
        .attr('x', 157)
        .attr('text-anchor', 'middle')
        .attr('y', 24)
        .attr('fill', '#555')
        .text('(n = number of classes)');
  }
}


