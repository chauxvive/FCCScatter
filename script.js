// Set up SVG dimensions and margins
const svgWidth = 600;
const svgHeight = 400;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create SVG container
const svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Fetch the data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(response => response.json())
    .then(data => {
        const dataset = data.data; // The actual data array is under `data.data`

        // Transform the data into a format suitable for the bar chart
        const transformedData = dataset.map(d => ({
            date: d[0],
            value: d[1]
        }));

        // Create scales
        const xScale = d3.scaleBand()
            .domain(transformedData.map(d => d.date))
            .range([0, width])
            .padding(0.1);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(transformedData, d => d.value)])
            .nice()
            .range([height, 0]);

        // Add axes
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % Math.ceil(transformedData.length / 10) === 0))); // Adjust ticks for readability

        chart.append("g")
            .call(d3.axisLeft(yScale));

        // Draw bars
        chart.selectAll(".bar")
            .data(transformedData)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.date))
            .attr("y", d => yScale(d.value))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d.value))
            .attr("fill", "steelblue");
    })
    .catch(error => console.error("Error fetching the data:", error));
