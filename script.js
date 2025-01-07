// Set up SVG dimensions and margins
const svgWidth = 900;
const svgHeight = 600;
const margin = { top: 70, right: 100, bottom: 50, left: 70 };

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
    .style("opacity", 0);

// Fetch the data
fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
    .then(response => response.json())
    .then(data => {
        if (!data || !Array.isArray(data)) {
            console.error("Invalid data format:", data);
            return;
        }

        const transformedData = data.map(d => ({
            //year: d.Year, 
            ts: new Date(d.Year, 0, 1),
            seconds: d.Seconds,
            minutes: new Date(0, 0, 0, 0, Math.floor(d.Seconds / 60), d.Seconds % 60), // Minutes and seconds as a Date object
            name: d.Name, // adding the Name value
            doping: d.Doping // doping information
        }));

        console.log(transformedData); // Debug to verify the data

        // Create scales
//        const xScale = d3.scaleLinear([1994, 2015], [0, width])

        const xScale = d3.scaleTime()
            //.domain(d3.extent(transformedData, d => d.year)) // Set the x-axis to represent years
            .domain(d3.extent(transformedData, d => d.ts))
            .range([0, width]);
           // .nice(); // Use 'nice' to round the extent to whole years

        const xAxis = d3.axisBottom(xScale)
           .ticks(20);

        const minY = d3.min(transformedData, d => d.minutes);
        const maxY = d3.max(transformedData, d => d.minutes);
        
        const yScale = d3.scaleLinear()
            .domain(d3.extent(transformedData, d => d.minutes))
            .range([height, 0]);

        // Add axes
        const yAxis = d3.axisLeft(yScale)
    .tickFormat(d3.timeFormat("%M:%S"));

        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("id", "x-axis")
            .call(xAxis);

        chart.append("g")
            .attr("id", "y-axis")
            .call(yAxis);

        // Plot points
        chart.selectAll(".dot")
        .data(transformedData)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.ts))
        .attr("cy", d => yScale(d.minutes))
        .attr("r", 7)
        .attr("fill", d => d.doping ? "orange" : "steelblue")
        .attr("data-xvalue", d => d.ts.getFullYear()) // Use year as a string
        .attr("data-yvalue", d => d.minutes)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip
                .attr("data-year", d.ts.getFullYear()) // Match the data-year
                .html(`Year: ${d.ts.getFullYear()}<br>Name: ${d.name}<br>Doping: ${d.doping || "None"}`)
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
            .style("font-size", "30px")
            .text("Doping in Professional Cycling");

        chart.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .style("font-size", "20px")
            .text("Year");

        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .style("font-size", "20px")
            .text("Time in Minutes");
        
        const legend = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${width - 100}, ${height - 100})`)
        
        const legendData = [
            { color: "orange", text: "Doping Allegations" },
            { color: "steelblue", text: "No Allegations" }
        ];
        
        legend.selectAll("circle")
            .data(legendData)
            .enter()
            .append("circle")
            .attr("cx", 0)
            .attr("cy", (d, i) => i * 20)
            .attr("r", 5)
            .attr("fill", d => d.color);
        
        legend.selectAll("text")
            .data(legendData)
            .enter()
            .append("text")
            .attr("x", 10)
            .attr("y", (d, i) => i * 20 + 4)
            .text(d => d.text)
            .style("font-size", "20px")
            .style("alignment-baseline", "middle");
    })
    .catch(error => console.error("Error fetching the data:", error));