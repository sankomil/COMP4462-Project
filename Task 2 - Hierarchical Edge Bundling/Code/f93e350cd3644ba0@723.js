// https://observablehq.com/@sankomil/hierarchical-edge-bundling/2@723
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Hierarchical Edge Bundling

The [Flare visualization toolkit](https://flare.prefuse.org) package hierarchy and imports.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Findings for Graph 1
First graph draws edges on songs that have difference more that 1.5 * average of the total difference. Songs that have a lot of edges are more unique`
)});
  main.variable(observer("chart1")).define("chart1", ["data1","tree","d3","id","DOM","width","line"], function(data1,tree,d3,id,DOM,width,line)
{
  const realData = {name: "", children : []}
  for (const item of data1.values()){
   realData.children.push(item) 
  }
  const root = tree(d3.hierarchy(realData)
      .sort((a, b) => (a.height - b.height)));

  const map = new Map(root.leaves().map(d => [id(d), d]));

  const context = DOM.context2d(width, width - 40);
  context.canvas.style.display = "block";
  context.canvas.style.maxWidth = "100%";
  context.canvas.style.margin = "auto";
  context.translate(width / 2, width / 2);
  line.context(context);

  for (const leaf of root.leaves()) {
    context.save();
    context.rotate(leaf.x - Math.PI / 2);
    context.translate(leaf.y, 0);
    if (leaf.x >= Math.PI) {
      context.textAlign = "right";
      context.rotate(Math.PI);
      context.translate(-3, 0);
    } else {
      context.textAlign = "left";
      context.translate(3, 0);
    }
    context.fillText(leaf.data.name, 0, 3);
    context.restore();
  }
  
  let test = {}
  context.globalCompositeOperation = "multiply";
  context.strokeStyle = "lightblue";
  for (const leaf of root.leaves()) {
    // let leaf = root.leaves()[20]
    for (const i of leaf.data.similar) {
      context.beginPath();
      line(leaf.path(map.get("." + i.name)));
      context.stroke();
    }
    
  }

  return context.canvas
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`# Findings for Graph 2
Second graph draws edges on songs that have difference less that 1/1.5 * average of the total difference. Songs that have a lot of edges, are relatively less unique than the other top 250 popular songs..`
)});
  main.variable(observer("chart2")).define("chart2", ["data2","tree","d3","id","DOM","width","line"], function(data2,tree,d3,id,DOM,width,line)
{
  const realData = {name: "", children : []}
  for (const item of data2.values()){
   realData.children.push(item) 
  }
  const root = tree(d3.hierarchy(realData)
      .sort((a, b) => (a.height - b.height)));

  const map = new Map(root.leaves().map(d => [id(d), d]));

  const context = DOM.context2d(width, width - 40);
  context.canvas.style.display = "block";
  context.canvas.style.maxWidth = "100%";
  context.canvas.style.margin = "auto";
  context.translate(width / 2, width / 2);
  line.context(context);

  for (const leaf of root.leaves()) {
    context.save();
    context.rotate(leaf.x - Math.PI / 2);
    context.translate(leaf.y, 0);
    if (leaf.x >= Math.PI) {
      context.textAlign = "right";
      context.rotate(Math.PI);
      context.translate(-3, 0);
    } else {
      context.textAlign = "left";
      context.translate(3, 0);
    }
    context.fillText(leaf.data.name, 0, 3);
    context.restore();
  }
  
  let test = {}
  context.globalCompositeOperation = "multiply";
  context.strokeStyle = "lightblue";
  for (const leaf of root.leaves()) {
    // let leaf = root.leaves()[20]
    for (const i of leaf.data.similar) {
      context.beginPath();
      line(leaf.path(map.get("." + i.name)));
      context.stroke();
    }
    
  }

  return context.canvas
}
);
  main.variable(observer("data2")).define("data2", ["d3"], async function(d3)
{
  const map = new Map;

  const imports = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/All%20songs.csv");
  
  const songNames = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/Song%20names.csv");
  
  const songPopularity = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/Song%20popularity.csv");

  const resultData = imports.map((obj, i) => {
    var retObj = {}
    retObj['name'] = songNames[i]['name']
    retObj['popularity'] = songPopularity[i]['popularity']
    retObj['acousticness'] = obj['acousticness']
    retObj['danceability'] = obj['danceability']
    retObj['energy'] = obj['energy']
    retObj['instrumentalness'] = obj['instrumentalness']
    retObj['key'] = obj['key']
    retObj['liveness'] = obj['liveness']
    retObj['loudness'] = obj['loudness']
    retObj['mode'] = obj['mode']
    retObj['speechiness'] = obj['speechiness']
    retObj['tempo'] = obj['tempo']
    retObj['valence'] = obj['valence']
    return retObj
  })
  
  // Filter on top 200 songs
  const filteredData = resultData.sort((a, b) => b.popularity - a.popularity).slice(0, 250)
  
  function computeL2Distance(compared) {
    let result = []
    filteredData.forEach( (data, index) => {
        if (data != compared) {
          let diff = {id: index, difference: 0}
          Object.keys(compared).forEach( x => {
              if (x != 'name' && x != 'popularity'){
                diff.difference = Math.sqrt(filteredData[index][x] * filteredData[index][x] + compared[x] * compared[x])
              }
            }
          )
          result.push(diff)
        }
      }
    )
    return result
  }
  
  let avg = 0
  function computeChildren(x, index) {
    const obj = {name: x['name'], similar: []}
    if (map.has(x['name'])) return map.get(x['name']);
    const diffArray = computeL2Distance(x)
    diffArray.forEach(x => avg += x.difference)
    avg /= diffArray.length
    diffArray.forEach(x => {
      if(x.difference < avg/1.55) {
        obj.similar.push(filteredData[x.id]) 
      }
    })
    
      map.set(x['name'], obj)
    
    
    return obj
  }
  
  filteredData.forEach( (x, i)  => computeChildren(x, i))
  
  return map
}
);
  main.variable(observer("data1")).define("data1", ["d3"], async function(d3)
{
  const map = new Map;

  const imports = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/All%20songs.csv");
  
  const songNames = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/Song%20names.csv");
  
  const songPopularity = await d3.csv("https://raw.githubusercontent.com/sankomil/COMP4462-Project/master/Dataset/Song%20popularity.csv");

  const resultData = imports.map((obj, i) => {
    var retObj = {}
    retObj['name'] = songNames[i]['name']
    retObj['popularity'] = songPopularity[i]['popularity']
    retObj['acousticness'] = obj['acousticness']
    retObj['danceability'] = obj['danceability']
    retObj['energy'] = obj['energy']
    retObj['instrumentalness'] = obj['instrumentalness']
    retObj['key'] = obj['key']
    retObj['liveness'] = obj['liveness']
    retObj['loudness'] = obj['loudness']
    retObj['mode'] = obj['mode']
    retObj['speechiness'] = obj['speechiness']
    retObj['tempo'] = obj['tempo']
    retObj['valence'] = obj['valence']
    return retObj
  })
  
  // Filter on top 200 songs
  const filteredData = resultData.sort((a, b) => b.popularity - a.popularity).slice(0, 250)
  
  function computeL2Distance(compared) {
    let result = []
    filteredData.forEach( (data, index) => {
        if (data != compared) {
          let diff = {id: index, difference: 0}
          Object.keys(compared).forEach( x => {
              if (x != 'name' && x != 'popularity'){
                diff.difference = Math.sqrt(filteredData[index][x] * filteredData[index][x] + compared[x] * compared[x])
              }
            }
          )
          result.push(diff)
        }
      }
    )
    return result
  }
  
  let avg = 0
  function computeChildren(x, index) {
    const obj = {name: x['name'], similar: []}
    if (map.has(x['name'])) return map.get(x['name']);
    const diffArray = computeL2Distance(x)
    diffArray.forEach(x => avg += x.difference)
    avg /= diffArray.length
    diffArray.forEach(x => {
      if(x.difference > avg*1.55) {
        obj.similar.push(filteredData[x.id]) 
      }
    })
    //if(obj.similar.length != 0){
      map.set(x['name'], obj)
    //1}
    
    return obj
  }
  
  filteredData.forEach( (x, i)  => computeChildren(x, i))
  
  return map
}
);
  main.variable(observer("id")).define("id", function(){return(
function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}
)});
  main.variable(observer("width")).define("width", function(){return(
932
)});
  main.variable(observer("radius")).define("radius", ["width"], function(width){return(
width / 2.5
)});
  main.variable(observer("line")).define("line", ["d3"], function(d3){return(
d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x)
)});
  main.variable(observer("tree")).define("tree", ["d3","radius"], function(d3,radius){return(
d3.cluster()
    .size([2 * Math.PI, radius - 100])
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
