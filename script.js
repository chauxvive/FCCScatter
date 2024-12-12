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

const tooltip = d3.select("body").append("div")   
    .attr("id", "tooltip")
    .attr("class", "tooltip")               
    .style("opacity", 0)

// Fetch the data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(response => response.json())
    .then(data => {
        const dataset = data.data;

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
        const xAxis = d3.axisBottom(xScale)
            .tickValues(xScale.domain().filter((d, i) => i % Math.ceil(transformedData.length / 10) === 0)); // Adjust ticks for readability

        const yAxis = d3.axisLeft(yScale);

        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "x-axis")
            .call(xAxis);

        chart.append("g")
            .attr("id", "y-axis")
            .call(yAxis);

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
        .attr("fill", "steelblue")
        .attr("data-date", d => d.date)
        .attr("data-gdp", d => d.value)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
                .attr("data-date", d.date) // Dynamically set `data-date`
                .html(`Date: ${d.date}<br>GDP: $${d.value} Billion`)
                .style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", () => {
            tooltip.transition().duration(500).style("opacity", 0);
        });

        // Add labels and title
        svg.append("text")
            .attr("id", "title")
            .attr("x", svgWidth / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .text("My Chart Title");

        chart.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .text("Income per capita, inflation-adjusted (dollars)");

        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left / 2)
            .attr("x", -height / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("GDP (billions)");
    })
    .catch(error => console.error("Error fetching the data:", error));
