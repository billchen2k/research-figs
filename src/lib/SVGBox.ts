// @ts-nocheck

import * as d3 from 'd3';

export default class SVGBox {
  private svg: any;
  private containerId: string = '';

  constructor(containerId: string) {
    if (!document.getElementById(containerId)) {
      d3.select('#app').append('svg')
          .attr('id', containerId);
    }
    this.svg = d3.select(`#${containerId}`);
    this.containerId = containerId;
  }

  public abstract draw();

  public appendDownloader() {
    // get svg element.
    const svg = document.getElementById(this.containerId);
    // get svg source.
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);
    // add name spaces.
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    // add xml declaration
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
    // convert svg source to URI data scheme.
    const url = 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(source);
    const element = document.createElement('a');
    element.download = `${this.containerId}.svg`;
    element.href = url;
    element.innerText = 'Download SVG';
    element.style.display = 'block';
    document.getElementById('app').appendChild(element);
  }
}
