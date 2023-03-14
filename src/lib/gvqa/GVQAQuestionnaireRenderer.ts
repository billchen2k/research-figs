// @ts-nocheck

import * as d3 from 'd3';
import SVGBox from '@/lib/SVGBox';
import _ from 'lodash';
import {schemeSet1} from 'd3-scale-chromatic';

export class GVQAQuestionnaireRenderer extends SVGBox {
  public async draw() {
    const width = 1000;
    const height = 300;
    const margin = {
      top: 40,
      left: 100,
      right: 80,
      bottom: 0,
    };

    const xCount = 6;
    const yCount = 2;
    const modes = ['text', 'visual'];
    const metrics = ['usefulness', 'transparency'];

    // Data order: Question  -> Mode -> Metric
    // Visualization Order: Question -> Metric -> Mode

    this.svg
        .attr('height', height)
        .attr('width', width);

    this.gridX = d3.scaleBand()
        .domain(_.range(xCount))
        .padding(0)
        .range([margin.left, width - margin.right]);

    this.gridY = d3.scaleBand()
        .domain(_.range(yCount))
        .paddingInner(0.05)
        .range([margin.top, height - margin.bottom]);

    this.x = d3.scaleLinear()
        .domain([1, 5])
        .range([0, this.gridX.bandwidth()]);

    const scoreX = d3.scaleLinear()
        .domain([1, 5])
        .range([0, this.gridX.bandwidth()]);

    const metricY = d3.scaleBand()
        .domain(metrics)
        .padding(0.25)
        .range([0, this.gridY.bandwidth() - 20]);

    const modeY = d3.scaleBand()
        .domain(modes)
        .padding(0)
        .range([0, metricY.bandwidth()]);

    const modeColor = d3.scaleOrdinal()
        .domain(metrics)
        .range([d3.schemeSet3[4], d3.schemeSet3[5]]);

    // Legend
    _.range(yCount).forEach((y) => {
      const g = this.svg.append('g')
          .attr('transform', `translate(${margin.left * 0.9}, ${this.gridY(y)})`);

      g.selectAll('.legend-text')
          .data(metrics)
          .enter()
          .append('text')
          .attr('class', 'axis-text')
          .attr('x', 0)
          .attr('y', (d, i) => metricY(d) + metricY.bandwidth() / 2 + 4)
          .attr('text-anchor', 'end')
          .attr('alignment-baseline', 'middle')
          .text((d: string) => 'usefulness' === d ? 'Usefulness' : 'Transparency');
    });

    const modeLegendSize = modeY.bandwidth() * 0.9;
    const modeLegendG = this.svg.selectAll('.legend-g')
        .data(modes)
        .enter()
        .append('g')
        .attr('transform', (d, i) => `translate(${margin.left + (this.gridX.bandwidth() * 1.3) * i + width * 0.2}, ${margin.top * 0.5})`);

    modeLegendG.append('rect')
        .attr('width', modeLegendSize)
        .attr('height', modeLegendSize)
        .attr('stroke', 'gray')
        .attr('fill', (d) => modeColor(d));

    modeLegendG.append('text')
        .attr('class', 'axis-text')
        .attr('x', modeLegendSize + 10)
        .attr('y', modeLegendSize / 2 + 4)
        .attr('text-anchor', 'start')
        .attr('alignment-baseline', 'middle')
        .text((d) => d === 'text' ? 'Text-only Answers' : 'Visual & Textual Answers');


    const rawData = await d3.csv('data/gvqa/gvqaQuestionnaire.csv');
    const tciData = await d3.json('data/gvqa/gvqaTCI.json');
    const data = {};

    rawData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (!data[key]) {
          data[key] = [row[key]];
        } else {
          data[key].push(row[key]);
        }
      });
    });

    Object.keys(data).forEach((key) => {
      data[key] = d3.mean(data[key]);
    });

    const boxes = [];
    _.range(12).forEach((i) => {
      const box = this.svg.append('g')
          .attr('transform', `translate(${this.gridX(i % xCount)}, ${this.gridY(Math.floor(i / xCount))})`)
          .attr('width', this.gridX.bandwidth())
          .attr('height', this.gridY.bandwidth());
      boxes.push(box);
      // box.append('rect')
      //     .attr('x', 0)
      //     .attr('y', 0)
      //     .attr('width', this.gridX.bandwidth())
      //     .attr('height', this.gridY.bandwidth())
      //     .attr('fill', 'gray');
      box.append('text')
          .attr('class', 'axis-text-bold')
          .attr('x', this.gridX.bandwidth() / 2)
          .attr('y', this.gridY.bandwidth() - 10)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(`Q${i + 1}`);
    });
    console.log(data);
    Object.keys(data).forEach((key, index) => {
      const [question, mode, metric] = key.split('@');
      const qIndex = parseInt(question.replace('Q', ''), 10);
      const mean = data[key];
      const boxG = boxes[qIndex - 1];
      const y = metricY(metric) + modeY(mode);

      boxG.append('rect')
          .attr('x', 0)
          .attr('y', y)
          .attr('width', scoreX(data[key]))
          .attr('height', modeY.bandwidth())
          .attr('fill', modeColor(mode));

      boxG.append('text')
          .attr('style', 'font-size: 10px; color: white')
          .attr('fill', 'white')
          .attr('x', 3)
          .attr('y', y + modeY.bandwidth() / 2)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .text(mean.toFixed(2));


      // TCI Mark
      const {low, high} = tciData[key];

      boxG.append('rect')
          .attr('x', scoreX(low))
          .attr('y', y + modeY.bandwidth() / 2 - 0.5)
          .attr('width', scoreX(high) - scoreX(low))
          .attr('height', 1)
          // .attr('opacity', 0.5)
          .attr('fill', 'black');

      const centerR = 2;
      boxG.append('circle')
          .attr('cx', scoreX(mean))
          .attr('cy', y + modeY.bandwidth() / 2)
          .attr('r', centerR)
          // .attr('opacity', 0.5)
          .attr('fill', 'black');

      boxG.append('g')
          .selectAll('.tci-marks')
          .data([low, high])
          .enter()
          .append('rect')
          .attr('x', (d) => scoreX(d) - 1)
          .attr('y', y + modeY.bandwidth() / 2 - 3)
          .attr('width', 1)
          .attr('height', 6)
          .attr('fill', 'black');
    });
  }
}
