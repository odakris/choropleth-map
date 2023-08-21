document.addEventListener("DOMContentLoaded", function () {
  const mapUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
  const dataUrl =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

  Promise.all([d3.json(mapUrl), d3.json(dataUrl)])
    .then((data) => ready(data[0], data[1]))
    .catch((err) => console.log(err));

  function ready(map, education) {
    //     PARAMETERS
    const w = 900;
    const h = 550;
    const paddingLR = 50;
    const paddingTB = 50;

    const title = "United States Educational Attainment";
    const description =
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)";
    const credit =
      "Created by <a href='https://github.com/odakris?tab=repositories' target='_blank' rel='noreferrer noopener'>Odakris</a>";

    const minEdu = d3.min(education, (d) => d.bachelorsOrHigher);
    // console.log("minEdu", minEdu);
    const maxEdu = d3.max(education, (d) => d.bachelorsOrHigher);
    // console.log("maxEdu", maxEdu);

    //     CONTAINER
    const container = d3
      .select("body")
      .append("div")
      .attr("id", "container")
      .attr("class", "flex-center");

    //     HEADER
    const header = d3
      .select("#container")
      .append("div")
      .attr("id", "header")
      .attr("class", "flex-center")
      .style("margin-bottom", "10px")
      .style("color", "linen");
    //     TITLE
    header
      .append("h1")
      .attr("id", "title")
      .html(title)
      .style("margin-bottom", "15px");
    //     DESCRIPTION
    header
      .append("h4")
      .attr("id", "description")
      .html(description)
      .style("margin-bottom", "10px");

    //     MAP CONTAINER
    const mapContainer = container.append("div").attr("id", "mapContainer");

    //     SVG
    const svg = mapContainer
      .append("svg")
      .attr("id", "choropleth")
      .attr("width", w + paddingLR)
      .attr("height", h + paddingTB)
      .attr("class", "flex-center");

    //     LEGEND
    const legendW = 400;
    const legendH = 50;
    const legendPadding = 10;

    const colors = [
      "#F6FFF1",
      "#DBFFC8",
      "#99D492",
      "#67BA94",
      "#429E92",
      "#2F8087",
      "#2E6473",
      "#2F4858",
    ];

    const colorsScale = d3.scaleQuantize().domain([0, 80]).range(colors);

    const legend = mapContainer
      .append("div")
      .attr("id", "legend")
      .attr("class", "flex-center")
      .style("color", "linen")
      .style("margin-bottom", "20px");

    const svgLegend = legend
      .append("svg")
      .attr("width", legendW + legendPadding)
      .attr("height", legendH + legendPadding);

    const scaleLegend = d3
      .scaleLinear()
      .domain([0, 8])
      .range([legendPadding, legendW - legendPadding]);

    const legendAxis = d3
      .axisBottom(scaleLegend)
      .tickFormat((d, i) => 10 * i + "%");

    svgLegend
      .append("g")
      .attr("id", "legend-axis")
      .attr("transform", "translate(0," + (legendH - legendPadding) + ")")
      .call(legendAxis);

    svgLegend
      .selectAll("rect")
      .data(colors)
      .enter()
      .append("rect")
      .attr("x", (d, i) => scaleLegend(i))
      .attr("y", legendPadding)
      .attr("width", legendW / colors.length)
      .attr("height", legendH - 2 * legendPadding)
      .attr("fill", (d, i) => colors[i]);

    //     TOOLTIP
    const tooltip = mapContainer
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0);

    //     PLOTTING MAP
    const path = d3.geoPath();

    //     PLOT MAP AND FILL COLOR ACCORDING TO EDUCATION RATE
    svg
      .append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(map, map.objects.counties).features)
      .enter()
      .append("path")
      .attr("class", "county")
      .attr("d", path)
      .attr("data-fips", (d) => d.id)
      .attr("data-education", (d) => {
        const edu = education.filter((item) => item.fips === d.id);
        return edu[0] ? edu[0].bachelorsOrHigher : 0;
      })
      .attr("fill", (d) => {
        const edu = education.filter((item) => item.fips === d.id);
        return edu[0] ? colorsScale(edu[0].bachelorsOrHigher) : colorsScale(0);
      })
      .on("mousemove", (event, d) => {
        tooltip
          .html(() => {
            const edu = education.filter((item) => item.fips === d.id);
            return (
              edu[0].area_name +
              ", " +
              edu[0].state +
              "</br>" +
              "Education Rate: " +
              (edu[0] ? edu[0].bachelorsOrHigher : 0) +
              "%"
            );
          })
          .attr("data-education", () => {
            const edu = education.filter((item) => item.fips === d.id);
            return edu[0] ? edu[0].bachelorsOrHigher : 0;
          })
          .style("top", event.pageY + 30 + "px")
          .style("left", event.pageX + 30 + "px")
          .style("opacity", 1);
      })
      .on("mouseout", (d) => tooltip.style("opacity", 0));

    //     DEFINE STATES ON MAP
    svg
      .append("path")
      .datum(
        topojson.mesh(map, map.objects.states, (a, b) => {
          return a !== b;
        })
      )
      .attr("d", path)
      .attr("stroke", "grey")
      .attr("fill", "none");

    //     CREDIT
    container
      .append("div")
      .attr("id", "credit")
      .html(credit)
      .style("color", "linen")
      .style("font-size", "14px");
  }
});
