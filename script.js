// Set up SVG dimensions and margins
const svgWidth = 800;
const svgHeight = 500;
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
            minutes: d.Seconds / 60, // Convert seconds to minutes
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
           //.ticks(d3.timeYear) // Specify yearly ticks
           //.tickFormat(d3.timeFormat("%Y")); // Format as years


        const minY = d3.min(transformedData, d => d.minutes);
        const maxY = d3.max(transformedData, d => d.minutes);
        const yScale = d3.scaleLinear()
            .domain([minY, maxY]) // Use the full range but start at the minimum
            .range([height, 0]);

        // Add axes
        const yAxis = d3.axisLeft(yScale);

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
            .attr("cy", d => yScale(d.minutes)) // Use minutes for the y-position
            .attr("r", 5)
            .attr("fill", d => d.doping ? "orange" : "steelblue") // Conditional color
            .attr("data-date", d => d.ts)
            .attr("data-gdp", d => d.minutes) // Correctly store minutes data
            .on("mouseover", (event, d) => {
                tooltip.transition().duration(200).style("opacity", 0.9);
                tooltip
                    .attr("data-date", d.ts) // Dynamically set `data-date`
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
            .text("Doping in Professional Cycling");

        chart.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 40)
            .text("Year");

        chart.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -margin.left)
            .attr("x", -height / 2)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Time in Minutes");
    })
    .catch(error => console.error("Error fetching the data:", error));