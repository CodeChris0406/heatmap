document.addEventListener('DOMContentLoaded', function () {
    const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

    fetch(url)
        .then(response => response.json())
        .then(data => {
            createHeatMap(data);
        });

    function createHeatMap(data) {
        const baseTemperature = data.baseTemperature;
        const monthlyVariance = data.monthlyVariance;
        const width = 1200;
        const height = 600;
        const padding = 60;

        const svg = d3.select('#heatmap')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const xScale = d3.scaleBand()
            .domain(monthlyVariance.map(d => d.year))
            .range([padding, width - padding]);

        const yScale = d3.scaleBand()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
            .range([padding, height - padding]);

        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter(year => year % 10 === 0));
        const yAxis = d3.axisLeft(yScale)
            .tickFormat(month => new Date(0, month).toLocaleString('en-US', { month: 'long' }));

        svg.append('g')
            .attr('id', 'x-axis')
            .attr('transform', `translate(0, ${height - padding})`)
            .call(xAxis);

        svg.append('g')
            .attr('id', 'y-axis')
            .attr('transform', `translate(${padding}, 0)`)
            .call(yAxis);

        const colorScale = d3.scaleQuantize()
            .domain([d3.min(monthlyVariance, d => d.variance), d3.max(monthlyVariance, d => d.variance)])
            .range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);

        // Create tooltip
        const tooltip = d3.select('body').append('div')
            .attr('id', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '5px');

        // Append cells to the svg and attach tooltip events
        svg.selectAll('.cell')
            .data(monthlyVariance)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('data-month', d => d.month - 1)
            .attr('data-year', d => d.year)
            .attr('data-temp', d => baseTemperature + d.variance)
            .attr('x', d => xScale(d.year))
            .attr('y', d => yScale(d.month - 1))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('fill', d => colorScale(d.variance))
            .on('mouseover', function (event, d) {
                tooltip.style('opacity', 0.9);
                tooltip.html(`Year: ${d.year}<br>Temperature: ${baseTemperature + d.variance}°C`)
                    .attr('data-year', d.year)
                    .style('left', (event.pageX + 5) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0);
            });

        // Legend
        const legendWidth = 400;
        const legendHeight = 20;
        const legendPadding = 30;
        const legendThresholds = colorScale.thresholds();
        const legendXScale = d3.scaleLinear()
            .domain([d3.min(legendThresholds), d3.max(legendThresholds)])
            .range([0, legendWidth]);

        const legend = svg.append('g')
            .attr('id', 'legend')
            .attr('transform', `translate(${(width - legendWidth) / 2}, ${height - legendHeight - legendPadding+10})`);

        legend.selectAll('rect')
            .data(legendThresholds)
            .enter()
            .append('rect')
            .attr('x', d => legendXScale(d))
            .attr('y', 0)
            .attr('width', legendWidth / legendThresholds.length)
            .attr('height', legendHeight)
            .attr('fill', d => colorScale(d));

        const legendAxis = d3.axisBottom(legendXScale)
            .tickSize(10)
            .tickFormat(d3.format(".1f"))
            .tickValues(legendThresholds);

        legend.append('g')
            .call(legendAxis)
            .attr('transform', `translate(0, ${legendHeight})`);
    }
});
