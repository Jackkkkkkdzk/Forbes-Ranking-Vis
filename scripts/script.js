function main(){
    const forbes2023="blns2023.csv";
    const forbes2022="blns2022.csv";
    preprocess_and_viss(forbes2023,forbes2022);
}

let preprocess_and_viss=function(forbes2023,forbes2022){
    //preprocess data
    d3.csv(forbes2023).then(function(data){
        // console.log(data)
        data.forEach(d =>{
            d.age  = +d.age
            d.city = d.city
            d.country = d.country
            d.countryOfCitizenship = d.countryOfCitizenship
            d.finalWorth = +d.finalWorth/1000
            d.gender = d.gender
            d.industries = d.industries
            d.personName = d.personName
            d.position = +d.position
            d.rank = +d.rank
            d.source = d.source
            d.state = d.state
            d.title = d.title
        })
        console.log("2023",data)
        top_billionaire_overview(data,"v1_plot", "2023");
        bil_wealth_sum_by_nation(data);
        bil_wealth_by_nation_by_industry(data);// stacked barchart by industry
        bil_count_by_nation(data);
        // bil_wealth_world_choropleth(data); // not implemented
        location_us_billionaires(data);
        node_link(data);

        // line chart showing trend
        
    });
    d3.csv(forbes2022).then(function(data){
        data.forEach(d =>{
            d.age  = +d.age
            d.city = d.city
            d.country = d.country
            d.countryOfCitizenship = d.countryOfCitizenship
            d.finalWorth = +d.finalWorth/1000
            d.gender = d.gender
            d.industries = d.industries
            d.personName = d.personName
            d.position = +d.position
            d.rank = +d.rank
            d.source = d.source
            d.state = d.state
            d.title = d.title
        })
        // console.log("2022",data)
        top_billionaire_overview(data,"v2_plot","2022");
        // vis2(data);
        // vis3();
        // vis4(data);
        
    });
}


// Barchart for top 20 billionaires on Forbes ranking for certain years
let top_billionaire_overview = function(data,id, year){
    let margin = {top: 40, right: 40, bottom: 50, left: 50}
    const width = 800 - margin.left - margin.right
    const height = 700 - margin.top - margin.bottom
    const svg = d3.select(`#${id}`).append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)

    const top20 = d3.filter(data, d => d.rank <=20)
    const people_top20 = Array.from(d3.group(top20, d =>d.personName).keys())
    const countries = Array.from(d3.group(top20, d =>d.country).keys()) // ['France', 'United States', 'Mexico', 'India', 'Spain', 'China']

    const maxWealth = d3.max(top20, d =>d.finalWorth)

    const xScale = d3.scaleBand().domain(people_top20).range([0,width]).padding(0.1)
    const yScale = d3.scaleLinear().domain([0,maxWealth]).range([height,0])

    const xAxis = svg.append('g').call(d3.axisBottom(xScale)).attr('transform',`translate(${margin.left},${height})`)
    .selectAll('text').attr('transform','translate(0,0)rotate(-30)').style('text-anchor','end').style('font-size',8)
    const yAxis = svg.append('g').call(d3.axisLeft(yScale)).attr('transform',`translate(${margin.left},0)`)

    // plot title
    svg.append('text')
    .attr('x',width/2+20)
    .attr('y',margin.top/2)
    .text(`Top 20 Billionaires in ${year}`)
    .attr('text-anchor','middle')
    .attr('font-size',20)
    .attr('font-family','Times')
    .attr('font-weight','bold')

    // axis title
    svg.append("text").attr("x",750).attr("y", 625).text("Billionaire").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')
    svg.append("text").attr("x",10).attr("y", 5).text("$Billions").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')    
    
    // draw
    svg.selectAll('.v1_bars').data(top20).enter()
    .append('rect')
    .attr('x',d => xScale(d.personName))
    .attr('y',d => yScale(d.finalWorth))
    .attr('width', xScale.bandwidth())
    .attr('height',d => height - yScale(d.finalWorth))
    .attr('transform',`translate(${margin.left},0)`)
    .style('fill',"navy")
    .style('opacity',0.5)
    .attr('class', d=> d.country.replace(" ",""))
    .attr('personName', d=> d.personName)
    .attr('id', d=> d.personName.replace(" ","").replace(" & ","").replace(" ",""))
    .attr('rank', d=> d.rank)
    .attr('source', d=> d.source)
    .attr('finalWorth', d=> d.finalWorth)
    .on('mouseover',mouseover)
    .on('mousemove',mousemove)
    .on('mouseout',mouseleave)

    let tooltip = d3.select(`#${id}`).append("span")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position","absolute")
    .style("padding", "3px")

    function mouseover(event) {
        // console.log(this)
        const name = this.getAttribute('personName')
        const rank = this.getAttribute('rank')
        const source = this.getAttribute('source')
        const wealth = this.getAttribute('finalWorth')
        const country = this.getAttribute('class').replace(" ","")
        d3.selectAll(`#${name.replace(" ","").replace(" & ","").replace(" ","")}`).style('fill',"gold")
        d3.selectAll(`.${country}`).style('opacity',1)
        tooltip
        .html("Rank: " + rank + "<br>" + "Name: " + name + "<br>" + "Wealth: " + "<strong>"+ wealth + " billions </strong>" + "<br>" + "Source: " + source + "<br>" + "Country: " + country)
        .style("opacity", 0.75)
        .style("left",(event.pageX+10) + "px")
        .style("top",(event.pageY-0) + "px")
    }
    
    function mousemove(event) {
        tooltip.style("left", (event.pageX+10) + "px") 
               .style("top",(event.pageY)+ "px")
    }
    
    function mouseleave(d) {
        const div = d3.select(".topBillionOverview")
        tooltip.style("opacity", 0)
        div.selectAll('rect').style('opacity',0.6)
        div.selectAll(`rect`).style('fill','navy')



    }

}



// Sum all billionaires wealth in each country, showing the top 20 countries
let bil_wealth_sum_by_nation = function(data){
    data.forEach(d =>{
        if (d.countryOfCitizenship == 'Hong Kong' | d.countryOfCitizenship == 'Taiwan' | d.countryOfCitizenship == 'Macau'){
            d.countryOfCitizenship = 'China'
        }
    })

    let sum_by_nation = d3.rollup(data, v => d3.sum(v, d => d.finalWorth), d => d.countryOfCitizenship)
    sum_by_nation = Array.from(sum_by_nation, ([key, value]) => ({ key, value }))
    sum_by_nation.sort((a, b) => d3.descending(a.value, b.value)) // sum_by_nation.sort((a, b) => a.value - b.value)
    const top20_countries = d3.filter(sum_by_nation, d => d.value >100) // top 20 countries value coincidentally >100
    const top20_countries_name = top20_countries.map(obj =>obj.key)
    const maxTotal = d3.max(top20_countries, d => d.value)
    console.log(top20_countries)
    
    let margin = {top: 40, right: 40, bottom: 50, left: 50}
    const width = 1000 - margin.left - margin.right
    const height = 700 - margin.top - margin.bottom
    const svg = d3.select('#v3_plot').append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)
    
    const xScale = d3.scaleBand().domain(top20_countries_name).range([0,width]).padding(0.1)
    const yScale = d3.scaleLinear().domain([0,maxTotal]).range([height,0])

    const xAxis = svg.append('g').call(d3.axisBottom(xScale)).attr('transform',`translate(${margin.left},${height})`)
    .selectAll('text').attr('transform','translate(0,0)rotate(-30)').style('text-anchor','end').style('font-size',8)
    const yAxis = svg.append('g').call(d3.axisLeft(yScale)).attr('transform',`translate(${margin.left},0)`)

    // plot title
    svg.append('text')
    .attr('x',width/2+20)
    .attr('y',margin.top/2)
    .text("Summed Wealth of Billionaires in Top 20 Countries in 2023")
    .attr('text-anchor','middle')
    .attr('font-size',20)
    .attr('font-family','Times')
    .attr('font-weight','bold')

    // axis title
    svg.append("text").attr("x",950).attr("y", 625).text("Country").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')
    svg.append("text").attr("x",10).attr("y", 5).text("$Billions").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')    

    // draw
    svg.selectAll('.v3_bars').data(top20_countries).enter()
    .append('rect')
    .attr('x',d => xScale(d.key))
    .attr('y',d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height',d => height - yScale(d.value))
    .attr('transform',`translate(${margin.left},0)`)
    .style('fill',"navy")
    .style('opacity',0.5)
    .attr('total', d=> Math.round(d.value))
    .on('mouseover',mouseover)
    .on('mousemove',mousemove)
    .on('mouseout',mouseleave)

    let tooltip = d3.select('#v3_plot').append("span")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position","absolute")
    .style("padding", "3px")

    function mouseover(event) {
        d3.select(this).style('opacity',1)
        const total = this.getAttribute('total')
        tooltip.html(total + "B")
        .style("opacity", 0.75)
        .style("left",(event.pageX+10) + "px")
        .style("top",(event.pageY-0) + "px")
    }
    
    function mousemove(event) {
        tooltip.style("left", (event.pageX+10) + "px") 
               .style("top",(event.pageY)+ "px")
    }
    
    function mouseleave(d) {
        tooltip.style("opacity", 0)
        svg.selectAll(`rect`).style('opacity',0.6)

    }

}

let bil_wealth_by_nation_by_industry = function(data){
    data.forEach(d =>{
        if (d.countryOfCitizenship == 'Hong Kong' | d.countryOfCitizenship == 'Taiwan' | d.countryOfCitizenship == 'Macau'){
            d.countryOfCitizenship = 'China'
        }
    })

    let sum_by_nation = d3.rollup(data, v => d3.sum(v, d => d.finalWorth), d => d.countryOfCitizenship)
    sum_by_nation = Array.from(sum_by_nation, ([key, value]) => ({ key, value }))
    // sum_by_nation.sort((a, b) => d3.descending(a.value, b.value)) // sum_by_nation.sort((a, b) => a.value - b.value)
    sum_by_nation.sort((a, b) => d3.ascending(a.key, b.key)) // sum_by_nation.sort((a, b) => a.value - b.value)
    const top20_countries = d3.filter(sum_by_nation, d => d.value >100) // top 20 countries value coincidentally >100
    const top20_countries_name = top20_countries.map(obj =>obj.key)
    const maxTotal = d3.max(top20_countries, d => d.value)
    // console.log(top20_countries)

    let filtered = d3.filter(data,d => top20_countries_name.includes(d.countryOfCitizenship))
    filtered = filtered.sort((a,b) =>d3.ascending(a.countryOfCitizenship,b.countryOfCitizenship))
    let nations = d3.group(filtered, d => d.countryOfCitizenship)

    // console.log(nations)
    let processed = [] // contain object for each nation in top 20, in each object there is sum of wealth for each industry
    nations.forEach((nation) =>{
        let wealthByIndustry = {"Fashion & Retail":0, "Automotive":0, "Technology":0, "Finance & Investments":0 , "Media & Entertainment":0, "Telecom":0, "Diversified":0, "Food & Beverage":0, 
        "Logistics":0, "Gambling & Casinos":0, "Manufacturing":0, "Real Estate":0, "Metals & Mining":0, "Energy":0, "Healthcare":0, "Service":0, "Construction & Engineering":0, "Sports":0}
        nation.forEach((billionaire) =>{
            if(billionaire['industries'] == "Fashion & Retail"){
                wealthByIndustry["Fashion & Retail"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Automotive"){
                wealthByIndustry["Automotive"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Technology"){
                wealthByIndustry["Technology"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Finance & Investments"){
                wealthByIndustry["Finance & Investments"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Media & Entertainment"){
                wealthByIndustry["Media & Entertainment"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Telecom"){
                wealthByIndustry["Telecom"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Diversified"){
                wealthByIndustry["Diversified"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Food & Beverage"){
                wealthByIndustry["Food & Beverage"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Logistics"){
                wealthByIndustry["Logistics"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Gambling & Casinos"){
                wealthByIndustry["Gambling & Casinos"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Manufacturing"){
                wealthByIndustry["Manufacturing"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Real Estate"){
                wealthByIndustry["Real Estate"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Metals & Mining"){
                wealthByIndustry["Metals & Mining"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Energy"){
                wealthByIndustry["Energy"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Healthcare"){
                wealthByIndustry["Healthcare"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Service"){
                wealthByIndustry["Service"] += billionaire.finalWorth
            }
            else if (billionaire['industries'] == "Construction & Engineering"){
                wealthByIndustry["Construction & Engineering"] += billionaire.finalWorth
            }
            else{// else if (billionaire['industries'] == "Sports"){
                wealthByIndustry["Sports"] += billionaire.finalWorth
            }
        })
        processed.push(wealthByIndustry)
    })
    processed.forEach((element,i) =>{
        element.country = top20_countries_name[i]
    })
    // console.log('processed',processed)

    const keys = ["Fashion & Retail", "Automotive", "Technology", "Finance & Investments" , "Media & Entertainment", "Telecom", "Diversified", "Food & Beverage", 
    "Logistics", "Gambling & Casinos", "Manufacturing", "Real Estate", "Metals & Mining", "Energy", "Healthcare", "Service", "Construction & Engineering", "Sports"]
    const colorOutput = ['red','brown','orange','yellow','green','navy','purple','pink','grey','skyblue','lime','gold','lawngreen','cyan','olive','beige','orangered','violet']
    const colors = d3.scaleOrdinal().domain(keys).range(colorOutput)
    const stacked = d3.stack().keys(keys)(processed)
    // console.log('stacked',stacked)
    
    let margin = {top: 40, right: 140, bottom: 50, left: 50}
    const width = 1100 - margin.left - margin.right
    const height = 700 - margin.top - margin.bottom
    const svg = d3.select('#v3_stackedplot').append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)
    
    const xScale = d3.scaleBand().domain(top20_countries_name).range([0,width]).padding(0.1)
    const yScale = d3.scaleLinear().domain([0,maxTotal]).range([height,0])

    const xAxis = svg.append('g').call(d3.axisBottom(xScale)).attr('transform',`translate(${margin.left},${height})`)
    .selectAll('text').attr('transform','translate(0,0)rotate(-30)').style('text-anchor','end').style('font-size',8)
    const yAxis = svg.append('g').call(d3.axisLeft(yScale)).attr('transform',`translate(${margin.left},0)`)

    // plot title
    svg.append('text')
    .attr('x',width/2+20)
    .attr('y',margin.top/2)
    .text("Summed Wealth of Billionaires in Top 20 Countries by Industry in 2023")
    .attr('text-anchor','middle')
    .attr('font-size',20)
    .attr('font-family','Times')
    .attr('font-weight','bold')

    // axis title
    svg.append("text").attr("x",970).attr("y", 625).text("Country").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')
    svg.append("text").attr("x",10).attr("y", 5).text("$Billions").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')    

    svg.selectAll("stacked")
    .data(stacked).enter().append('g')
    .attr('class','stacked')
    .attr('fill', (d) => colors(d.key))
    .selectAll("rect").data(d => d).enter().append("rect")
    .attr('class', d => d.data.country)
    .attr("x", (d) => xScale(d.data.country))
    .attr("y", (d) => yScale(d[1]))
    .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr('value', d => d[0]-d[1])
    .attr('transform',`translate(${margin.left},0)`)
    .style('opacity',0.9)
    .on('mouseover',mouseover)
    .on('mousemove',mousemove)
    .on('mouseout',mouseleave)

    let tooltip = d3.select('#v3_stackedplot').append("span")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position","absolute")
    .style("padding", "3px")


    function mouseover(event) {
        // console.log(this)
        const value = Math.round(Math.abs(this.getAttribute('value')))
        const country = this.getAttribute('class')
        const industry = d3.select(this.parentNode).datum().key

        tooltip
        .html("Country: " + country + "<br>" + "Industry: " + industry + "<br>" + "Sum: " + "<strong>"+value + "B </strong>")
        .style("opacity", 0.75)
        .style("left",(event.pageX+10) + "px")
        .style("top",(event.pageY-0) + "px")
    }
    
    function mousemove(event) {
        tooltip.style("left", (event.pageX+10) + "px") 
               .style("top",(event.pageY)+ "px")
    }
    
    function mouseleave(d) {
        tooltip.style("opacity", 0)
    }

    // legend
    svg.append('circle').attr('cx',975).attr('cy',250).attr('r',4).style("fill", "red")
    svg.append("text").attr("x", 985).attr("y", 250).text("Fashion & Retail").style("font-size", "10px").attr("alignment-baseline","middle")

    svg.append('circle').attr('cx',975).attr('cy',270).attr('r',4).style("fill", "brown")
    svg.append("text").attr("x", 985).attr("y",270).text("Automotive").style("font-size", "10px").attr("alignment-baseline","middle")

    svg.append('circle').attr('cx',975).attr('cy',290).attr('r',4).style("fill", "orange")
    svg.append("text").attr("x", 985).attr("y",290).text("Technology").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',310).attr('r',4).style("fill", "yellow")
    svg.append("text").attr("x", 985).attr("y",310).text("Finance & Investments").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',330).attr('r',4).style("fill", "green")
    svg.append("text").attr("x", 985).attr("y",330).text("Media & Entertainment").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',350).attr('r',4).style("fill", "navy")
    svg.append("text").attr("x", 985).attr("y",350).text("Telecom").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',370).attr('r',4).style("fill", "purple")
    svg.append("text").attr("x", 985).attr("y",370).text("Diversified").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',390).attr('r',4).style("fill", "pink")
    svg.append("text").attr("x", 985).attr("y",390).text("Food & Beverage").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',410).attr('r',4).style("fill", "grey")
    svg.append("text").attr("x", 985).attr("y",410).text("Losgistics").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',430).attr('r',4).style("fill", "skyblue")
    svg.append("text").attr("x", 985).attr("y",430).text("Gambling & Casinos").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',450).attr('r',4).style("fill", "lime")
    svg.append("text").attr("x", 985).attr("y",450).text("Manufacturing").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',470).attr('r',4).style("fill", "gold")
    svg.append("text").attr("x", 985).attr("y",470).text("Real Estate").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',490).attr('r',4).style("fill", "lawngreen")
    svg.append("text").attr("x", 985).attr("y",490).text("Metals & Mining").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',510).attr('r',4).style("fill", "cyan")
    svg.append("text").attr("x", 985).attr("y",510).text("Energy").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',530).attr('r',4).style("fill", "olive")
    svg.append("text").attr("x", 985).attr("y",530).text("Healthcare").style("font-size", "10px").attr("alignment-baseline","middle")
    
    svg.append('circle').attr('cx',975).attr('cy',550).attr('r',4).style("fill", "beige")
    svg.append("text").attr("x", 985).attr("y",550).text("Service").style("font-size", "10px").attr("alignment-baseline","middle")

    svg.append('circle').attr('cx',975).attr('cy',570).attr('r',4).style("fill", "orangered")
    svg.append("text").attr("x", 985).attr("y",570).text("Construction & Engineering").style("font-size", "10px").attr("alignment-baseline","middle")

    svg.append('circle').attr('cx',975).attr('cy',590).attr('r',4).style("fill", "violet")
    svg.append("text").attr("x", 985).attr("y",590).text("Sports").style("font-size", "10px").attr("alignment-baseline","middle")
}






// count number of billionaires in each country and showing top 20 countries 2023
let bil_count_by_nation = function(data){
    data.forEach(d =>{
        if (d.countryOfCitizenship == 'Hong Kong' | d.countryOfCitizenship == 'Taiwan' | d.countryOfCitizenship == 'Macau'){
            d.countryOfCitizenship = 'China'
        }
    })

    let count_by_nation = d3.rollup(data, v => v.length,d => d.countryOfCitizenship)
    count_by_nation = Array.from(count_by_nation, ([key, value]) => ({ key, value }))
    count_by_nation.sort((a, b) => d3.descending(a.value, b.value)) 
    const top20_countries = d3.filter(count_by_nation, d => d.value >20) // top 20 countries value coincidentally >20
    const top20_countries_name = top20_countries.map(obj =>obj.key)
    const maxCount = d3.max(top20_countries, d => d.value)
    // console.log(top20_countries)


    let margin = {top: 40, right: 40, bottom: 50, left: 50}
    const width = 1000 - margin.left - margin.right
    const height = 700 - margin.top - margin.bottom
    const svg = d3.select('#v4_plot').append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)
    
    const xScale = d3.scaleBand().domain(top20_countries_name).range([0,width]).padding(0.1)
    const yScale = d3.scaleLinear().domain([0,maxCount]).range([height,0])

    const xAxis = svg.append('g').call(d3.axisBottom(xScale)).attr('transform',`translate(${margin.left},${height})`)
    .selectAll('text').attr('transform','translate(0,0)rotate(-30)').style('text-anchor','end').style('font-size',8)
    const yAxis = svg.append('g').call(d3.axisLeft(yScale)).attr('transform',`translate(${margin.left},0)`)

    // plot title
    svg.append('text')
    .attr('x',width/2+20)
    .attr('y',margin.top/2)
    .text("Number of Billionaires in Top 20 Countries in 2023")
    .attr('text-anchor','middle')
    .attr('font-size',20)
    .attr('font-family','Times')
    .attr('font-weight','bold')

    // axis title
    svg.append("text").attr("x",950).attr("y", 625).text("Country").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')
    svg.append("text").attr("x",10).attr("y", 5).text("Count").style("font-size", "10px").attr("alignment-baseline","middle").style('font-weight','bold')    

    // draw
    svg.selectAll('.v4_bars').data(top20_countries).enter()
    .append('rect')
    .attr('x',d => xScale(d.key))
    .attr('y',d => yScale(d.value))
    .attr('width', xScale.bandwidth())
    .attr('height',d => height - yScale(d.value))
    .attr('transform',`translate(${margin.left},0)`)
    .style('fill',"navy")
    .style('opacity',0.5)
    .attr('count', d=> Math.round(d.value))
    .on('mouseover',mouseover)
    .on('mousemove',mousemove)
    .on('mouseout',mouseleave)

    let tooltip = d3.select('#v4_plot').append("span")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("position","absolute")
    .style("padding", "3px")

    function mouseover(event) {
        d3.select(this).style('opacity',1)
        const total = this.getAttribute('count')
        tooltip.html(total)
        .style("opacity", 0.75)
        .style("left",(event.pageX+10) + "px")
        .style("top",(event.pageY-0) + "px")
    }
    
    function mousemove(event) {
        tooltip.style("left", (event.pageX+10) + "px") 
               .style("top",(event.pageY)+ "px")
    }
    
    function mouseleave(d) {
        tooltip.style("opacity", 0)
        svg.selectAll(`rect`).style('opacity',0.6)

    }

}

// sum of all worldwide billionaires wealth in each country, showing it in a choropleth 2023
let bil_wealth_world_choropleth = function(data){

}

// choropleth displaying where (which state) most US billionaires located/based 2023
let location_us_billionaires = function(data){
    // State Symbol dictionary for conversion of names and symbols.
    let stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    }
    const usa_billionaires = d3.filter(data, d => d.country == 'United States')
    // console.log(usa_billionaires)
    let bil_by_state_rollup = d3.rollup(usa_billionaires, v => v.length, d => d.state)
    bil_by_state = Array.from(bil_by_state_rollup, ([state, count]) => ({ state, count }))
    // console.log(bil_by_state)
    const maxCount = d3.max(bil_by_state, d => d.count)
    // console.log("bil_by_state_rollup",bil_by_state_rollup)


    let margin = {top: 30, right: 30, bottom: 40, left: 40}
    const width = 1000 - margin.left - margin.right
    const height = 600 - margin.top - margin.bottom
    const svg = d3.select('#usbillionaireplot').append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)
    const projection = d3.geoAlbersUsa() //  geoAlbersUsa
    const pathgeo = d3.geoPath().projection(projection) // path generator

    const colorRange = ["lightblue", "navy"];
    const log = d3.scaleLog().domain([1, maxCount]).range([0, 1]);
    const colorScale = d3.scaleSequential().domain([0, 1]).interpolator(d3.interpolateRgb(colorRange[0], colorRange[1])); // d3.interpolateBlues
    // const colorScale = d3.scaleSequential().domain([0, maxCount]).interpolator(d3.interpolateBlues); 

    const personNamesByState = d3.rollup(usa_billionaires,group => group.map((d) => "  " +d.personName),d => d.state)
    // console.log(personNamesByState)


    let tooltip = d3.select('#usbillionaireplot').append("span")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("position","absolute")
                    .style("padding", "3px")
                    .style('font-size',10)

    // let list = d3.select('#usbillionaire').append("span")
    //                 .style("opacity", 0)
    //                 .attr("class", "list")
    //                 // .style("background-color", "white")
    //                 // .style("border", "solid")
    //                 .style("border-width", "2px")
    //                 .style("border-radius", "5px")
    //                 .style("position","absolute")
    //                 .style("padding", "3px")
    //                 .style('font-size',10)
    

    const map = d3.json("./us-states1.json");
    map.then(map =>{
        // console.log(map)
        svg.selectAll('path')
           .data(map.features)
           .enter()
           .append('path')
           .attr("d",pathgeo)
           .style('fill',d => colorScale(log(bil_by_state_rollup.get(stateSym[d.properties.abbr]))))
           .attr('class',d =>stateSym[d.properties.abbr])
           .attr('count',d =>bil_by_state_rollup.get(stateSym[d.properties.abbr]))
           .on('mouseover',handleMouseOver)
           .on('mousemove',handleMouseMove)
           .on('mouseout',handleMouseOut)    

        function handleMouseOver(event){
            const stateNoBillionaire = ['North Dakota', 'New Mexico','West Virginia','Vermont','Delaware','District of Columbia', 'Alaska']
            if (stateNoBillionaire.includes(this.getAttribute('class'))){
                d3.select(this).style('fill','lightgrey')
            }
            const state = this.getAttribute('class')
            const count = Math.round(this.getAttribute('count'))
            tooltip
            .html("State: " + state + "<br>" + "Sales: " + "<strong>"+ count + "</strong>")
            .style("opacity", 0.75)
            .style("left",(event.pageX+10) + "px")
            .style("top",(event.pageY-0) + "px")

            // list.html(personNamesByState.get(state))
            // .style("opacity", 0.75)
            // .style("left",(event.pageX) + "px")
            // .style("top",(event.pageY+100) + "px")

            d3.select("#choropleth").select("#listPersonName").append('p').html(personNamesByState.get(state))

        }

        function handleMouseMove(event){
            tooltip.style("left", (event.pageX+10) + "px") 
                   .style("top",(event.pageY)+ "px")
            // list.style("left", (event.pageX) + "px") 
            //        .style("top",(event.pageY+100)+ "px")
        }

        function handleMouseOut(){
            tooltip.style('opacity',0)
            // list.style('opacity',0)
            d3.select("#choropleth").selectAll("p").html("")

        }
        
    })

}


let node_link = function(data){
    let margin = {top: 50, right: 50, bottom: 50, left: 50}
    const width = 1000 - margin.left - margin.right
    const height = 800 - margin.top - margin.bottom
    const svg = d3.select('#network').append('svg').attr('height',height + margin.top + margin.bottom).attr('width',width + margin.left + margin.right)

    const dataset = d3.json("./nodelink.json")
    const thickness = d3.scaleLinear().domain([2,3]).range([2,4])
    const size = d3.scaleLinear().domain([56,212]).range([5,30])
    const color = d3.scaleOrdinal().domain(['United States','China','France','Spain','Mexico','India']).range(['violet','red','skyblue','yellow','lightgreen','orange'])

    dataset.then(data =>{

        let tooltip = d3.select('#network').append("span")
                    .style("opacity", 0)
                    .attr("class", "tooltip")
                    .style("background-color", "white")
                    .style("border", "solid")
                    .style("border-width", "2px")
                    .style("border-radius", "5px")
                    .style("position","absolute")
                    .style("padding", "3px")
                    .style('font-size',10)

        const edges = svg.selectAll('line').data(data.edges).enter().append('line').attr("stroke", "silver").attr("stroke-width", d => thickness(d.value))
        const nodes = svg.selectAll('circle').data(data.nodes).enter().append('circle')
                            .attr('r',d =>size(d.value))
                            .style('fill',d =>color(d.country))
                            .attr('country', d=> d.country)
                            .attr('money', d=> d.value)
                            .attr('country', d=> d.country)
                            .attr('industry', d=> d.industry)
                            .on('mouseover',handleMouseOver)
                            .on('mousemove',handleMouseMove)
                            .on('mouseout',handleMouseOut)  
        const labels = svg.selectAll("text").data(data.nodes).enter().append("text").attr('class','labels').text(d =>d.name).attr("font-size", "10px").attr("dx", 12).attr("dy", 4)



        function handleMouseOver(event){
            console.log(this)
            const country = this.getAttribute('country')
            const money = Math.round(this.getAttribute('money'))
            const industry = this.getAttribute('industry')
            tooltip
            .html("Country: " + country + "<br>" + "Wealth: $" + money + " billion<br>" +"Industry: " + industry)
            .style("opacity", 0.75)
            .style("left",(event.pageX+10) + "px")
            .style("top",(event.pageY-0) + "px")

        }   
        function handleMouseMove(event){
            tooltip.style("left", (event.pageX+10) + "px") 
                   .style("top",(event.pageY)+ "px")

        }   
        function handleMouseOut(){
            tooltip.style('opacity',0)

        }   

        let simulation = d3.forceSimulation(data.nodes)
                            .force("link", d3.forceLink(data.edges).id(d => d.id))
                            .force("charge", d3.forceManyBody().strength(-15))
                            .force("center",d3.forceCenter(width/2,height/2))
                            .force('collide', d3.forceCollide().radius(d => d.value/3))


		simulation.on("tick", function() {
			edges.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
			
			nodes.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })

            labels.attr('x',d =>d.x-10).attr('y',d =>d.y)
	
		})


    })


}